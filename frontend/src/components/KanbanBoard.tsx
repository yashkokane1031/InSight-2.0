import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { GripVertical, CheckCircle2, Clock, Archive, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Task {
    id: string;
    user_id: string;
    title: string;
    subject: string;
    status: string;
    created_at: string;
}

interface Column {
    id: string;
    title: string;
    color: string;
    icon: any;
}

const columns: Column[] = [
    { id: 'backlog', title: 'BACKLOG', color: 'neon-purple', icon: Archive },
    { id: 'in_progress', title: 'IN PROGRESS', color: 'blue-500', icon: Clock },
    { id: 'mastered', title: 'MASTERED', color: 'neon-green', icon: CheckCircle2 },
];

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskSubject, setNewTaskSubject] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('id', { ascending: true });

                if (error) throw error;
                setTasks(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        console.log('Drag result:', { source, destination, draggableId });

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const taskId = draggableId; // Use UUID string directly
        const newStatus = destination.droppableId;

        console.log('Updating task ID:', taskId, 'to status:', newStatus);

        // Store previous state for rollback
        const previousTasks = [...tasks];

        // Optimistically update UI immediately
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));

        try {
            console.log('Updating task:', taskId, 'to status:', newStatus);

            const { data, error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId)
                .select();

            if (error) {
                console.error('Database error:', error);
                throw error;
            }

            console.log('Task updated successfully:', data);
        } catch (error) {
            console.error('Failed to update task:', error);
            // Rollback to previous state on error
            setTasks(previousTasks);
            alert('Failed to update task. Please try again.');
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { error } = await supabase
                .from('tasks')
                .insert([
                    {
                        user_id: user.id,
                        title: newTaskTitle,
                        subject: newTaskSubject,
                        status: 'backlog',
                    },
                ]);

            if (error) throw error;

            setNewTaskTitle('');
            setNewTaskSubject('');
            setIsAddingTask(false);
            fetchTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="neon-text-green text-xl font-mono animate-neon-pulse">
                    LOADING TASKS...
                </div>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => {
                    const Icon = column.icon;
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <div key={column.id} className="flex flex-col">
                            {/* Column Header */}
                            <div className={`glass-card border-2 border-${column.color}/30 mb-4 p-4`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-6 h-6 text-${column.color}`} />
                                        <h3 className={`text-xl font-bold text-${column.color} font-mono`}>
                                            {column.title}
                                        </h3>
                                    </div>
                                    {column.id === 'backlog' && (
                                        <button
                                            onClick={() => setIsAddingTask(true)}
                                            className="p-1 rounded bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green transition-all"
                                            title="Add Task"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className={`text-sm text-${column.color}/70 font-mono`}>
                                    {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                                </div>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-4 rounded-lg border-2 border-dashed transition-all ${snapshot.isDraggingOver
                                            ? `border-${column.color} bg-${column.color}/5`
                                            : 'border-gray-700 bg-cyber-gray/30'
                                            } min-h-[400px]`}
                                    >
                                        <div className="space-y-3">
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`glass-card cyber-border p-4 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging
                                                                ? 'neon-glow-green rotate-2 scale-105'
                                                                : 'hover:neon-glow-green'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <GripVertical className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                                                                <div className="flex-1">
                                                                    <div className="text-white font-semibold mb-2">
                                                                        {task.title}
                                                                    </div>
                                                                    <div className="text-xs bg-neon-green/10 text-neon-green px-2 py-1 rounded inline-block font-mono">
                                                                        {task.subject}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>

                                        {/* Empty State */}
                                        {columnTasks.length === 0 && (
                                            <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm">
                                                {column.id === 'backlog' ? 'Click + to add tasks' : 'Drop tasks here'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>

            {/* Add Task Modal */}
            {isAddingTask && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="glass-card cyber-border max-w-md w-full relative">
                        <button
                            onClick={() => setIsAddingTask(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-neon-green transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold neon-text-green mb-6 font-mono">ADD NEW TASK</h2>

                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-2">TASK TITLE</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    required
                                    placeholder="e.g., Review Binary Search Trees"
                                    className="w-full bg-cyber-gray border-2 border-neon-green/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:neon-glow-green transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-2">SUBJECT</label>
                                <input
                                    type="text"
                                    value={newTaskSubject}
                                    onChange={(e) => setNewTaskSubject(e.target.value)}
                                    required
                                    placeholder="e.g., Data Structures"
                                    className="w-full bg-cyber-gray border-2 border-neon-purple/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-purple focus:neon-glow-purple transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingTask(false)}
                                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-mono font-bold transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-neon-green hover:bg-neon-green/80 text-black rounded-lg font-mono font-bold transition-all neon-glow-green"
                                >
                                    ADD TASK
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 glass-card cyber-border p-4 max-w-2xl mx-auto">
                <h4 className="text-neon-purple font-mono font-bold mb-2">📋 HOW TO USE</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• <span className="text-neon-green">Drag</span> tasks between columns to track your progress</li>
                    <li>• <span className="text-neon-purple">Backlog</span>: Topics you haven't started yet</li>
                    <li>• <span className="text-blue-500">In Progress</span>: Currently studying</li>
                    <li>• <span className="text-neon-green">Mastered</span>: Fully understood and exam-ready</li>
                    <li>• Click <span className="text-neon-green">+</span> in Backlog to add new tasks</li>
                </ul>
            </div>
        </DragDropContext>
    );
}
