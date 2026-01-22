import { useEffect, useState } from 'react';
import { LayoutGrid, Kanban, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import { supabase } from '../lib/supabase';

interface Course {
    id: number;
    user_id: string;
    title: string;
    code: string;
    professor: string;
    credits: number;
    attendance: number;
}

type TabValue = 'overview' | 'tasks';

export default function CourseManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabValue>('overview');

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [newAttendance, setNewAttendance] = useState(0);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('id', { ascending: true });

                if (error) throw error;
                setCourses(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setNewAttendance(course.attendance || 0);
        setIsEditModalOpen(true);
    };

    const handleUpdateAttendance = async () => {
        if (!editingCourse) return;

        try {
            const { error } = await supabase
                .from('courses')
                .update({ attendance: Number(newAttendance) })
                .eq('id', editingCourse.id);

            if (error) throw error;

            setIsEditModalOpen(false);
            fetchCourses();
        } catch (error) {
            console.error('Failed to update attendance:', error);
            alert('Failed to update attendance: ' + (error as any).message);
        }
    };

    const handleDeleteCourse = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCourses();
        } catch (error) {
            console.error('Failed to delete course:', error);
            alert('Failed to delete course: ' + (error as any).message);
        }
    };

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 75) return { bg: 'bg-neon-green', text: 'text-neon-green', border: 'border-neon-green' };
        if (percentage >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
        return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
    };

    const getAttendanceStatus = (percentage: number) => {
        if (percentage >= 75) return 'EXCELLENT';
        if (percentage >= 50) return 'WARNING';
        return 'CRITICAL';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="neon-text-green text-2xl font-mono animate-neon-pulse">
                    LOADING COURSE DATA...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 custom-scrollbar">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold neon-text-purple mb-2 font-mono">
                    COURSE MANAGER
                </h1>
                <p className="text-gray-400">Track attendance and manage your academic workload</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 p-1 glass-card w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 rounded font-mono font-bold transition-all ${activeTab === 'overview'
                            ? 'bg-neon-purple text-black neon-glow-purple'
                            : 'text-gray-400 hover:text-neon-purple'
                        }`}
                >
                    <LayoutGrid className="w-5 h-5" />
                    OVERVIEW
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-2 px-6 py-3 rounded font-mono font-bold transition-all ${activeTab === 'tasks'
                            ? 'bg-neon-green text-black neon-glow-green'
                            : 'text-gray-400 hover:text-neon-green'
                        }`}
                >
                    <Kanban className="w-5 h-5" />
                    TASK BOARD
                </button>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                <div>
                    {courses.length === 0 ? (
                        <div className="glass-card cyber-border text-center py-12">
                            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO COURSES FOUND</h3>
                            <p className="text-gray-500">Add courses from the Dashboard to start tracking attendance</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => {
                                const attendanceColors = getAttendanceColor(course.attendance || 0);
                                const status = getAttendanceStatus(course.attendance || 0);

                                return (
                                    <div
                                        key={course.id}
                                        className="glass-card cyber-border hover:neon-glow-purple transition-all duration-300 group relative"
                                    >
                                        {/* Action Buttons */}
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(course)}
                                                className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/20 transition-all"
                                                title="Edit Attendance"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id, course.title)}
                                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-gray-400 hover:text-red-500 hover:bg-red-500/20 transition-all"
                                                title="Delete Course"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Course Info */}
                                        <div className="mb-6 pr-20">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-bold text-white">{course.title}</h3>
                                                <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded font-mono">
                                                    {course.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{course.professor}</p>
                                            <p className="text-xs text-gray-500 mt-1">{course.credits} Credits</p>
                                        </div>

                                        {/* Attendance Health Bar */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono text-gray-400">ATTENDANCE</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-mono font-bold ${attendanceColors.text}`}>
                                                        {status}
                                                    </span>
                                                    <span className="text-lg font-bold font-mono text-white">
                                                        {course.attendance || 0}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Health Bar */}
                                            <div className="relative">
                                                <div className="h-6 bg-cyber-gray rounded-lg overflow-hidden border-2 border-gray-700">
                                                    <div
                                                        className={`h-full ${attendanceColors.bg} transition-all duration-500 relative`}
                                                        style={{ width: `${course.attendance || 0}%` }}
                                                    >
                                                        {/* Shine effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                                    </div>
                                                </div>

                                                {/* Threshold markers */}
                                                <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-600 opacity-50"></div>
                                                <div className="absolute top-0 left-3/4 w-0.5 h-6 bg-gray-600 opacity-50"></div>
                                            </div>

                                            {/* Warning message */}
                                            {course.attendance < 75 && (
                                                <div className={`text-xs font-mono ${attendanceColors.text} flex items-center gap-1`}>
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {course.attendance < 50 ? 'Critical! Risk of detention' : 'Below recommended threshold'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <KanbanBoard />
            )}

            {/* Edit Attendance Modal */}
            {isEditModalOpen && editingCourse && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="glass-card cyber-border max-w-md w-full relative">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-neon-purple transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold neon-text-purple mb-6 font-mono">UPDATE ATTENDANCE</h2>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-1">{editingCourse.title}</h3>
                            <p className="text-sm text-gray-400">{editingCourse.professor}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-2">
                                    ATTENDANCE PERCENTAGE
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newAttendance}
                                    onChange={(e) => setNewAttendance(Number(e.target.value))}
                                    className="w-full bg-cyber-gray border-2 border-neon-purple/30 rounded-lg px-4 py-3 text-white text-2xl font-mono font-bold text-center focus:outline-none focus:border-neon-purple focus:neon-glow-purple transition-all"
                                />
                            </div>

                            {/* Visual Preview */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400 font-mono">PREVIEW</span>
                                    <span className={`font-mono font-bold ${getAttendanceColor(newAttendance).text}`}>
                                        {getAttendanceStatus(newAttendance)}
                                    </span>
                                </div>
                                <div className="h-4 bg-cyber-gray rounded-lg overflow-hidden">
                                    <div
                                        className={`h-full ${getAttendanceColor(newAttendance).bg} transition-all duration-300`}
                                        style={{ width: `${newAttendance}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-mono font-bold transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleUpdateAttendance}
                                    className="flex-1 py-3 bg-neon-purple hover:bg-neon-purple/80 text-black rounded-lg font-mono font-bold transition-all neon-glow-purple"
                                >
                                    UPDATE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
