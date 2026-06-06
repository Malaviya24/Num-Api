from backend.database import SyncSessionLocal
from backend.models import ImportTask

def run_show_errors():
    db = SyncSessionLocal()
    failed = db.query(ImportTask).filter(ImportTask.status == "FAILED").all()
    
    if not failed:
        print("No failed tasks found!")
        return
        
    print(f"Found {len(failed)} failed tasks. Here are the exact error messages:\n")
    for t in failed:
        print(f"📁 File: {t.filename}")
        print(f"❌ Error: {t.error_message}")
        print("-" * 50)

if __name__ == "__main__":
    run_show_errors()
