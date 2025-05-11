from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, jobs, candidates, resumes, applications
from app.core.config import settings

app = FastAPI(
    title="CV-ATS API",
    description="API for CV Applicant Tracking System",
    version="1.0.0",
    root_path="",  # This ensures the app works at the base URL
    docs_url="/docs",  # Swagger UI will be available at /docs
    redoc_url="/redoc"  # ReDoc will be available at /redoc
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.BASE_URL],  # Only allow requests from your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Authentication"])
app.include_router(jobs.router, prefix=settings.API_V1_STR, tags=["Jobs"])
app.include_router(candidates.router, prefix=settings.API_V1_STR, tags=["Candidates"])
app.include_router(resumes.router, prefix=settings.API_V1_STR, tags=["Resumes"])
app.include_router(applications.router, prefix=settings.API_V1_STR, tags=["Applications"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CV-ATS API",
        "docs": f"{settings.BASE_URL}/docs",
        "base_url": settings.BASE_URL
    }

# For Vercel serverless deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 