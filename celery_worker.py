import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.celery_app import celery_app  # noqa: E402
from backend import tasks  # noqa: E402, F401
