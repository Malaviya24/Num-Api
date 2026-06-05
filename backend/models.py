from sqlalchemy import Column, String, Text, DateTime, Integer, BigInteger, Index, Boolean
from sqlalchemy.sql import func
from .database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    mobile_number = Column(String(15), nullable=False)
    full_name = Column(String(255))
    email = Column(String(255))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(20))
    company = Column(String(255))
    source_file = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_mobile", "mobile_number"),
    )

class ImportTask(Base):
    __tablename__ = "import_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(255), unique=True, index=True)
    filename = Column(String(255))
    status = Column(String(50)) # PENDING, PROCESSING, COMPLETED, FAILED
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(64), unique=True, index=True, nullable=False)
    client_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
