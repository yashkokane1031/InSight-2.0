import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<AuthMode>('login');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    setSuccess('Login successful! Redirecting...');
                    setTimeout(() => navigate('/'), 1000);
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    setSuccess('Account created! Please check your email to verify your account.');
                    setTimeout(() => setMode('login'), 3000);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-deep-black">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Login Card */}
            <div className="glass-card cyber-border max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-10 h-10 text-neon-green animate-neon-pulse" />
                        <h1 className="text-4xl font-bold neon-text-green font-mono">InSight</h1>
                    </div>
                    <p className="text-gray-400 text-sm">v2.0 // CYBERPUNK EDITION</p>
                    <div className="mt-4 h-1 w-20 mx-auto bg-gradient-to-r from-neon-green to-neon-purple rounded-full"></div>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6 p-1 glass-card">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 px-4 rounded font-mono font-bold transition-all ${mode === 'login'
                                ? 'bg-neon-green text-black neon-glow-green'
                                : 'text-gray-400 hover:text-neon-green'
                            }`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-2 px-4 rounded font-mono font-bold transition-all ${mode === 'signup'
                                ? 'bg-neon-purple text-black neon-glow-purple'
                                : 'text-gray-400 hover:text-neon-purple'
                            }`}
                    >
                        SIGN UP
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-mono text-gray-400 mb-2">
                            EMAIL ADDRESS
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-green" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="user@example.com"
                                className="w-full bg-cyber-gray border-2 border-neon-green/30 rounded-lg pl-12 pr-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:neon-glow-green transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-mono text-gray-400 mb-2">
                            PASSWORD
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full bg-cyber-gray border-2 border-neon-purple/30 rounded-lg pl-12 pr-4 py-3 text-white font-mono focus:outline-none focus:border-neon-purple focus:neon-glow-purple transition-all"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                            <p className="text-neon-green text-sm">{success}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-mono font-bold transition-all ${mode === 'login'
                                ? 'bg-neon-green hover:bg-neon-green/80 text-black neon-glow-green'
                                : 'bg-neon-purple hover:bg-neon-purple/80 text-black neon-glow-purple'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'PROCESSING...' : mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-500 font-mono">
                        SECURE CONNECTION // ENCRYPTED
                    </p>
                </div>
            </div>
        </div>
    );
}
