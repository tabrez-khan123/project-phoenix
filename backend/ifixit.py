"""
iFixit API integration for Phoenix v2.

Fetches real repair guides, repairability scores, and part data from iFixit's
public REST API (https://www.ifixit.com/api/2.0/). This data grounds the Repair
Agent with authoritative information instead of hallucinated estimates.

Attribution: Repair data provided by iFixit (https://www.ifixit.com)
"""

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

IFIXIT_BASE = "https://www.ifixit.com/api/2.0"

_session = requests.Session()
_retries = Retry(total=2, backoff_factor=0.5, status_forcelist=(429, 500, 502, 503, 504))
_adapter = HTTPAdapter(max_retries=_retries)
_session.mount("https://", _adapter)

HEADERS = {
    "User-Agent": "PhoenixV2/1.0 (circular-economy device assessment; contact: admin@phoenixv2.app)"
}


def _search_device(brand: str, model: str) -> str | None:
    """Search iFixit for a device and return the best-matching device identifier."""
    query = f"{brand} {model}".strip()
    if query in ("unknown unknown", "unknown", ""):
        return None
    try:
        resp = _session.get(
            f"{IFIXIT_BASE}/search/{requests.utils.quote(query)}",
            params={"doctypes": "device", "limit": 3},
            headers=HEADERS,
            timeout=8,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        for r in results:
            if r.get("dataType") == "device":
                return r.get("title")
        # fallback: any result
        if results:
            return results[0].get("title")
    except Exception as e:
        print(f"[iFixit] device search failed: {e}", flush=True)
    return None


def _get_device_info(device_title: str) -> dict:
    """Fetch iFixit device info including repairability score and summary."""
    try:
        slug = device_title.replace(" ", "_")
        resp = _session.get(
            f"{IFIXIT_BASE}/wikis/CATEGORY/{slug}",
            headers=HEADERS,
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "title": data.get("display_title", device_title),
            "repairability_score": data.get("repairability_score"),
            "image_url": (data.get("image") or {}).get("standard"),
            "url": f"https://www.ifixit.com/Device/{slug}",
        }
    except Exception as e:
        print(f"[iFixit] device info fetch failed: {e}", flush=True)
    return {}


def _get_guides(device_title: str, limit: int = 3) -> list[dict]:
    """Fetch repair guides for a device from iFixit."""
    try:
        slug = device_title.replace(" ", "_")
        resp = _session.get(
            f"{IFIXIT_BASE}/guides",
            params={"filter": f"device={slug}", "limit": limit, "order": "views"},
            headers=HEADERS,
            timeout=8,
        )
        resp.raise_for_status()
        guides = resp.json()
        return [
            {
                "title": g.get("title", ""),
                "difficulty": g.get("difficulty", ""),
                "url": f"https://www.ifixit.com{g.get('url', '')}",
                "steps": g.get("steps_count", 0),
                "image_url": ((g.get("image") or {}).get("thumbnail")),
            }
            for g in (guides if isinstance(guides, list) else [])
        ]
    except Exception as e:
        print(f"[iFixit] guides fetch failed: {e}", flush=True)
    return []


def get_repair_data(brand: str, model: str) -> dict:
    """
    Main entry point. Given a device brand + model, returns:
    - device info (title, repairability score, iFixit URL)
    - up to 3 repair guides (title, difficulty, URL, step count)
    - attribution metadata

    Always returns a dict — falls back to empty fields on any failure.
    """
    result = {
        "source": "iFixit",
        "attribution": "Repair guides and repairability data provided by iFixit (https://www.ifixit.com)",
        "device_found": False,
        "device_title": None,
        "repairability_score": None,
        "device_url": None,
        "device_image_url": None,
        "guides": [],
    }

    device_title = _search_device(brand, model)
    if not device_title:
        print(f"[iFixit] No device match for '{brand} {model}'", flush=True)
        return result

    print(f"[iFixit] Found device: '{device_title}'", flush=True)
    result["device_found"] = True
    result["device_title"] = device_title

    device_info = _get_device_info(device_title)
    result["repairability_score"] = device_info.get("repairability_score")
    result["device_url"] = device_info.get("url")
    result["device_image_url"] = device_info.get("image_url")

    guides = _get_guides(device_title)
    result["guides"] = guides
    print(f"[iFixit] Retrieved {len(guides)} guides for '{device_title}'", flush=True)

    return result
