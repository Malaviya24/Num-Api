import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import ApiKey
from ..schemas import ApiKeyCreate, ApiKeyResponse
from ..routers.auth import get_current_user

router = APIRouter(prefix="/api/keys", tags=["api_keys"])

@router.post("/", response_model=ApiKeyResponse)
async def create_api_key(key_data: ApiKeyCreate, db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    raw_key = secrets.token_hex(32) # Generate 64 char hex string
    
    new_key = ApiKey(
        key=raw_key,
        client_name=key_data.client_name,
        is_active=True,
        usage_count=0
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    
    return new_key

@router.get("/", response_model=list[ApiKeyResponse])
async def get_api_keys(db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    result = await db.execute(select(ApiKey).order_by(ApiKey.created_at.desc()))
    return result.scalars().all()

@router.delete("/{key_id}")
async def revoke_api_key(key_id: int, db: AsyncSession = Depends(get_db), user: str = Depends(get_current_user)):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id))
    api_key = result.scalars().first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key not found")
        
    api_key.is_active = False
    await db.commit()
    return {"message": "API Key revoked successfully"}
