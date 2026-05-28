import { useState, useEffect } from 'react';
import { BookOpen, Save, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const morningPrompts = [
  "Aaj main kya achieve karna chahta hoon?",
  "Aaj mujhe kya grateful feel karata hai?",
  "Aaj ka sabse important task kya hai?",
  "Main aaj kaisa feel kar raha hoon aur kyun?"
];

const eveningPrompts = [
  "Aaj ki sabse badi achievement kya thi?",
  "Aaj maine kya seekha?",
  "Kal main kya differently karunga?",
  "Aaj mujhe kya proud feel karaya?"
];

export default function JournalSection() {
  const { user } = useAuth();
  const [type, setType] = useState<'morning' | 'evening'>('morning');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [saved, setSaved] = useState(false);
  const [pastEntries, setPastEntries] = useState<any[]>([]);
  const [showPast, setShowPast] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  const prompt = type === 'morning'
    ? morningPrompts[new Date().getDay() % morningPrompts.length]
    : eveningPrompts[new Date().getDay() % eveningPrompts.length];

  useEffect(() => {
    if (user) { loadToday(); loadPast(); }
    setType(hour < 15 ? 'morning' : 'evening');
  }, [user, type]);

  const loadToday = async () => {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user?.id).eq('date', today).eq('type', type).single();
    if (data) { setContent(data.content || ''); setMood(data.mood || 3); }
    else { setContent(''); setMood(3); }
  };

  const loadPast = async () => {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(10);
    setPastEntries(data || []);
  };

  const save = async () => {
    const existing = await supabase.from('journal_entries').select('id').eq('user_id', user?.id).eq('date', today).eq('type', type).single();
    if (existing.data) {
      await supabase.from('journal_entries').update({ content, mood }).eq('id', existing.data.id);
    } else {
      await supabase.from('journal_entries').insert({ user_id: user?.id, type, content, mood, date: today });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadPast();
  };

  const moodEmojis = ['😔', '😕', '😐', '🙂', '😄'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Journal</h2>
        <p className="text-gray-400 text-sm mt-1">Reflect and grow daily</p>
      </div>

      <div className="flex gap-2">
        {(['morning', 'evening'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400'}`}>
            {t === 'morning' ? '🌅 Morning' : '🌙 Evening'}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-cyan-400 text-sm font-medium mb-3">💭 {prompt}</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yahan likho..."
          rows={6}
          className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-sm leading-relaxed"
        />
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-3">Aaj kaisa feel ho raha hai?</p>
        <div className="flex justify-around">
          {moodEmojis.map((emoji, i) => (
            <button key={i} onClick={() => setMood(i + 1)}
              className={`text-2xl p-2 rounded-lg transition-all ${mood === i + 1 ? 'bg-cyan-500/20 scale-125' : 'opacity-50'}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <button onClick={save}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'}`}>
        <Save className="w-4 h-4" />
        {saved ? 'Saved! ✓' : 'Save Entry'}
      </button>

      {pastEntries.length > 0 && (
        <div>
          <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 text-gray-400 text-sm">
            <ChevronDown className={`w-4 h-4 transition-transform ${showPast ? 'rotate-180' : ''}`} />
            Past Entries ({pastEntries.length})
          </button>
          {showPast && (
            <div className="space-y-2 mt-3">
              {pastEntries.map((entry) => (
                <div key={entry.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{entry.date}</span>
                    <span>{entry.type === 'morning' ? '🌅' : '🌙'} {moodEmojis[(entry.mood || 3) - 1]}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}