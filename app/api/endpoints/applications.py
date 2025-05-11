from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.deps import get_db, get_current_user
from ...models.application import Application
from ...models.job import Job
from ...models.resume import Resume
from ...models.candidate import Candidate
from ...schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new job application."""
    # Check if job exists
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if resume exists
    resume = db.query(Resume).filter(Resume.id == application.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check if application already exists
    existing_application = db.query(Application).filter(
        Application.job_id == application.job_id,
        Application.resume_id == application.resume_id
    ).first()
    if existing_application:
        raise HTTPException(status_code=400, detail="Application already exists")
    
    # Create new application
    new_application = Application(
        job_id=application.job_id,
        resume_id=application.resume_id,
        status="pending",
        match_score=resume.match_score  # This should be calculated based on job requirements
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return new_application

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all applications."""
    applications = db.query(Application).all()
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get application by ID."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update application status."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update application status
    application.status = application_update.status
    db.commit()
    db.refresh(application)
    
    return application

@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete an application."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application deleted successfully"} 