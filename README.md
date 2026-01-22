# ⚡ InSight 2.0 - Cyberpunk Student OS

**Status: Live & Production Ready** 🚀  
**URL:** [https://in-sight-2-0.vercel.app/](https://in-sight-2-0.vercel.app/)

InSight 2.0 is a full-stack academic operating system designed with a "Netrunner" aesthetic. It transforms the engineering experience by combining performance tracking with a direct neural link to Google's Gemini AI for exam preparation.

---

## 🛠️ Evolution: What’s New
Since the initial prototype, the following systems are now **fully operational**:
* **Authentication:** Secured by Supabase Auth (Email/Password) with custom password validation.
* **Neural Link (Athena):** Integrated with **Google Gemini Pro API** for real-time, exam-ready study notes.
* **Database:** Live Supabase integration with **PostgreSQL**, utilizing RLS (Row Level Security) and `ON DELETE CASCADE` for data integrity.
* **Deployment:** CI/CD pipeline established via **GitHub and Vercel**.

---

## 🎨 Features

### 🧠 Neural Link (AI Study Tool)
* **Real-time AI:** Uses Google Gemini to generate structured Markdown notes.
* **Academic Context:** Athena understands your current semester and level to tailor her responses.

### 🎯 Command Center (Dashboard)
* **Bento Grid Layout:** High-density data visualization with glassmorphism.
* **Performance Metrics:** Real-time tracking of CGPA (targeting 10-pointer streaks) and GPA history.

### 🔒 Security First
* **Env Management:** Secured via `.gitignore` and Vercel encrypted environment variables.
* **API Protection:** Revoked and rotated keys for Gemini and Supabase to prevent unauthorized usage.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Intelligence** | Google Gemini Pro API |
| **Backend/DB** | Supabase (PostgreSQL), Supabase Auth |
| **Charts** | Recharts |
| **Deployment** | Vercel (Frontend), GitHub (Version Control) |

---

## 🚀 Deployment & Setup

### Environment Variables
To run this project, you must create a `.env` file in the `frontend` directory with the following:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_google_ai_key

### Installation

# Clone the repo
git clone [https://github.com/yashkokane1031/InSight-2.0](https://github.com/yashkokane1031/InSight-2.0)

# Install & Start Frontend
cd frontend
npm install
npm run dev

## 🔮 Future Roadmap
[ ] Mobile Responsive Optimization: Implementing a custom sidebar toggle for mobile users.
[ ] Automated Transcript Parsing: Upload PDFs to auto-update academic history.
[ ] Study Timer: Integrated Pomodoro clock with cyberpunk visualizers.

Built with 💚 by Yash Kokane 

