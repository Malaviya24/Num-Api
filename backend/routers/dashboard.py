from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text

from ..database import get_db
from ..models import Customer, ImportTask
from ..routers.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    # Get fast count estimate for total records
    result = await db.execute(text("SELECT reltuples::bigint FROM pg_class WHERE relname = 'customers'"))
    total_records = result.scalar() or 0
    
    if total_records < 10000:
        total_records = await db.scalar(select(func.count(Customer.id)))
        
    total_files = await db.scalar(select(func.count(ImportTask.id)).where(ImportTask.status == 'COMPLETED'))
    
    recent_uploads = await db.execute(select(ImportTask).order_by(ImportTask.created_at.desc()).limit(5))
    
    status_counts_result = await db.execute(select(ImportTask.status, func.count(ImportTask.id)).group_by(ImportTask.status))
    status_counts = {k: v for k, v in status_counts_result.all()}
    
    return {
        "total_records": total_records,
        "total_uploaded_files": total_files,
        "recent_uploads": recent_uploads.scalars().all(),
        "status_counts": status_counts
    }
