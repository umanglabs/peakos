import { useState, useEffect } from 'react';
import { Brain, Send, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hey! Main hoon tumhara PeakOS AI Coach 🧠 Aaj kya achieve karna hai? Batao — milke plan banate hain!`
      }]);
    }
  }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true })
      .limit(20);
    if (data && data.length > 0) setMessages(data);
  };

  const getUserContext = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [missions, habits, journal] = await Promise.all([
      supabase.from('daily_missions').select('*').eq('user_id', user?.id).eq('date', today),
      supabase.from('habit_completions').select('*').eq('user_id', user?.id).eq('date', today),
      supabase.from('journal_entries').select('*').eq('user_id', user?.id).eq('date', today)
    ]);
    return { missions: missions.data, habits: habits.data, journal: journal.data };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = await getUserContext();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are PeakOS AI Coach — a personal growth coach for students and ambitious people. Be motivating, direct, and personal. User's today data: ${JSON.stringify(context)}. Keep responses short (2-3 sentences max). Speak like a friend, not a robot.`
            },
            ...messages.slice(-10),
            userMsg
          ]
        })
      });

      const data = await response.json();
      const aiMsg = { role: 'assistant', content: data.choices[0].message.content };
      setMessages(prev => [...prev, aiMsg]);

      await supabase.from('ai_conversations').insert([
        { user_id: user?.id, ...userMsg },
        { user_id: user?.id, ...aiMsg }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Thoda network issue hai — dobara try karo!' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Coach</h2>
          <p className="text-gray-400 text-xs">Powered by Groq — Always Free</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-gray-800 text-gray-100 border border-gray-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl">
              <Loader className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Coach se baat karo..."
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}