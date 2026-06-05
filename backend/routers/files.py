import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..config import settings
from ..database import get_db
from ..models import ImportTask
from ..schemas import ServerFile, ImportTaskResponse
from ..routers.auth import get_current_user
from ..tasks.import_tasks import import_file_task

router = APIRouter(prefix="/api/files", tags=["files"])

@router.get("/", response_model=list[ServerFile])
async def list_files(user: str = Depends(get_current_user)):
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        return []
        
    files = []
    for f in os.listdir(upload_dir):
        if f.lower().endswith(('.csv', '.xlsx')):
            filepath = os.path.join(upload_dir, f)
            stat = os.stat(filepath)
            files.append(ServerFile(
                filename=f,
                size=stat.st_size,
                last_modified=datetime.fromtimestamp(stat.st_mtime)
            ))
    return files

@router.post("/import/{filename}")
async def trigger_import(filename: str, db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
        
    result = await db.execute(select(ImportTask).where(ImportTask.filename == filename))
    task = result.scalars().first()
    if task and task.status in ["PENDING", "PROCESSING"]:
        return {"message": "File is already being processed", "task_id": task.task_id}
        
    task_id = str(uuid.uuid4())
    new_task = ImportTask(
        task_id=task_id,
        filename=filename,
        status="PENDING",
    )
    db.add(new_task)
    await db.commit()
    
    # Trigger Celery Task
    import_file_task.delay(task_id, filepath)
    
    return {"message": "Import triggered", "task_id": task_id}

@router.get("/imports", response_model=list[ImportTaskResponse])
async def get_import_tasks(db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    result = await db.execute(select(ImportTask).order_by(ImportTask.created_at.desc()).limit(20))
    return result.scalars().all()
