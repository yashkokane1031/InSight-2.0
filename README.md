# InSight 2.0 - Cyberpunk Student Performance Dashboard

A full-stack academic operating system with a hacker/netrunner aesthetic that tracks engineering performance and integrates AI-powered study tools.

## 🎨 Features

### 🎯 Command Center (Dashboard)
- **Bento Grid Layout** with glassmorphism cards
- **CGPA/GPA Tracking** with interactive line charts (Recharts)
- **Attendance Monitoring** with circular progress indicators
- **Pending Assignments** task list with priority levels
- **Subject-wise Attendance** breakdown

### 🧠 Neural Link (AI Study Tool)
- Paste any syllabus topic
- Get AI-generated exam-ready notes in Markdown
- Copy-to-clipboard functionality
- Beautiful markdown rendering with cyberpunk styling

### 📚 Course Manager
- Grid view of all current semester courses
- **Syllabus Completion** progress tracking
- **Attendance Percentage** per course
- Professor information and credits
- Color-coded status indicators

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Recharts (Data visualization)
- React Router (Navigation)
- React Markdown (Notes rendering)

**Backend:**
- FastAPI (Python)
- Pydantic (Data validation)
- Uvicorn (ASGI server)
- Supabase (Database - ready for integration)

## 🎨 Design Philosophy

**Theme:** Cyberpunk/Netrunner Dark Mode
- **Colors:** Deep black (#0a0a0a), Neon Green (#00ff41), Neon Purple (#b026ff)
- **Typography:** Inter (UI), JetBrains Mono (data/code)
- **Effects:** Glassmorphism, Neon glows, Smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

The backend will run on `http://localhost:8000`

### API Documentation

Once the backend is running:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints

- `GET /api/stats` - Dashboard statistics (CGPA, GPA history, attendance)
- `GET /api/courses` - Current semester courses
- `GET /api/assignments` - Pending assignments
- `POST /api/generate-notes` - Generate AI study notes (currently mocked)

## 🎯 Project Structure

```
InSight-2.0/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NeuralLink.tsx
│   │   │   └── CourseManager.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── backend/
    ├── app/
    │   └── main.py
    ├── requirements.txt
    └── README.md
```

## 🔮 Future Enhancements

- [ ] Real LLM integration for Neural Link (OpenAI/Gemini)
- [ ] Supabase database integration
- [ ] User authentication (Supabase Auth)
- [ ] Real-time data sync
- [ ] Assignment submission tracking
- [ ] Study timer and Pomodoro integration
- [ ] Performance analytics and insights
- [ ] Mobile responsive optimization
- [ ] Dark/Light theme toggle (currently dark only)

## 📸 Screenshots

*(Screenshots will be added after first run)*

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - Feel free to use this project as you wish.

---

**Built with 💚 by Yash Kokane**
*"Your Academic Operating System"*
