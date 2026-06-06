import time
from backend.database import SyncSessionLocal
from backend.models import ImportTask

def check_status():
    db = SyncSessionLocal()
    tasks = db.query(ImportTask).all()
    
    completed = [t for t in tasks if t.status == "COMPLETED"]
    processing = [t for t in tasks if t.status == "PROCESSING"]
    pending = [t for t in tasks if t.status == "PENDING"]
    failed = [t for t in tasks if t.status == "FAILED"]
    
    print("\n" + "="*30)
    print("      📊 IMPORT STATUS")
    print("="*30)
    print(f"🟢 COMPLETED : {len(completed)}")
    print(f"🟡 PROCESSING: {len(processing)}")
    print(f"⚪ PENDING   : {len(pending)}")
    print(f"🔴 FAILED    : {len(failed)}")
    print("-"*30)
    print(f"Total Files  : {len(tasks)}")
    print("="*30 + "\n")

if __name__ == "__main__":
    check_status()
