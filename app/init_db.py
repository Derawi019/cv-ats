from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app.models.models import User, Job, Skill
from app.core.config import settings
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db() -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create admin user if not exists
        admin = db.query(User).filter(User.email == "admin@cv-ats.com").first()
        if not admin:
            admin = User(
                email="admin@cv-ats.com",
                hashed_password=pwd_context.hash("admin123"),
                is_admin=True
            )
            db.add(admin)
        
        # Create some initial skills
        skills = [
            "Python", "JavaScript", "React", "Node.js", "SQL",
            "Machine Learning", "Data Analysis", "AWS", "Docker",
            "FastAPI", "Django", "Flask", "PostgreSQL", "MongoDB"
        ]
        
        for skill_name in skills:
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                skill = Skill(name=skill_name)
                db.add(skill)
        
        # Create sample job if none exists
        if not db.query(Job).first():
            sample_job = Job(
                title="Senior Python Developer",
                description="We are looking for an experienced Python developer...",
                requirements="5+ years of Python experience...",
                min_experience=5.0,
                education_required="Bachelor's in Computer Science",
                is_active=True
            )
            # Add required skills
            python_skill = db.query(Skill).filter(Skill.name == "Python").first()
            if python_skill:
                sample_job.skills.append(python_skill)
            db.add(sample_job)
        
        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 