import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, GraduationCap, Building2, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface Profile {
    id: string;
    user_id: string;
    full_name: string;
    university: string;
    semester: string;
}

export default function Profile() {
    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form Fields
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [semester, setSemester] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    setProfile(data); // Sets the 'profile' variable
                    setFullName(data.full_name || '');
                    setUniversity(data.university || '');
                    setSemester(data.semester || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setShowSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const updates = {
                user_id: user.id,
                full_name: fullName,
                university: university,
                semester: semester,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates, { onConflict: 'user_id' });

            if (error) throw error;

            // Update local state to reflect changes immediately
            setProfile(prev => ({ ...prev, ...updates } as Profile));

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="neon-text-green text-2xl font-mono animate-neon-pulse">
                    LOADING PROFILE...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 custom-scrollbar text-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold neon-text-purple mb-2 font-mono">
                        SETTINGS
                    </h1>
                    <p className="text-gray-400">Personalize your InSight experience</p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 glass-card border-2 border-neon-green/50 p-4 flex items-center gap-3 animate-pulse rounded-lg bg-green-900/20">
                        <CheckCircle className="w-6 h-6 text-neon-green" />
                        <span className="text-neon-green font-mono font-bold">Profile saved successfully!</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: EDIT FORM */}
                    <div className="glass-card cyber-border p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-green-400 font-mono mb-2 flex items-center gap-2">
                                <User size={20} /> EDIT DETAILS
                            </h2>
                            <p className="text-sm text-gray-500">Update your student information below.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                />
                            </div>

                            {/* University */}
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                                    University
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="e.g., MIT"
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Current Semester */}
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                                    Current Semester
                                </label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        placeholder="e.g., Semester 6"
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-2">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-black rounded-lg font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW CARD (THE FIX) */}
                    <div className="space-y-6">
                        {/* ID CARD VISUALIZATION: Uses 'profile' variable to show saved data */}
                        <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 relative overflow-hidden group">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                            <div className="relative z-10">
                                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CreditCard size={14} /> Student ID Preview
                                </h3>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-green-500/30 flex items-center justify-center text-2xl shadow-lg shadow-green-500/10">
                                        🎓
                                    </div>
                                    <div>
                                        {/* FIX: Reading from 'profile' here fixes the TS Error */}
                                        <h2 className="text-xl font-bold text-white tracking-wide">
                                            {profile?.full_name || "Student Name"}
                                        </h2>
                                        <p className="text-sm text-green-400 font-mono">
                                            {profile?.university || "University Name"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">SEMESTER</p>
                                        <p className="font-mono text-sm text-white">{profile?.semester || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">STATUS</p>
                                        <p className="font-mono text-sm text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            ACTIVE
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg">
                            <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                                💡 Why this matters?
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Athena uses your profile data (like <strong>{profile?.semester || "your semester"}</strong>) to tailor its study notes specifically for your level. Keep this updated for the best results!
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}