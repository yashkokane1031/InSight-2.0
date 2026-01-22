import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Athena from './pages/Athena';
import CourseManager from './pages/CourseManager';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-deep-black">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Dashboard />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/athena"
          element={
            <ProtectedRoute>
              <Athena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-deep-black">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <CourseManager />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-deep-black">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Profile />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
