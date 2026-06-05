from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Customer
class CustomerResponse(BaseModel):
    id: int
    mobile_number: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    company: Optional[str] = None
    source_file: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SearchResponse(BaseModel):
    success: bool
    count: int
    data: List[CustomerResponse]
    total: int
    page: int
    page_size: int

# Import Task
class ImportTaskResponse(BaseModel):
    id: int
    task_id: str
    filename: str
    status: str
    total_rows: int
    processed_rows: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Server Files
class ServerFile(BaseModel):
    filename: str
    size: int
    last_modified: datetime

# API Keys
class ApiKeyCreate(BaseModel):
    client_name: str

class ApiKeyResponse(BaseModel):
    id: int
    key: str
    client_name: str
    is_active: bool
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True
