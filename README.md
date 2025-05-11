# CV-ATS (CV Applicant Tracking System)

A modern Applicant Tracking System with CV parsing and job matching capabilities.

## Features

- Resume parsing and analysis
- Job posting and management
- Candidate tracking
- Application management
- Interactive UI with modern design
- Advanced search and filtering
- Job matching algorithm

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- spaCy for NLP
- PyPDF2 and python-docx for document parsing

### Frontend
- React
- Material-UI
- Axios
- React Router

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cv-ats.git
cd cv-ats
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
python app/init_db.py
```

3. Set up the frontend:
```bash
cd frontend
npm install
# or
yarn install
```

## Running the Application

1. Start the backend server:
```bash
# From the root directory
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
# From the frontend directory
npm start
# or
yarn start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
cv-ats/
├── app/                    # Backend application
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   └── utils/             # Utility functions
├── frontend/              # Frontend application
│   ├── public/           # Static files
│   └── src/              # Source files
├── uploads/              # Uploaded files
├── .env.example          # Example environment variables
├── requirements.txt      # Python dependencies
└── README.md            # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the frontend components
- FastAPI for the backend framework
- spaCy for natural language processing 