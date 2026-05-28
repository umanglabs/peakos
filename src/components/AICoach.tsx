import { useState, useEffect } from 'react';
import { Brain, Send, Loader, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true })
      .limit(20);
    if (data && data.length > 0) {
      setMessages(data.map(d => ({ role: d.role, content: d.content })));
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Hey! Main hoon tumhara PeakOS AI Coach 🧠 Aaj kya achieve karna hai? Batao — milke plan banate hain!'
      }]);
    }
  };

  const getUserContext = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [missions, habits, journal] = await Promise.all([
      supabase.from('daily_missions').select('title,status').eq('user_id', user?.id).eq('date', today),
      supabase.from('habit_completions').select('habit_id').eq('user_id', user?.id).eq('date', today),
      supabase.from('journal_entries').select('content,type').eq('user_id', user?.id).eq('date', today),
    ]);
    return { missions: missions.data, habits: habits.data, journal: journal.data };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const context = await getUserContext();
      const systemPrompt = `You are PeakOS AI Coach — a personal growth coach for students and ambitious people. Be motivating, direct, and personal like a friend. User's today data: ${JSON.stringify(context)}. Keep responses short (2-3 sentences max). Always respond in the same language the user writes in.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: newMessages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Thoda network issue — dobara try karo!';
      const aiMsg = { role: 'assistant', content: aiText };
      setMessages(prev => [...prev, aiMsg]);

      await supabase.from('ai_conversations').insert([
        { user_id: user?.id, role: 'user', content: userMsg.content },
        { user_id: user?.id, role: 'assistant', content: aiText }
      ]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Thoda network issue — dobara try karo!' }]);
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
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <p className="text-gray-400 text-xs">Powered by Gemini</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-gray-400 text-sm">Thinking...</span>
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
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 transition-all"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}