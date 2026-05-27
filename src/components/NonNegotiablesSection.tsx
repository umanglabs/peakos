import { useState, useEffect } from 'react';
import { CheckSquare, Square, Flame, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type NonNegotiable = Database['public']['Tables']['non_negotiables']['Row'];

const DEFAULT_HABITS = [
  'Study 1 hour',
  'Deep work session',
  'Workout',
  'Limit social media',
];

export default function NonNegotiablesSection() {
  const [habits, setHabits] = useState<NonNegotiable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('non_negotiables')
        .select('*')
        .eq('date', today);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Initialize default habits for today
        const newHabits: NonNegotiable[] = DEFAULT_HABITS.map((name) => ({
          id: crypto.randomUUID(),
          user_id: '',
          name,
          is_completed: false,
          current_streak: 0,
          date: today,
          created_at: new Date().toISOString(),
        }));
        setHabits(newHabits);
        localStorage.setItem('peakos_habits', JSON.stringify(newHabits));
      } else {
        setHabits(data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      const stored = localStorage.getItem('peakos_habits');
      if (stored) {
        setHabits(JSON.parse(stored));
      } else {
        const newHabits: NonNegotiable[] = DEFAULT_HABITS.map((name) => ({
          id: crypto.randomUUID(),
          user_id: '',
          name,
          is_completed: false,
          current_streak: 0,
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        }));
        setHabits(newHabits);
        localStorage.setItem('peakos_habits', JSON.stringify(newHabits));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = (updatedHabits: NonNegotiable[]) => {
    setHabits(updatedHabits);
    localStorage.setItem('peakos_habits', JSON.stringify(updatedHabits));
  };

  const toggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const newCompleted = !habit.is_completed;
    const newStreak = newCompleted ? habit.current_streak + 1 : Math.max(0, habit.current_streak - 1);

    const updatedHabits = habits.map((h) =>
      h.id === id
        ? { ...h, is_completed: newCompleted, current_streak: newStreak }
        : h
    );

    try {
      await supabase
        .from('non_negotiables')
        .upsert({
          id,
          is_completed: newCompleted,
          current_streak: newStreak,
        });
    } catch (error) {
      console.error('Error updating habit:', error);
    }

    saveHabits(updatedHabits);
  };

  const completedCount = habits.filter((h) => h.is_completed).length;
  const progressPercentage = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Non-Negotiables</h2>
        <p className="text-gray-400 text-sm mt-1">Daily habits that define your success</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{completedCount}/{habits.length}</p>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Total Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{totalStreak} days</p>
          <p className="text-xs text-gray-500 mt-2">Keep building momentum!</p>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`w-full bg-gray-800/50 rounded-xl p-4 border transition-all card-glow text-left ${
                habit.is_completed
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-gray-700 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  habit.is_completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  {habit.is_completed ? (
                    <CheckSquare className="w-6 h-6" />
                  ) : (
                    <Square className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${habit.is_completed ? 'text-green-400 line-through' : 'text-white'}`}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-sm text-orange-400">{habit.current_streak} day streak</span>
                  </div>
                </div>
                {habit.is_completed && (
                  <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-400 font-medium">
                    Done
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Notification */}
      {completedCount < habits.length && completedCount > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-cyan-400 font-medium">Keep going!</p>
            <p className="text-cyan-400/70 text-sm mt-1">
              {habits.length - completedCount} more habit{habits.length - completedCount !== 1 ? 's' : ''} to complete today
            </p>
          </div>
        </div>
      )}

      {completedCount === habits.length && habits.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckSquare className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-medium">All habits completed!</p>
            <p className="text-green-400/70 text-sm mt-1">You've crushed your non-negotiables today</p>
          </div>
        </div>
      )}
    </div>
  );
}
