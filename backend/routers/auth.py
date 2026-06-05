from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
import jwt
from jwt.exceptions import InvalidTokenError
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..config import settings
from ..schemas import Token, TokenData
from ..security import create_access_token
from ..database import get_db
from ..models import ApiKey

router = APIRouter(prefix="/api", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def verify_admin_credentials(username: str, password: str):
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        return True
    return False

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
        
    if token_data.username != settings.ADMIN_USERNAME:
        raise credentials_exception
        
    return token_data.username

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not verify_admin_credentials(form_data.username, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_search_auth(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if x_api_key:
        result = await db.execute(select(ApiKey).where(ApiKey.key == x_api_key, ApiKey.is_active == True))
        api_key_obj = result.scalars().first()
        if not api_key_obj:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or inactive API Key")
        
        api_key_obj.usage_count += 1
        await db.commit()
        return {"type": "api_key", "client": api_key_obj.client_name}
        
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            username = await get_current_user(token)
            return {"type": "admin", "client": username}
        except HTTPException:
            pass

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authentication (requires JWT or X-API-Key)")
