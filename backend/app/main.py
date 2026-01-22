from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
app = FastAPI()

# 1. CORS - Allow Frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Gemini AI Config
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class NoteRequest(BaseModel):
    topic: str

# --- ENDPOINTS ---

@app.get('/api/stats')
def get_stats():
    # MATCHING FRONTEND EXPECTATIONS EXACTLY:
    return {
        "cgpa": 8.5,
        "semester_gpa": 8.7,
        "attendance": 85,
        # The frontend expects a LIST of objects here, NOT a number.
        "pending_assignments": [
            {"id": 1, "title": "Binary Search Tree Implementation", "course": "Data Structures", "due_date": "2026-01-25", "priority": "high"},
            {"id": 2, "title": "SQL Query Optimization", "course": "DBMS", "due_date": "2026-01-28", "priority": "medium"},
            {"id": 3, "title": "TCP/IP Protocol Analysis", "course": "Computer Networks", "due_date": "2026-01-30", "priority": "low"}
        ],
        # The frontend expects 'gpa_history', NOT 'gpa_data'
        "gpa_history": [
            {"semester": "Sem 1", "gpa": 8.2},
            {"semester": "Sem 2", "gpa": 8.4},
            {"semester": "Sem 3", "gpa": 8.3},
            {"semester": "Sem 4", "gpa": 8.6},
            {"semester": "Sem 5", "gpa": 8.7}
        ],
        "attendance_breakdown": [
            {"subject": "Data Structures", "percentage": 88},
            {"subject": "DBMS", "percentage": 92},
            {"subject": "Computer Networks", "percentage": 78},
            {"subject": "Operating Systems", "percentage": 85},
            {"subject": "Web Development", "percentage": 90}
        ]
    }

@app.get('/api/courses')
def get_courses():
    return {
        "courses": [
            {"id": "CS301", "name": "Data Structures & Algorithms", "completion": 65, "attendance": 88, "credits": 4, "professor": "Dr. Smith"},
            {"id": "CS302", "name": "Database Management Systems", "completion": 72, "attendance": 92, "credits": 4, "professor": "Dr. Johnson"},
            {"id": "CS303", "name": "Computer Networks", "completion": 58, "attendance": 78, "credits": 3, "professor": "Dr. Williams"},
            {"id": "CS304", "name": "Operating Systems", "completion": 80, "attendance": 85, "credits": 4, "professor": "Dr. Brown"},
            {"id": "CS305", "name": "Web Development", "completion": 90, "attendance": 90, "credits": 3, "professor": "Dr. Davis"}
        ]
    }

@app.get('/api/assignments')
def get_assignments():
    return {
        "assignments": [
            {"id": 1, "title": "Binary Search Tree Implementation", "course": "Data Structures", "due_date": "2026-01-25", "priority": "high"},
            {"id": 2, "title": "SQL Query Optimization", "course": "DBMS", "due_date": "2026-01-28", "priority": "medium"},
            {"id": 3, "title": "TCP/IP Protocol Analysis", "course": "Computer Networks", "due_date": "2026-01-30", "priority": "low"}
        ]
    }

@app.post("/api/generate-notes")
async def generate_notes(request: NoteRequest):
    try:
        # Using the verified working model from connectivity test
        model_name = 'models/gemini-flash-latest'
        model = genai.GenerativeModel(model_name)
        prompt = f"You are an expert engineering tutor. Generate structured, markdown-formatted study notes for: {request.topic}. Include Key Concepts, Code Examples, and Exam Tips."
        
        response = model.generate_content(prompt)
        return {
            "topic": request.topic,
            "notes": response.text,
            "generated_at": "2026-01-22T00:25:00"
        }
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "topic": request.topic,
            "notes": f"# Error\n\nCould not generate notes for {request.topic}.\n\nReason: {str(e)}",
            "generated_at": "2026-01-22T00:25:00"
        }
