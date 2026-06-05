from .worker import celery_app
from ..services.file_processor import process_file_sync

@celery_app.task(name="import_file_task", bind=True)
def import_file_task(self, task_id: str, filepath: str):
    process_file_sync(task_id, filepath)
    return {"status": "success", "task_id": task_id, "filepath": filepath}
