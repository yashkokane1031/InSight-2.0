# ⚡ InSight 2.0 — Cyberpunk Student Operating System

## 🧠 Overview

**InSight 2.0** is a full-stack academic operating system built with a cyberpunk "Netrunner" aesthetic, designed to help engineering students track performance, optimize study strategy, and prepare for exams using AI-generated, syllabus-aware notes.

At its core, InSight combines:

- **Structured academic data**
- **Real-time AI assistance**
- **High-density, futuristic UI**

…into a single, focused productivity system.

---

## 🚀 What Makes It Different

Unlike generic study tools, **InSight is context-aware**.

It understands:

- Your semester
- Your academic level
- Your performance trajectory

…and adapts AI responses accordingly.

**This is not a chatbot — it's a neural study interface.**

---

## 🧬 System Architecture (Evolution)

Since the initial prototype, InSight 2.0 now includes:

### Authentication Layer
- Supabase Auth (Email / Password)
- Custom password validation & secure session handling

### Neural Link (Athena AI)
- Integrated with Google Gemini Pro API
- Generates structured, exam-ready Markdown notes
- Contextualized by semester and subject depth

### Database & Integrity
- Supabase PostgreSQL backend
- Row Level Security (RLS)
- Foreign-key enforcement with ON DELETE CASCADE

### Deployment Pipeline
- GitHub → Vercel CI/CD
- Environment-level secret management

---

## 🎨 Core Features

### 🧠 Athena — AI Study Companion
- Real-time AI-generated study notes
- Structured, syllabus-friendly Markdown output
- Context-aware responses (not generic explanations)

### 🎯 Command Center Dashboard
- Bento-grid layout with glassmorphism UI
- CGPA tracking with historical GPA visualization
- Designed for quick cognitive parsing, not clutter

### � Security-First Design
- All secrets isolated via `.env` and Vercel encrypted variables
- Gemini & Supabase keys rotated and protected
- No sensitive data exposed client-side

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **AI Layer** | Google Gemini Pro API |
| **Backend / DB** | Supabase (PostgreSQL), Supabase Auth |
| **Visualization** | Recharts |
| **Deployment** | Vercel, GitHub |

---

## ⚙️ Local Setup & Deployment

### Environment Variables

Create a `.env` file inside the `frontend` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_google_ai_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yashkokane1031/InSight-2.0

# Install dependencies & start dev server
cd frontend
npm install
npm run dev
```

---

## 🔮 Roadmap

Planned upgrades to push InSight further:

- [ ] Mobile-responsive optimization
- [ ] Automated transcript parsing (PDF upload)
- [ ] Integrated Pomodoro study timer with cyberpunk visualizers
- [ ] Advanced analytics and performance predictions

---

## 👨‍💻 Author

**Built with 💚 by Yash Kokane**  
Engineering Student • Full-Stack Developer • AI Systems Enthusiast

*"Software should feel intentional. This one does."*
