import sys
from pathlib import Path

# Ensure project root is on sys.path so `from backend...` imports work
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.celery_app import celery_app

def _safe_get(obj, key, default=None):
    return obj.get(key, default) if obj else default


@celery_app.task(bind=True)
def finalize_task(self, session_id: str, lat: float, lng: float, city: str, state: str, language_code: str):
    """Celery task to run the full agent pipeline and persist results.

    This mirrors the previous background finalize logic.
    """
    try:
        # Import inside task to access the current app's modules and DB objects
        from backend import phoenix_backend as backend

        backend.SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "processing", "progress": "starting finalize"}})
        session_doc = backend.SESSIONS.find_one({"_id": session_id})
        if not session_doc:
            backend.SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "error", "error": "session missing during finalize"}})
            return {"error": "session missing"}

        condition_report = session_doc.get("condition_report", {})
        diagnostic_answers = session_doc.get("diagnostic_answers", {})
        user_location = {"lat": lat, "lng": lng, "city": city, "state": state}

        backend.SESSIONS.update_one({"_id": session_id}, {"$set": {"progress": "running agent pipeline"}})
        pipeline_output = backend.run_agent_pipeline(condition_report, diagnostic_answers, user_location, session_id)

        passport_id = str(__import__("uuid").uuid4())
        recommendation = _safe_get(pipeline_output.get("circularity_output"), "recommendation", "unknown")

        ifixit_data = session_doc.get("ifixit_data") or pipeline_output.get("ifixit_data") or {}

        final_doc = {
            "passport_id": passport_id,
            "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
            "user_location": user_location,
            "language": language_code,
            "condition_report": {k: v for k, v in condition_report.items() if not k.startswith("_")},
            "diagnostic_answers": diagnostic_answers,
            "agent_outputs": pipeline_output,
            "ifixit_data": ifixit_data,
            "recommendation": recommendation,
            "confidence": _safe_get(_safe_get(pipeline_output, "circularity_output", {}), "confidence", 0),
        }

        backend.ASSESSMENTS.insert_one(final_doc)
        backend.update_impact_ledger(pipeline_output.get("impact_output", {}), recommendation)

        summary_text = _safe_get(pipeline_output.get("action_output", {}), "user_summary", "Assessment complete.")
        try:
            summary_audio = backend.sarvam_text_to_speech(summary_text, language_code)
        except Exception:
            summary_audio = b""
        summary_audio_b64 = __import__("base64").b64encode(summary_audio).decode("utf-8") if summary_audio else ""

        backend.SESSIONS.update_one({"_id": session_id}, {"$set": {
            "status": "done",
            "passport_id": passport_id,
            "recommendation": recommendation,
            "confidence": final_doc["confidence"],
            "agent_outputs": pipeline_output,
            "summary_text": summary_text,
            "summary_audio_b64": summary_audio_b64,
            "progress": "complete"
        }})

        return {"passport_id": passport_id, "status": "done"}
    except Exception as e:
        # best-effort: write error into session
        try:
            from backend import phoenix_backend as backend
            backend.SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "error", "error": str(e)}})
        except Exception:
            pass
        raise
