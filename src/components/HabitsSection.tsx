import { useState, useEffect } from 'react';
import { Plus, Flame, Check, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function HabitsSection() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  useEffect(() => { if (user) { fetchHabits(); fetchCompletions(); } }, [user]);

  const fetchHabits = async () => {
    const { data } = await supabase.from('habits').select('*').eq('user_id', user?.id).order('created_at');
    setHabits(data || []);
    if (data) calculateStreaks(data);
  };

  const fetchCompletions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('habit_completions').select('habit_id').eq('user_id', user?.id).eq('date', today);
    setCompletions(data?.map(c => c.habit_id) || []);
  };

  const calculateStreaks = async (habitList: any[]) => {
    const streakMap: Record<string, number> = {};
    for (const habit of habitList) {
      let streak = 0;
      let date = new Date();
      while (true) {
        const dateStr = date.toISOString().split('T')[0];
        const { data } = await supabase.from('habit_completions').select('id').eq('habit_id', habit.id).eq('date', dateStr).single();
        if (data) { streak++; date.setDate(date.getDate() - 1); }
        else break;
      }
      streakMap[habit.id] = streak;
    }
    setStreaks(streakMap);
  };

  const toggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (completions.includes(habitId)) {
      await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('date', today).eq('user_id', user?.id);
      setCompletions(prev => prev.filter(id => id !== habitId));
    } else {
      await supabase.from('habit_completions').insert({ user_id: user?.id, habit_id: habitId, date: today });
      setCompletions(prev => [...prev, habitId]);
    }
    fetchHabits();
  };

  const addHabit = async () => {
    if (!newHabit.trim()) return;
    await supabase.from('habits').insert({ user_id: user?.id, title: newHabit.trim() });
    setNewHabit(''); setShowForm(false); fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    fetchHabits();
  };

  const completedToday = completions.length;
  const totalHabits = habits.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Habits</h2>
          <p className="text-gray-400 text-sm mt-1">{completedToday}/{totalHabits} done today</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/30">
          <input
            type="text" placeholder="Habit name..." value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-orange-500 focus:outline-none text-white placeholder-gray-500"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button onClick={addHabit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 font-medium">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <Flame className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No habits yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first daily habit</p>
          </div>
        ) : habits.map((habit) => {
          const done = completions.includes(habit.id);
          const streak = streaks[habit.id] || 0;
          return (
            <div key={habit.id} className={`bg-gray-800/50 rounded-xl p-4 border transition-all ${done ? 'border-orange-500/50 bg-orange-500/10' : 'border-gray-700'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleHabit(habit.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${done ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <Check className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${done ? 'line-through text-gray-500' : 'text-white'}`}>{habit.title}</p>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400">{streak} day streak</span>
                    </div>
                  )}
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}