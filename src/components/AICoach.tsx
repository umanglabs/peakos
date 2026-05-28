import { useState, useEffect } from 'react';
import { Brain, Send, Loader, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoach() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const starterMessage: Message = {
    role: 'assistant',
    content:
      'PeakOS AI online ⚡ Aaj ka main target kya hai?'
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('role, content')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error(error);
        setMessages([starterMessage]);
        return;
      }

      if (!data || data.length === 0) {
        setMessages([starterMessage]);
        return;
      }

      setMessages(data.reverse() as Message[]);
    } catch (err) {
      console.error(err);

alert(
  err instanceof Error
    ? err.message
    : JSON.stringify(err)
);
      setMessages([starterMessage]);
    }
  };

  const clearChat = async () => {
    try {
      await supabase
        .from('ai_conversations')
        .delete()
        .eq('user_id', user?.id);

      setMessages([starterMessage]);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserContext = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [missionsRes, habitsRes] = await Promise.all([
        supabase
          .from('daily_missions')
          .select('title,status')
          .eq('user_id', user?.id)
          .eq('date', today)
          .limit(8),

        supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', user?.id)
          .eq('date', today)
          .limit(20),
      ]);

      return {
        missions: missionsRes.data || [],
        habitsCompleted: habitsRes.data?.length || 0,
      };
    } catch (err) {
      console.error(err);

      return {
        missions: [],
        habitsCompleted: 0,
      };
    }
  };

  const buildPrompt = (
    context: any,
    conversation: Message[]
  ) => {
    return `
You are PeakOS AI.

Your job is to maximize the user's:
- execution
- discipline
- clarity
- consistency
- learning
- focus
- growth
- efficiency
- momentum

You are not a generic chatbot.
You are an execution-focused AI coach.

Rules:
- Keep responses SHORT.
- Maximum 80 words.
- Give actionable output.
- Avoid long explanations.
- Avoid fluff.
- Be direct.
- Push execution.
- Focus on leverage and priorities.
- Detect confusion and simplify.
- If user is procrastinating -> redirect to action.
- If user is overwhelmed -> simplify into next step.
- Always optimize for real-world progress.

User today's context:
${JSON.stringify(context)}

Conversation:
${conversation
  .map((m) => `${m.role}: ${m.content}`)
  .join('\n')}
`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const context = await getUserContext();

      const prompt = buildPrompt(
        context,
        updatedMessages.slice(-8)
      );

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 120,
            },
          }),
        }
      );

      const data = await response.json();

      alert(JSON.stringify(data));

      if (!response.ok) {
        throw new Error(
          data?.error?.message || 'Gemini request failed'
        );
      }

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'Execution mode unstable. Retry.';

      const aiMessage: Message = {
        role: 'assistant',
        content: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);

      await supabase
        .from('ai_conversations')
        .insert([
          {
            user_id: user?.id,
            role: 'user',
            content: userMessage.content,
          },
          {
            user_id: user?.id,
            role: 'assistant',
            content: aiText,
          },
        ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'AI Coach temporary unstable ⚠️ Retry again.',
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              PeakOS AI
            </h2>

            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />

              <p className="text-gray-400 text-xs">
                Maximum Output Mode
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-purple-400" />

              <span className="text-gray-400 text-sm">
                Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          placeholder="Ask PeakOS AI..."
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