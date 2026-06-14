import os
from celery import Celery

CELERY_BROKER = os.environ.get("CELERY_BROKER", "redis://localhost:6379/0")
CELERY_BACKEND = os.environ.get("CELERY_BACKEND", CELERY_BROKER)

celery_app = Celery(
    "phoenix",
    broker=CELERY_BROKER,
    backend=CELERY_BACKEND,
    include=["backend.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
