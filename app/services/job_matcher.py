from typing import Dict, List, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from transformers import AutoTokenizer, AutoModel
import torch
from app.core.config import settings

class JobMatcher:
    def __init__(self):
        self.nlp = spacy.load(settings.SPACY_MODEL)
        self.tokenizer = AutoTokenizer.from_pretrained(settings.BERT_MODEL)
        self.model = AutoModel.from_pretrained(settings.BERT_MODEL)
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')

    def get_bert_embedding(self, text: str) -> np.ndarray:
        """Get BERT embedding for a text."""
        # Tokenize and prepare input
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        
        # Get BERT embeddings
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Use [CLS] token embedding as sentence representation
            embeddings = outputs.last_hidden_state[:, 0, :].numpy()
        
        return embeddings[0]

    def calculate_skill_match(self, resume_skills: List[str], job_skills: List[str]) -> float:
        """Calculate skill match score between resume and job skills."""
        if not resume_skills or not job_skills:
            return 0.0
        
        # Convert to sets for easier comparison
        resume_skill_set = set(skill.lower() for skill in resume_skills)
        job_skill_set = set(skill.lower() for skill in job_skills)
        
        # Calculate Jaccard similarity
        intersection = len(resume_skill_set.intersection(job_skill_set))
        union = len(resume_skill_set.union(job_skill_set))
        
        return intersection / union if union > 0 else 0.0

    def calculate_experience_match(self, resume_exp: float, job_req_exp: float) -> float:
        """Calculate experience match score."""
        if resume_exp is None or job_req_exp is None:
            return 0.0
        
        # Simple linear scoring
        if resume_exp >= job_req_exp:
            return 1.0
        else:
            return resume_exp / job_req_exp

    def calculate_education_match(self, resume_edu: List[Dict], job_req_edu: str) -> float:
        """Calculate education match score."""
        if not resume_edu or not job_req_edu:
            return 0.0
        
        # Simple education level matching
        edu_levels = {
            "phd": 4,
            "master": 3,
            "bachelor": 2,
            "associate": 1
        }
        
        job_level = edu_levels.get(job_req_edu.lower(), 0)
        resume_levels = [edu_levels.get(edu["degree"].lower(), 0) for edu in resume_edu if edu["degree"]]
        
        if not resume_levels:
            return 0.0
        
        max_resume_level = max(resume_levels)
        return 1.0 if max_resume_level >= job_level else max_resume_level / job_level

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts using BERT."""
        # Get BERT embeddings
        emb1 = self.get_bert_embedding(text1)
        emb2 = self.get_bert_embedding(text2)
        
        # Calculate cosine similarity
        similarity = cosine_similarity([emb1], [emb2])[0][0]
        return float(similarity)

    def match_resume_to_job(self, resume_data: Dict, job_data: Dict) -> Tuple[float, Dict]:
        """Match a resume to a job and return match score and detailed breakdown."""
        # Calculate individual component scores
        skill_score = self.calculate_skill_match(
            resume_data.get("skills", []),
            job_data.get("required_skills", [])
        )
        
        experience_score = self.calculate_experience_match(
            resume_data.get("experience_years", 0),
            job_data.get("min_experience", 0)
        )
        
        education_score = self.calculate_education_match(
            resume_data.get("education", []),
            job_data.get("education_required", "")
        )
        
        # Calculate semantic similarity between resume and job description
        semantic_score = self.calculate_semantic_similarity(
            resume_data.get("raw_text", ""),
            job_data.get("description", "")
        )
        
        # Calculate weighted final score
        weights = {
            "skills": 0.3,
            "experience": 0.25,
            "education": 0.2,
            "semantic": 0.25
        }
        
        final_score = (
            weights["skills"] * skill_score +
            weights["experience"] * experience_score +
            weights["education"] * education_score +
            weights["semantic"] * semantic_score
        )
        
        # Prepare detailed breakdown
        breakdown = {
            "skill_match": skill_score,
            "experience_match": experience_score,
            "education_match": education_score,
            "semantic_match": semantic_score,
            "weights": weights
        }
        
        return final_score, breakdown

    def rank_candidates(self, candidates: List[Dict], job_data: Dict) -> List[Dict]:
        """Rank multiple candidates for a job."""
        ranked_candidates = []
        
        for candidate in candidates:
            score, breakdown = self.match_resume_to_job(candidate, job_data)
            ranked_candidates.append({
                "candidate_id": candidate.get("id"),
                "name": candidate.get("name"),
                "match_score": score,
                "breakdown": breakdown
            })
        
        # Sort by match score in descending order
        ranked_candidates.sort(key=lambda x: x["match_score"], reverse=True)
        
        return ranked_candidates 