from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from app.db.session import get_db
from app.services.resume_parser import ResumeParser
from app.models.models import Resume, Candidate
from app.core.config import settings
import json
import spacy
import PyPDF2
import docx
import re
from app.core.deps import get_current_user
from app.models.resume import ResumeAnalysis
from app.models.job import Job
from app.models.application import Application
from app.schemas.resume import ResumeAnalysisResponse

router = APIRouter()
resume_parser = ResumeParser()

# Load spaCy model for NLP
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model is not downloaded, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file):
    doc = docx.Document(file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_skills(text):
    # Common technical skills to look for
    technical_skills = [
        "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift",
        "kotlin", "go", "rust", "typescript", "html", "css", "sql", "nosql",
        "mongodb", "postgresql", "mysql", "oracle", "aws", "azure", "gcp",
        "docker", "kubernetes", "react", "angular", "vue", "node.js", "express",
        "django", "flask", "spring", "laravel", "tensorflow", "pytorch", "scikit-learn",
        "pandas", "numpy", "git", "jenkins", "ci/cd", "agile", "scrum"
    ]
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Find skills in text
    found_skills = []
    for skill in technical_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills

def extract_experience(text):
    # Use spaCy to identify entities and their relationships
    doc = nlp(text)
    
    # Look for experience-related patterns
    experience_patterns = [
        r"(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*experience",
        r"experience:\s*(\d+)\s*(?:years?|yrs?)",
        r"(\d+)\s*(?:years?|yrs?)\s*(?:in)?\s*the\s*field"
    ]
    
    experience = []
    for pattern in experience_patterns:
        matches = re.finditer(pattern, text.lower())
        for match in matches:
            experience.append(int(match.group(1)))
    
    return max(experience) if experience else 0

def extract_education(text):
    # Common education degrees
    degrees = [
        "bachelor", "master", "phd", "doctorate", "associate",
        "b.s.", "m.s.", "b.a.", "m.a.", "b.tech", "m.tech"
    ]
    
    # Look for education-related patterns
    education = []
    for degree in degrees:
        if degree in text.lower():
            # Try to extract the institution name
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ == "ORG" and degree in text[ent.start-20:ent.end+20].lower():
                    education.append({
                        "degree": degree.upper(),
                        "institution": ent.text,
                        "year": None  # Could be enhanced to extract graduation year
                    })
    
    return education

def calculate_job_match(resume_skills, job_skills, experience_years, required_experience):
    # Calculate skill match
    matched_skills = set(resume_skills) & set(job_skills)
    skill_match_score = len(matched_skills) / len(job_skills) if job_skills else 0
    
    # Calculate experience match
    experience_match_score = min(experience_years / required_experience, 1) if required_experience > 0 else 1
    
    # Combine scores (70% skills, 30% experience)
    total_score = (skill_match_score * 0.7) + (experience_match_score * 0.3)
    
    return {
        "match_score": total_score,
        "matched_skills": list(matched_skills)
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    candidate_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload and parse a resume."""
    # Validate file type
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    # Save file
    file_path = os.path.join(settings.UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(content)
        else:
            text = extract_text_from_docx(content)
        
        # Extract information
        skills = extract_skills(text)
        experience_years = extract_experience(text)
        education = extract_education(text)
        
        # Create resume record
        resume = Resume(
            candidate_id=candidate_id,
            file_path=file_path,
            skills=skills,
            experience_years=experience_years,
            education=education
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return {
            "message": "Resume uploaded and processed successfully",
            "resume_id": resume.id
        }
    
    except Exception as e:
        # Clean up file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get resume details by ID."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "candidate_id": resume.candidate_id,
        "file_path": resume.file_path,
        "parsed_data": json.loads(resume.parsed_data),
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }

@router.get("/candidate/{candidate_id}")
def get_candidate_resumes(candidate_id: int, db: Session = Depends(get_db)):
    """Get all resumes for a candidate."""
    resumes = db.query(Resume).filter(Resume.candidate_id == candidate_id).all()
    return [
        {
            "id": resume.id,
            "file_path": resume.file_path,
            "parsed_data": json.loads(resume.parsed_data),
            "created_at": resume.created_at,
            "updated_at": resume.updated_at
        }
        for resume in resumes
    ]

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    """Delete a resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    # Delete database record
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get resume and candidate information
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    candidate = db.query(Candidate).filter(Candidate.id == resume.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get all jobs
    jobs = db.query(Job).all()
    
    # Calculate matches for each job
    job_matches = []
    for job in jobs:
        # Check if application already exists
        existing_application = db.query(Application).filter(
            Application.job_id == job.id,
            Application.resume_id == resume_id
        ).first()
        
        match_result = calculate_job_match(
            resume.skills,
            job.required_skills,
            resume.experience_years,
            job.min_experience
        )
        
        job_matches.append({
            "job": job,
            "match_score": match_result["match_score"],
            "matched_skills": match_result["matched_skills"],
            "has_applied": bool(existing_application)
        })
    
    # Sort matches by score
    job_matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {
        "candidate": candidate,
        "skills": [{"name": skill, "matched": any(skill in match["matched_skills"] for match in job_matches)} for skill in resume.skills],
        "experience": resume.experience_years,
        "education": resume.education,
        "job_matches": job_matches
    } 