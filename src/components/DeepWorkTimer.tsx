import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type DeepWorkSession = Database['public']['Tables']['deep_work_sessions']['Row'];

export default function DeepWorkTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [todaySessions, setTodaySessions] = useState<DeepWorkSession[]>([]);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTodaySessions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const fetchTodaySessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('deep_work_sessions')
        .select('*')
        .eq('date', today);

      if (error) throw error;
      setTodaySessions(data || []);

      const totalSeconds = (data || []).reduce((sum, s) => sum + s.duration_seconds, 0);
      setTotalFocusMinutes(Math.floor(totalSeconds / 60));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      const stored = localStorage.getItem('peakos_deep_work');
      if (stored) {
        const sessions = JSON.parse(stored);
        setTodaySessions(sessions);
        const totalSeconds = sessions.reduce((sum: number, s: DeepWorkSession) => sum + s.duration_seconds, 0);
        setTotalFocusMinutes(Math.floor(totalSeconds / 60));
      }
    }
  };

  const saveSession = async (durationSeconds: number) => {
    const session: DeepWorkSession = {
      id: crypto.randomUUID(),
      user_id: '',
      duration_seconds: durationSeconds,
      date: new Date().toISOString().split('T')[0],
      started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      ended_at: new Date().toISOString(),
    };

    try {
      await supabase.from('deep_work_sessions').insert(session);
      await fetchTodaySessions();
    } catch (error) {
      console.error('Error saving session:', error);
      const updated = [...todaySessions, session];
      setTodaySessions(updated);
      localStorage.setItem('peakos_deep_work', JSON.stringify(updated));
      setTotalFocusMinutes(Math.floor(updated.reduce((sum, s) => sum + s.duration_seconds, 0) / 60));
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0) {
      saveSession(seconds);
    }
    setSeconds(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((seconds / 5400) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Deep Work Timer</h2>
        <p className="text-gray-400 text-sm mt-1">Focus without distractions</p>
      </div>

      {/* Main Timer Display */}
      <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 relative overflow-hidden">
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 transition-opacity duration-500 ${isRunning ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88 * (progressPercentage / 100)} ${2 * Math.PI * 88}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-bold font-mono tracking-wider">
                {formatTime(seconds)}
              </span>
              {isRunning && (
                <span className="text-cyan-400 text-sm mt-1 animate-pulse">Focus Mode</span>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center transition-all glow hover:scale-105"
              >
                <Play className="w-7 h-7 ml-1" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 flex items-center justify-center transition-all glow hover:scale-105"
              >
                <Pause className="w-7 h-7" />
              </button>
            )}

            <button
              onClick={seconds > 0 && !isRunning ? handleStop : handleReset}
              disabled={seconds === 0 && !isRunning}
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seconds > 0 && !isRunning ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </button>
          </div>

          {seconds > 0 && !isRunning && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Click reset to save session or start to continue
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Sessions Today</span>
          </div>
          <p className="text-2xl font-bold text-white">{todaySessions.length}</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Focus</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {totalFocusMinutes} <span className="text-base">min</span>
          </p>
        </div>
      </div>

      {/* Sessions List */}
      {todaySessions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            Today's Sessions
          </h3>
          <div className="space-y-2">
            {todaySessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <span className="text-sm text-gray-400">Session {index + 1}</span>
                <span className="text-sm font-mono text-cyan-400">
                  {formatTime(session.duration_seconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
