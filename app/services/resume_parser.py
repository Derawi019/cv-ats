import spacy
import PyPDF2
import docx
import json
from typing import Dict, List, Optional
from pathlib import Path
from app.core.config import settings

class ResumeParser:
    def __init__(self):
        self.nlp = spacy.load(settings.SPACY_MODEL)
        
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using NLP."""
        doc = self.nlp(text)
        # Common technical skills and their variations
        skill_patterns = [
            "python", "java", "javascript", "c++", "c#", "ruby", "php",
            "html", "css", "react", "angular", "vue", "node.js", "django",
            "flask", "spring", "sql", "nosql", "mongodb", "postgresql",
            "aws", "azure", "gcp", "docker", "kubernetes", "git"
        ]
        
        skills = set()
        for token in doc:
            if token.text.lower() in skill_patterns:
                skills.add(token.text.lower())
        
        return list(skills)

    def extract_education(self, text: str) -> List[Dict]:
        """Extract education information."""
        doc = self.nlp(text)
        education = []
        
        # Common education keywords
        edu_keywords = ["bachelor", "master", "phd", "degree", "university", "college"]
        
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in edu_keywords):
                education.append({
                    "text": sent.text.strip(),
                    "degree": self._extract_degree(sent.text),
                    "institution": self._extract_institution(sent.text)
                })
        
        return education

    def extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience information."""
        doc = self.nlp(text)
        experience = []
        
        # Common experience keywords
        exp_keywords = ["experience", "worked", "job", "position", "role"]
        
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in exp_keywords):
                experience.append({
                    "text": sent.text.strip(),
                    "years": self._extract_years(sent.text),
                    "company": self._extract_company(sent.text)
                })
        
        return experience

    def _extract_degree(self, text: str) -> Optional[str]:
        """Extract degree from text."""
        degrees = ["bachelor", "master", "phd", "bsc", "msc", "mba"]
        text_lower = text.lower()
        
        for degree in degrees:
            if degree in text_lower:
                return degree
        return None

    def _extract_institution(self, text: str) -> Optional[str]:
        """Extract institution name from text."""
        # This is a simple implementation. In production, you might want to use
        # a more sophisticated approach with a list of known institutions
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "GPE"]:
                return ent.text
        return None

    def _extract_years(self, text: str) -> Optional[float]:
        """Extract years of experience from text."""
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ == "DATE":
                # Simple parsing of years
                try:
                    return float(ent.text.split()[0])
                except (ValueError, IndexError):
                    continue
        return None

    def _extract_company(self, text: str) -> Optional[str]:
        """Extract company name from text."""
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ == "ORG":
                return ent.text
        return None

    def parse_resume(self, file_path: str) -> Dict:
        """Parse resume and extract structured information."""
        # Determine file type and extract text
        file_extension = Path(file_path).suffix.lower()
        if file_extension == '.pdf':
            text = self.extract_text_from_pdf(file_path)
        elif file_extension == '.docx':
            text = self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")

        # Extract information
        parsed_data = {
            "skills": self.extract_skills(text),
            "education": self.extract_education(text),
            "experience": self.extract_experience(text),
            "raw_text": text
        }

        return parsed_data 