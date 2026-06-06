import os
import uuid
from backend.config import settings
from backend.tasks.import_tasks import import_file_task
from backend.database import SyncSessionLocal
from backend.models import ImportTask

def run_bulk_import():
    db = SyncSessionLocal()
    upload_dir = settings.UPLOAD_DIR
    
    if not os.path.exists(upload_dir):
        print(f"Upload directory {upload_dir} does not exist.")
        return

    print("--- STARTING BULK IMPORT ---")
    count = 0
    
    for root, dirs, files in os.walk(upload_dir):
        for f in files:
            if f.startswith('~$') or f.startswith('._'):
                continue
            if f.lower().endswith(('.csv', '.xlsx')):
                filepath = os.path.join(root, f)
                display_name = os.path.relpath(filepath, upload_dir)
                
                # Check if this file has already been queued or imported
                existing = db.query(ImportTask).filter(ImportTask.filename == display_name).order_by(ImportTask.created_at.desc()).first()
                if existing and existing.status in ["COMPLETED", "PROCESSING", "PENDING"]:
                    print(f"⏩ Skipped: {display_name} (Already {existing.status})")
                    continue

                task_id = str(uuid.uuid4())
                
                # 1. Register task in the database so it shows up in your dashboard
                new_task = ImportTask(
                    task_id=task_id,
                    filename=display_name,
                    status="PENDING"
                )
                db.add(new_task)
                db.commit()
                
                # 2. Send the file to the Celery worker queue instantly
                import_file_task.delay(task_id, filepath)
                
                print(f"✅ Queued: {display_name} (Task ID: {task_id})")
                count += 1
            
    print(f"--- SUCCESS: {count} files added to the processing queue! ---")

if __name__ == "__main__":
    run_bulk_import()
