import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, TrendingUp, Calendar, Plus, Trash2, X, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Course {
    id: number;
    user_id: string;
    title: string;
    professor: string;
    credits: number;
    attendance: number;
    completion: number;
}

interface AcademicRecord {
    id: number;
    user_id: string;
    semester_name: string;
    gpa: number;
}

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [academicHistory, setAcademicHistory] = useState<AcademicRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

    // Form State (Aligned with DB Schema)
    const [newCourse, setNewCourse] = useState({ title: '', professor: '', credits: 3 });
    const [newGrade, setNewGrade] = useState({ semester_name: '', gpa: '' });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            // Fetch Courses
            const { data: coursesData } = await supabase
                .from('courses')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: true });

            if (coursesData) setCourses(coursesData);

            // Fetch Academic History
            const { data: historyData } = await supabase
                .from('academic_history')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: true });

            if (historyData) setAcademicHistory(historyData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddCourse = async () => {
        if (!newCourse.title || !user) return;

        const { error } = await supabase.from('courses').insert([{
            user_id: user.id,
            title: newCourse.title,
            professor: newCourse.professor,
            credits: Number(newCourse.credits) || 3,
            attendance: 0,
            completion: 0
        }]);

        if (!error) {
            setIsCourseModalOpen(false);
            setNewCourse({ title: '', professor: '', credits: 3 });
            fetchData();
        } else {
            alert("Failed to add course: " + error.message);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        await supabase.from('courses').delete().eq('id', id);
        fetchData();
    };

    const handleAddGrade = async () => {
        if (!newGrade.semester_name || !newGrade.gpa || !user) return;

        const { error } = await supabase.from('academic_history').insert([{
            user_id: user.id,
            semester_name: newGrade.semester_name,
            gpa: Number(newGrade.gpa)
        }]);

        if (!error) {
            setIsGradeModalOpen(false);
            setNewGrade({ semester_name: "", gpa: "" });
            fetchData();
        } else {
            alert("Failed to add grade: " + (error as any).message);
        }
    };

    const handleDeleteGrade = async (id: number, semesterName: string) => {
        if (!confirm(`Delete ${semesterName}?`)) return;

        try {
            const { error } = await supabase
                .from('academic_history')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Failed to delete grade:', error);
            alert('Failed to delete grade: ' + (error as any).message);
        }
    };

    // Calculations
    const currentCGPA = academicHistory.length > 0
        ? (academicHistory.reduce((acc, curr) => acc + Number(curr.gpa), 0) / academicHistory.length).toFixed(2)
        : "N/A";

    const totalCredits = courses.reduce((acc, curr) => acc + (curr.credits || 0), 0);
    const avgAttendance = courses.length > 0
        ? Math.round(courses.reduce((acc, curr) => acc + (curr.attendance || 0), 0) / courses.length)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="neon-text-green text-2xl font-mono animate-neon-pulse">
                    INITIALIZING SYSTEM...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 custom-scrollbar">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold neon-text-green mb-2 font-mono">COMMAND CENTER</h1>
                    <p className="text-gray-400">System Status: <span className="text-neon-green">OPERATIONAL</span></p>
                </div>
                <button
                    onClick={() => setIsCourseModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-neon-green/10 hover:bg-neon-green/20 border-2 border-neon-green/30 rounded-lg text-neon-green font-mono font-bold transition-all hover:neon-glow-green"
                >
                    <Plus className="w-5 h-5" />
                    ADD COURSE
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* CGPA Card */}
                <div className="glass-card cyber-border hover:neon-glow-green transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neon-green font-mono flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            CGPA
                        </h2>
                        <span className="text-3xl font-bold text-white font-mono">{currentCGPA}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                        Based on {academicHistory.length} semester{academicHistory.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Credits Card */}
                <div className="glass-card cyber-border hover:neon-glow-purple transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neon-purple font-mono flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            CREDITS
                        </h2>
                        <span className="text-3xl font-bold text-white font-mono">{totalCredits}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                        Active Courses: <span className="text-neon-green font-semibold">{courses.length}</span>
                    </div>
                </div>

                {/* Attendance Card */}
                <div className="glass-card cyber-border hover:neon-glow-purple transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neon-purple font-mono flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            ATTENDANCE
                        </h2>
                        <span className="text-3xl font-bold text-white font-mono">{avgAttendance}%</span>
                    </div>
                    <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                        <div className="h-full bg-neon-purple" style={{ width: `${avgAttendance}%` }} />
                    </div>
                </div>
            </div>

            {/* GPA Chart */}
            <div className="glass-card cyber-border mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-neon-green font-mono flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        GPA TRAJECTORY
                    </h2>
                    <button
                        onClick={() => setIsGradeModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-neon-purple/10 hover:bg-neon-purple/20 border border-neon-purple/30 rounded-lg text-neon-purple font-mono text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        UPDATE GRADES
                    </button>
                </div>
                {academicHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={academicHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                            <XAxis
                                dataKey="semester_name"
                                stroke="#b026ff"
                                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                            />
                            <YAxis
                                domain={[0, 10]}
                                stroke="#b026ff"
                                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #b026ff',
                                    borderRadius: '8px',
                                    fontFamily: 'JetBrains Mono'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="gpa"
                                stroke="#b026ff"
                                strokeWidth={3}
                                dot={{ fill: '#b026ff', r: 6 }}
                                activeDot={{ r: 8, fill: '#00ff41' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 font-mono">
                        No academic history yet. Click "UPDATE GRADES" to add your first semester.
                    </div>
                )}
            </div>

            {/* Course Grid */}
            <div>
                <h2 className="text-2xl font-bold neon-text-green font-mono mb-6">ACTIVE COURSES</h2>
                {courses.length === 0 ? (
                    <div className="glass-card cyber-border text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO ACTIVE COURSES</h3>
                        <p className="text-gray-500 mb-6">Start your semester by adding courses</p>
                        <button
                            onClick={() => setIsCourseModalOpen(true)}
                            className="px-6 py-3 bg-neon-green hover:bg-neon-green/80 text-black font-bold rounded-lg font-mono transition-all neon-glow-green"
                        >
                            ADD YOUR FIRST COURSE
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="glass-card cyber-border hover:neon-glow-green transition-all duration-300 group relative">
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-gray-400 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="mb-4 pr-10">
                                    <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                                    <p className="text-sm text-gray-400">{course.professor}</p>
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Attendance</span>
                                        <span className="text-neon-green font-mono">{course.attendance || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-green" style={{ width: `${course.attendance || 0}%` }} />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-700 flex justify-between text-sm">
                                    <span className="text-gray-400">Credits</span>
                                    <span className="text-neon-green font-mono font-bold">{course.credits}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Modal */}
            {
                isCourseModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="glass-card cyber-border max-w-md w-full relative">
                            <button
                                onClick={() => setIsCourseModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-neon-green transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold neon-text-green mb-6 font-mono">ADD NEW COURSE</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-2">COURSE TITLE</label>
                                    <input
                                        className="w-full bg-cyber-gray border-2 border-neon-green/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:neon-glow-green transition-all"
                                        placeholder="e.g., Data Structures & Algorithms"
                                        value={newCourse.title}
                                        onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-2">PROFESSOR</label>
                                    <input
                                        className="w-full bg-cyber-gray border-2 border-neon-purple/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-purple focus:neon-glow-purple transition-all"
                                        placeholder="e.g., Dr. Smith"
                                        value={newCourse.professor}
                                        onChange={e => setNewCourse({ ...newCourse, professor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-2">CREDITS</label>
                                    <input
                                        className="w-full bg-cyber-gray border-2 border-neon-green/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:neon-glow-green transition-all"
                                        placeholder="3"
                                        type="number"
                                        value={newCourse.credits}
                                        onChange={e => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => setIsCourseModalOpen(false)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-mono transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleAddCourse}
                                        className="px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-black rounded-lg font-mono font-bold transition-all neon-glow-green"
                                    >
                                        ADD COURSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Grade Modal */}
            {
                isGradeModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <div className="glass-card cyber-border max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setIsGradeModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-neon-purple transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold neon-text-purple mb-6 font-mono">MANAGE GRADES</h2>

                            {/* Add New Grade Section */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-sm font-mono text-gray-400 uppercase">Add New Semester</h3>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-2">SEMESTER NAME</label>
                                    <input
                                        className="w-full bg-cyber-gray border-2 border-neon-purple/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-purple focus:neon-glow-purple transition-all"
                                        placeholder="e.g., Sem 1"
                                        value={newGrade.semester_name}
                                        onChange={e => setNewGrade({ ...newGrade, semester_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-2">GPA (0-10)</label>
                                    <input
                                        className="w-full bg-cyber-gray border-2 border-neon-green/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:neon-glow-green transition-all"
                                        placeholder="e.g., 8.5"
                                        type="number"
                                        step="0.01"
                                        value={newGrade.gpa}
                                        onChange={e => setNewGrade({ ...newGrade, gpa: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleAddGrade}
                                    className="w-full py-3 bg-neon-purple hover:bg-neon-purple/80 text-black rounded-lg font-mono font-bold transition-all neon-glow-purple"
                                >
                                    ADD GRADE
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-6"></div>

                            {/* Existing Grades Section */}
                            <div>
                                <h3 className="text-sm font-mono text-gray-400 uppercase mb-4">Academic History</h3>
                                {academicHistory.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 font-mono text-sm">
                                        No grades recorded yet
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {academicHistory.map((record) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between p-3 bg-cyber-gray rounded-lg border border-gray-700 hover:border-neon-purple/30 transition-all group"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-mono text-white font-bold">{record.semester_name}</div>
                                                    <div className="text-sm text-neon-green font-mono">GPA: {record.gpa}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteGrade(record.id, record.semester_name)}
                                                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-gray-400 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Grade"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
