import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, BookOpen, Code, Film, Moon, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TimeLog = Database['public']['Tables']['time_logs']['Row'];

const CATEGORIES = [
  { id: 'study', label: 'Study', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
  { id: 'coding', label: 'Coding', icon: Code, color: 'from-green-500 to-emerald-500' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'from-purple-500 to-pink-500' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'from-indigo-500 to-violet-500' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600' },
] as const;

export default function TimeTrackingSection() {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<'study' | 'coding' | 'entertainment' | 'sleep' | 'other'>('study');
  const [hours, setHours] = useState('1');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      const stored = localStorage.getItem('peakos_time_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveLogs = (updatedLogs: TimeLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('peakos_time_logs', JSON.stringify(updatedLogs));
  };

  const addLog = async () => {
    if (!hours || parseFloat(hours) <= 0) return;

    const log: TimeLog = {
      id: crypto.randomUUID(),
      user_id: '',
      category,
      hours: parseFloat(hours),
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('time_logs').insert(log);
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
      saveLogs([log, ...logs]);
    }

    setHours('1');
    setDescription('');
    setShowForm(false);
  };

  const deleteLog = async (id: string) => {
    try {
      await supabase.from('time_logs').delete().eq('id', id);
      await fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      saveLogs(logs.filter((l) => l.id !== id));
    }
  };

  const getCategoryTotals = () => {
    const totals: Record<string, number> = {};
    logs.forEach((log) => {
      totals[log.category] = (totals[log.category] || 0) + log.hours;
    });
    return totals;
  };

  const totals = getCategoryTotals();
  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Tracking</h2>
          <p className="text-gray-400 text-sm mt-1">Log your daily activities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm font-medium glow"
        >
          <Plus className="w-4 h-4" />
          Log Time
        </button>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const hours = totals[cat.id] || 0;
          const CatIcon = cat.icon;
          return (
            <div
              key={cat.id}
              className="bg-gray-800/50 rounded-xl p-3 border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <CatIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-400">{cat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">
                {hours.toFixed(1)}<span className="text-sm text-gray-400 ml-1">hrs</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">Total Tracked Today</span>
          </div>
          <span className="text-2xl font-bold text-cyan-400">{totalHours.toFixed(1)} hrs</span>
        </div>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30 card-glow transition-all">
          <h3 className="font-medium mb-4">Log Time Spent</h3>

          {/* Category Selection */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-lg transition-all ${
                    category === cat.id
                      ? `bg-gradient-to-br ${cat.color}`
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <CatIcon className={`w-5 h-5 mx-auto ${category === cat.id ? 'text-white' : 'text-gray-400'}`} />
                  <p className={`text-xs mt-1 ${category === cat.id ? 'text-white' : 'text-gray-500'}`}>
                    {cat.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Hours Input */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-2">Hours</label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 focus:outline-none transition-colors text-white"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you do?"
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 focus:outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={addLog}
              disabled={!hours || parseFloat(hours) <= 0}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Add Entry
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setHours('1');
                setDescription('');
              }}
              className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-3 border-b border-gray-700">
          <h3 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Today's Entries
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p>No time logged today</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {logs.map((log) => {
              const cat = CATEGORIES.find((c) => c.id === log.category);
              const CatIcon = cat?.icon || MoreHorizontal;
              return (
                <div
                  key={log.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                      <CatIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{log.category}</p>
                      {log.description && (
                        <p className="text-sm text-gray-400">{log.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-cyan-400">{log.hours.toFixed(1)}h</span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
