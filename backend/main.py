import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, files, search, dashboard, api_keys

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Customer Search API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logging.info("Database tables created/verified.")

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(search.router)
app.include_router(dashboard.router)
app.include_router(api_keys.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
