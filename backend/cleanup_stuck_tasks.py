import os
from backend.config import settings
from backend.tasks.import_tasks import import_file_task
from backend.database import SyncSessionLocal
from backend.models import ImportTask

def run_cleanup():
    db = SyncSessionLocal()
    
    # 1. Delete all tasks that are Excel lock files (~$)
    lock_file_tasks = db.query(ImportTask).filter(ImportTask.filename.like('%~$%')).all()
    for task in lock_file_tasks:
        db.delete(task)
        print(f"🗑️ Deleted invalid lock file task: {task.filename}")
    
    db.commit()

    # 2. Find all remaining FAILED and PENDING tasks
    stuck_tasks = db.query(ImportTask).filter(ImportTask.status.in_(["FAILED", "PENDING"])).all()
    
    count = 0
    for task in stuck_tasks:
        filepath = os.path.join(settings.UPLOAD_DIR, task.filename)
        
        if not os.path.exists(filepath):
            print(f"❌ File not found on disk, deleting task: {task.filename}")
            db.delete(task)
            continue
            
        # Reset and requeue
        task.status = "PENDING"
        task.error_message = None
        db.commit()
        
        import_file_task.delay(task.task_id, filepath)
        print(f"✅ Re-Queued stuck task: {task.filename}")
        count += 1
            
    db.commit()
    print(f"--- SUCCESS: Cleaned up lock files and re-queued {count} valid tasks! ---")

if __name__ == "__main__":
    run_cleanup()
