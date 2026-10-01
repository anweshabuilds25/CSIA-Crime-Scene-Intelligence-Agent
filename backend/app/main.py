import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .case_management import models  # noqa: F401  (registers tables)
from .case_management.database import Base, engine
from .case_management.routes import router as case_management_router
from .timeline_suggestions.routes import router as timeline_router
from .nlp_engine.routes import router as nlp_router
from .image_analysis.routes import router as image_analysis_router
from .shared.exceptions import register_exception_handlers

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CSIA API",
    description="Crime Scene Intelligence Assistant",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(case_management_router)                      # already /api/v1
app.include_router(timeline_router, prefix="/api/v1")           # was missing prefix
app.include_router(nlp_router, prefix="/api/v1/nlp", tags=["nlp"])
app.include_router(image_analysis_router, prefix="/api/v1/image-analysis", tags=["Image Analysis"])


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}
