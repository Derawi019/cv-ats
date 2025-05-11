from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .job import Job
from .candidate import Candidate

class ApplicationBase(BaseModel):
    job_id: int
    resume_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(ApplicationBase):
    id: int
    status: str
    match_score: float
    created_at: datetime
    updated_at: datetime
    job: Job
    candidate: Candidate

    class Config:
        from_attributes = True 