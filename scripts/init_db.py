from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.models import Base, User, Skill
from app.db.session import get_password_hash

def init_db():
    # Create database engine
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user if not exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            db.add(admin)
        
        # Add common skills
        common_skills = [
            "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP",
            "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Django",
            "Flask", "Spring", "SQL", "NoSQL", "MongoDB", "PostgreSQL",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git"
        ]
        
        for skill_name in common_skills:
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                skill = Skill(name=skill_name)
                db.add(skill)
        
        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 