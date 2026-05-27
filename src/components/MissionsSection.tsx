import { useState, useEffect } from 'react';
import { Plus, Target, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Mission = Database['public']['Tables']['daily_missions']['Row'];

export default function MissionsSection() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
      // Fallback to local storage for demo
      const stored = localStorage.getItem('peakos_missions');
      if (stored) {
        setMissions(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveMissions = async (updatedMissions: Mission[]) => {
    setMissions(updatedMissions);
    localStorage.setItem('peakos_missions', JSON.stringify(updatedMissions));
  };

  const addMission = async () => {
    if (!newTitle.trim() || missions.length >= 3) return;

    const mission: Mission = {
      id: crypto.randomUUID(),
      user_id: '',
      title: newTitle.trim(),
      priority: newPriority,
      status: 'not_started',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('daily_missions').insert(mission);
      if (error) throw error;
      await fetchMissions();
    } catch (error) {
      console.error('Error adding mission:', error);
      saveMissions([...missions, mission]);
    }

    setNewTitle('');
    setNewPriority('medium');
    setShowForm(false);
  };

  const updateStatus = async (id: string, status: 'not_started' | 'doing' | 'done') => {
    const updatedMissions = missions.map((m) =>
      m.id === id ? { ...m, status, updated_at: new Date().toISOString() } : m
    );

    try {
      const { error } = await supabase
        .from('daily_missions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchMissions();
    } catch (error) {
      console.error('Error updating mission:', error);
      saveMissions(updatedMissions);
    }
  };

  const deleteMission = async (id: string) => {
    try {
      const { error } = await supabase.from('daily_missions').delete().eq('id', id);
      if (error) throw error;
      await fetchMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
      saveMissions(missions.filter((m) => m.id !== id));
    }
  };

  const completedCount = missions.filter((m) => m.status === 'done').length;
  const progressPercentage = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

  const statusConfig = {
    not_started: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-700/50' },
    doing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    done: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  };

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-cyan-500/50 bg-cyan-500/10',
    low: 'border-gray-500/50 bg-gray-500/10',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today's Missions</h2>
          <p className="text-gray-400 text-sm mt-1">Focus on 1-3 key tasks</p>
        </div>
        {missions.length < 3 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm font-medium glow"
          >
            <Plus className="w-4 h-4" />
            Add Mission
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {missions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-cyan-400 font-medium">{completedCount}/{missions.length} completed</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Mission Form */}
      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30 card-glow transition-all">
          <h3 className="font-medium mb-3">Create New Mission</h3>
          <input
            type="text"
            placeholder="What will you accomplish today?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMission()}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
            autoFocus
          />
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-400">Priority:</span>
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  newPriority === p
                    ? priorityColors[p]
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addMission}
              disabled={!newTitle.trim()}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Create Mission
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewTitle('');
                setNewPriority('medium');
              }}
              className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : missions.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <Target className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No missions for today</p>
            <p className="text-gray-500 text-sm mt-1">Add your first mission to get started</p>
          </div>
        ) : (
          missions.map((mission) => {
            const StatusIcon = statusConfig[mission.status].icon;
            return (
              <div
                key={mission.id}
                className={`bg-gray-800/50 rounded-xl p-4 border transition-all card-glow ${priorityColors[mission.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      const nextStatus = mission.status === 'not_started' ? 'doing' : mission.status === 'doing' ? 'done' : 'not_started';
                      updateStatus(mission.id, nextStatus);
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[mission.status].bg} hover:scale-105 transition-transform mt-0.5`}
                  >
                    <StatusIcon className={`w-5 h-5 ${statusConfig[mission.status].color}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium leading-tight ${mission.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                      {mission.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${priorityColors[mission.priority]}`}>
                        {mission.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${statusConfig[mission.status].bg} ${statusConfig[mission.status].color}`}>
                        {mission.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMission(mission.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Reminder */}
      {missions.length > 0 && completedCount === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Start your first mission</p>
            <p className="text-yellow-400/70 text-sm mt-1">You haven't started any of today's missions</p>
          </div>
        </div>
      )}
    </div>
  );
}
