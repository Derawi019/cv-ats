from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Smart Resume Screening System",
    description="An intelligent system for automated resume screening and candidate ranking",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart Resume Screening System API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Import and include routers
from app.api.endpoints import resumes, jobs, candidates, auth

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"]) 