import { useState } from 'react';
import { Brain, Zap, Target, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Email aur password dono bharo');
      return;
    }
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Check karo email — confirmation link aaya hoga!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Email ya password galat hai');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          PeakOS
        </h1>
      </div>

      <p className="text-gray-400 text-center text-lg mb-1">Your Second Brain</p>
      <p className="text-gray-500 text-center text-sm mb-8">
        Built for students who want to grow
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
        {[
          { icon: Target, text: 'Daily Missions' },
          { icon: Zap, text: 'Habit Streaks' },
          { icon: BookOpen, text: 'Journal' },
          { icon: Brain, text: 'AI Coach' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 flex items-center gap-2">
            <Icon className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">{text}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {message && <p className="text-green-400 text-sm text-center">{message}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all font-semibold text-white text-lg glow"
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Login'}
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
          className="w-full py-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
        >
          {isSignUp ? 'Already have account? Login' : "Don't have account? Sign Up"}
        </button>
      </div>

      <p className="text-gray-600 text-xs mt-6 text-center">
        Free forever • No credit card required
      </p>

      <style>{`
        .glow {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1);
        }
      `}</style>
    </div>
  );
}