from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..database import get_db
from ..models import Customer
from ..schemas import SearchResponse
from ..routers.auth import get_search_auth
from ..services.number_utils import normalize_mobile

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("/{mobile}", response_model=SearchResponse)
@router.get("/", response_model=SearchResponse)
async def search_customers(
    mobile: str = None, 
    mobile_number: str = None,
    page: int = 1, 
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    auth_info: dict = Depends(get_search_auth)
):
    target_mobile = mobile or mobile_number
    normalized = normalize_mobile(target_mobile)
    if not normalized:
        return SearchResponse(success=False, count=0, data=[], total=0, page=page, page_size=page_size)
        
    # Count total exact matches
    count_query = select(func.count(Customer.id)).where(Customer.mobile_number == normalized)
    total = await db.scalar(count_query)
    
    # Get paginated data
    query = select(Customer).where(Customer.mobile_number == normalized).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    customers = result.scalars().all()
    
    return SearchResponse(
        success=True,
        count=len(customers),
        data=customers,
        total=total,
        page=page,
        page_size=page_size
    )
