from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, jobs, candidates, resumes, applications
from app.core.config import settings

app = FastAPI(
    title="CV-ATS API",
    description="API for CV Applicant Tracking System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api", tags=["Candidates"])
app.include_router(resumes.router, prefix="/api", tags=["Resumes"])
app.include_router(applications.router, prefix="/api", tags=["Applications"])

@app.get("/")
async def root():
    return {"message": "Welcome to CV-ATS API"}

# For Vercel serverless deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 