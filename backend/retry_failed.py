import os
from backend.config import settings
from backend.tasks.import_tasks import import_file_task
from backend.database import SyncSessionLocal
from backend.models import ImportTask

def run_retry_failed():
    db = SyncSessionLocal()
    # Find all tasks that failed
    failed_tasks = db.query(ImportTask).filter(ImportTask.status == "FAILED").all()
    
    if not failed_tasks:
        print("🎉 No failed files found! You are all good.")
        return

    print(f"--- RETRYING {len(failed_tasks)} FAILED FILES ---")
    count = 0
    
    for task in failed_tasks:
        # Reconstruct the absolute path using the filename
        filepath = os.path.join(settings.UPLOAD_DIR, task.filename)
        
        if not os.path.exists(filepath):
            print(f"❌ File not found on disk, skipping: {task.filename}")
            continue
            
        # Reset the status back to PENDING
        task.status = "PENDING"
        task.error_message = None  # Clear the old error
        db.commit()
        
        # Blast it back to the Celery worker queue
        import_file_task.delay(task.task_id, filepath)
        
        print(f"✅ Re-Queued: {task.filename}")
        count += 1
            
    print(f"--- SUCCESS: {count} failed files added back to the processing queue! ---")

if __name__ == "__main__":
    run_retry_failed()
