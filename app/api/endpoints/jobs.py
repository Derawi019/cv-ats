from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Job, Skill, Application, Resume
from app.services.job_matcher import JobMatcher
import json

router = APIRouter()
job_matcher = JobMatcher()

@router.post("/")
def create_job(
    title: str,
    description: str,
    requirements: str,
    min_experience: float,
    education_required: str,
    required_skills: List[str],
    db: Session = Depends(get_db)
):
    """Create a new job posting."""
    # Create job record
    job = Job(
        title=title,
        description=description,
        requirements=requirements,
        min_experience=min_experience,
        education_required=education_required
    )
    
    # Add required skills
    for skill_name in required_skills:
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill:
            skill = Skill(name=skill_name)
            db.add(skill)
        job.skills.append(skill)
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "min_experience": job.min_experience,
        "education_required": job.education_required,
        "required_skills": [skill.name for skill in job.skills]
    }

@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get job details by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "min_experience": job.min_experience,
        "education_required": job.education_required,
        "required_skills": [skill.name for skill in job.skills],
        "is_active": job.is_active,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }

@router.get("/")
def list_jobs(
    skip: int = 0,
    limit: int = 10,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all jobs with optional filtering."""
    query = db.query(Job)
    if active_only:
        query = query.filter(Job.is_active == True)
    
    jobs = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "min_experience": job.min_experience,
            "education_required": job.education_required,
            "required_skills": [skill.name for skill in job.skills],
            "is_active": job.is_active,
            "created_at": job.created_at
        }
        for job in jobs
    ]

@router.put("/{job_id}")
def update_job(
    job_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    requirements: Optional[str] = None,
    min_experience: Optional[float] = None,
    education_required: Optional[str] = None,
    required_skills: Optional[List[str]] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Update a job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update fields if provided
    if title is not None:
        job.title = title
    if description is not None:
        job.description = description
    if requirements is not None:
        job.requirements = requirements
    if min_experience is not None:
        job.min_experience = min_experience
    if education_required is not None:
        job.education_required = education_required
    if is_active is not None:
        job.is_active = is_active
    
    # Update skills if provided
    if required_skills is not None:
        job.skills = []
        for skill_name in required_skills:
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                skill = Skill(name=skill_name)
                db.add(skill)
            job.skills.append(skill)
    
    db.commit()
    db.refresh(job)
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "min_experience": job.min_experience,
        "education_required": job.education_required,
        "required_skills": [skill.name for skill in job.skills],
        "is_active": job.is_active,
        "updated_at": job.updated_at
    }

@router.get("/{job_id}/candidates")
def get_matching_candidates(job_id: int, db: Session = Depends(get_db)):
    """Get ranked list of candidates matching a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all resumes
    resumes = db.query(Resume).all()
    
    # Prepare job data for matching
    job_data = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "min_experience": job.min_experience,
        "education_required": job.education_required,
        "required_skills": [skill.name for skill in job.skills]
    }
    
    # Prepare candidate data for matching
    candidates = []
    for resume in resumes:
        parsed_data = json.loads(resume.parsed_data)
        candidate_data = {
            "id": resume.candidate_id,
            "resume_id": resume.id,
            "raw_text": parsed_data.get("raw_text", ""),
            "skills": parsed_data.get("skills", []),
            "education": parsed_data.get("education", []),
            "experience_years": parsed_data.get("experience", [{}])[0].get("years", 0) if parsed_data.get("experience") else 0
        }
        candidates.append(candidate_data)
    
    # Rank candidates
    ranked_candidates = job_matcher.rank_candidates(candidates, job_data)
    
    return ranked_candidates 