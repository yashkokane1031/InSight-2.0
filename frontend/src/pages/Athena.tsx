import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, Plus, MessageSquare, Sparkles, Trash2, Loader2, LayoutDashboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- THE BRAIN: MASTER SYSTEM INSTRUCTION ---
const SYSTEM_INSTRUCTION = `
You are an elite academic tutor and exam preparation expert.
Your Goal: Generate high-quality, exam-ready study notes based strictly on the user's provided syllabus.

PROCESS:
1.  **Input Phase:** Wait for the user to provide a syllabus module or topic.
2.  **Generation Phase:** Create structured notes containing:
    * **Core Concepts:** Brief, high-level definitions.
    * **Key Explanations:** Detailed breakdown of the mechanics.
    * **Exam Highlights:** Specific keywords or points often asked in exams.
3.  **Audit Phase:** After generating notes, explicitly list any topics from the syllabus that were NOT covered in detail, or confirm 100% coverage.

TONE: Strict, precise, and efficient. No fluff. Use Markdown formatting heavily.
`;

interface ChatSession {
    id: number;
    user_id: string;
    title: string;
    created_at: string;
}

interface ChatMessage {
    id: number;
    session_id: number;
    role: 'user' | 'model';
    content: string;
    created_at: string;
}

export default function Athena() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // --- SMART MODEL STATE ---
    const [activeModel, setActiveModel] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 1. AUTO-DISCOVER MODELS ON MOUNT
    useEffect(() => {
        const discoverModels = async () => {
            const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
            if (!API_KEY) return;

            try {
                // Ask Google what models we have access to
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
                const data = await response.json();

                if (data.models) {
                    console.log("🔍 Available Models:", data.models.map((m: any) => m.name));

                    // Filter for models that generate text
                    const validModels = data.models.filter((m: any) =>
                        m.supportedGenerationMethods?.includes("generateContent")
                    );

                    // Strategy: Find 'flash' first, then 'pro', then anything else
                    const bestModel = validModels.find((m: any) => m.name.includes("flash")) ||
                        validModels.find((m: any) => m.name.includes("pro")) ||
                        validModels[0];

                    if (bestModel) {
                        // The API returns "models/gemini-pro", we need to keep that format for the URL
                        const modelName = bestModel.name.replace("models/", "");
                        console.log("✅ Athena Selected Model:", modelName);
                        setActiveModel(modelName);
                    } else {
                        console.error("❌ No text generation models found!");
                    }
                }
            } catch (e) {
                console.error("Model Discovery Failed:", e);
            }
        };

        discoverModels();
        fetchSessions();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSessions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setSessionsLoading(false);
        }
    };

    const fetchMessages = async (sessionId: number) => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const selectSession = async (sessionId: number) => {
        setCurrentSessionId(sessionId);
        await fetchMessages(sessionId);
    };

    const startNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setInput('');
    };

    const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this chat session?')) return;

        try {
            await supabase.from('chat_messages').delete().eq('session_id', sessionId);
            await supabase.from('chat_sessions').delete().eq('id', sessionId);

            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
            fetchSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading || !userId) return;

        // Fallback if discovery failed
        const modelToUse = activeModel || "gemini-pro";

        const userMessage = input.trim();
        setInput('');
        setLoading(true);

        // Optimistic UI
        const tempMessages = [...messages, {
            id: Date.now(),
            session_id: currentSessionId || 0,
            role: 'user' as const,
            content: userMessage,
            created_at: new Date().toISOString()
        }];
        setMessages(tempMessages);

        try {
            let sessionId = currentSessionId;

            // 1. Create Session if needed
            if (!sessionId) {
                const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
                const { data: sessionData, error: sessionError } = await supabase
                    .from('chat_sessions')
                    .insert([{ user_id: userId, title }])
                    .select()
                    .single();

                if (sessionError) throw sessionError;
                sessionId = sessionData.id;
                setCurrentSessionId(sessionId);
                fetchSessions();
            }

            // 2. Save User Message
            await supabase.from('chat_messages').insert([{
                session_id: sessionId,
                role: 'user',
                content: userMessage
            }]);

            // 3. GENERATE
            const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
            const finalPrompt = `${SYSTEM_INSTRUCTION}\n\nUSER QUERY:\n${userMessage}`;

            console.log(`Sending to Model: ${modelToUse}`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
                }
            );

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Error: No response.";

            // 4. Save AI Response
            await supabase.from('chat_messages').insert([{
                session_id: sessionId,
                role: 'model',
                content: responseText
            }]);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                session_id: sessionId!,
                role: 'model',
                content: responseText,
                created_at: new Date().toISOString()
            }]);

        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorText = `⚠️ Error: ${error.message || "Failed to connect."}`;

            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                session_id: currentSessionId || 0,
                role: 'model',
                content: errorText,
                created_at: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">

            {/* SESSIONS SIDEBAR */}
            <div className="w-1/4 min-w-[250px] bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600/10 hover:bg-green-600/20 border border-green-500/50 rounded-lg text-green-400 font-bold transition-all"
                    >
                        <Plus className="w-5 h-5" /> NEW CHAT
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessionsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-500" /></div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center text-gray-600 text-sm mt-10">No history found</div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => selectSession(session.id)}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id ? 'bg-gray-800 border-l-4 border-green-500' : 'hover:bg-gray-800 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className="w-4 h-4 text-gray-500" />
                                    <span className="truncate text-sm text-gray-300">{session.title}</span>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col relative bg-black">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white">ATHENA</h1>
                        <p className="text-xs text-gray-500">Elite Academic Tutor • {activeModel || "Detecting Model..."}</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <Sparkles className="w-12 h-12 mb-4 text-purple-500/50" />
                            <p className="text-lg font-medium">System Instruction Loaded.</p>
                            <p className="text-sm">Ready for Syllabus Input...</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-green-900/20 border border-green-500/30 text-green-100 rounded-tr-none'
                                        : 'bg-purple-900/10 border border-purple-500/30 text-purple-100 rounded-tl-none'
                                    }`}>
                                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white">
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl rounded-tl-none flex items-center gap-2 text-purple-200">
                                <Loader2 className="animate-spin" size={16} /> Generating Study Notes...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur border-t border-gray-800">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Paste your syllabus module here..."
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none h-[50px]"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold p-3 rounded-lg transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}