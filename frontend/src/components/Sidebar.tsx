import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, BookOpen, LogOut, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Command Center' },
    { path: '/athena', icon: Sparkles, label: 'Athena' },
    { path: '/courses', icon: BookOpen, label: 'Course Manager' },
    { path: '/profile', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const closeMobileMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Toggle Button - Only visible on mobile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-cyber-gray border border-neon-green/20 text-neon-green hover:bg-neon-green/10 transition-all duration-300 neon-glow-green"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop Overlay - Only visible on mobile when menu is open */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static
                w-64 h-screen bg-cyber-gray border-r border-neon-green/20 flex-col
                transition-transform duration-300 ease-in-out
                z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:flex
            `}>
                {/* Logo/Brand */}
                <div className="p-6 border-b border-neon-green/20">
                    <h1 className="text-2xl font-bold neon-text-green font-mono">
                        InSight
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">v2.0 // CYBERPUNK</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm
                  transition-all duration-300 group
                  ${isActive
                                            ? 'bg-neon-green/10 text-neon-green border-l-4 border-neon-green neon-glow-green'
                                            : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/5 border-l-4 border-transparent'
                                        }
                `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'animate-neon-pulse' : 'group-hover:animate-neon-pulse'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-neon-green/20">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm
                        text-red-400 hover:text-red-300 hover:bg-red-500/10 
                        border-l-4 border-transparent hover:border-red-500
                        transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:animate-pulse" />
                        <span>LOGOUT</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neon-green/20">
                    <div className="glass-card p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <div className="w-2 h-2 bg-neon-green rounded-full animate-neon-pulse"></div>
                            <span className="font-mono">SYSTEM STATUS</span>
                        </div>
                        <div className="text-neon-green font-mono text-sm">OPERATIONAL</div>
                    </div>
                </div>
            </div>
        </>
    );
}