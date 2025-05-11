from pydantic import BaseModel
from typing import List, Optional
from .job import Job
from .candidate import Candidate

class Education(BaseModel):
    degree: str
    institution: str
    year: Optional[int] = None

class Skill(BaseModel):
    name: str
    matched: bool

class JobMatch(BaseModel):
    job: Job
    match_score: float
    matched_skills: List[str]
    has_applied: bool

class ResumeAnalysisResponse(BaseModel):
    candidate: Candidate
    skills: List[Skill]
    experience: int
    education: List[Education]
    job_matches: List[JobMatch]

    class Config:
        from_attributes = True 