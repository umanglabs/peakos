import { useState, useEffect } from 'react';
import { BookOpen, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Journal = Database['public']['Tables']['daily_journals']['Row'];

const QUESTIONS = [
  { key: 'achievements', question: 'What did you achieve today?', placeholder: 'List your accomplishments...' },
  { key: 'time_wasters', question: 'What wasted your time?', placeholder: 'What could have been avoided?' },
  { key: 'hardest_part', question: 'What was the hardest part?', placeholder: 'Describe your challenges...' },
  { key: 'improvements', question: 'What will you improve tomorrow?', placeholder: 'Your action plan...' },
] as const;

export default function JournalSection() {
  const [journal, setJournal] = useState<Journal>({
    id: '',
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    achievements: '',
    time_wasters: '',
    hardest_part: '',
    improvements: '',
    energy_level: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_journals')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setJournal(data);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
      const stored = localStorage.getItem('peakos_journal');
      if (stored) {
        setJournal(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveJournal = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_journals').upsert({
        ...journal,
        date: today,
        updated_at: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving journal:', error);
      localStorage.setItem('peakos_journal', JSON.stringify(journal));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof Journal, value: string | number | null) => {
    setJournal((prev) => ({ ...prev, [key]: value }));
  };

  const isComplete = journal.achievements || journal.time_wasters || journal.hardest_part || journal.improvements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Daily Journal</h2>
        <p className="text-gray-400 text-sm mt-1">Reflect on your day to grow</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Energy Level */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-300">Energy Level</span>
              <p className="text-xs text-gray-500 mt-0.5">How do you feel right now? (1-10)</p>
            </label>
            <div className="flex items-center gap-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateField('energy_level', i + 1)}
                  className={`flex-1 h-10 rounded-lg transition-all font-medium text-sm ${
                    journal.energy_level === i + 1
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : i + 1 <= (journal.energy_level || 0)
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {QUESTIONS.map(({ key, question, placeholder }) => (
              <div key={key} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-300">{question}</span>
                </label>
                <textarea
                  value={journal[key] as string}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 focus:outline-none transition-colors text-white placeholder-gray-500 resize-none"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={saveJournal}
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white glow'
            }`}
          >
            {saving ? (
              <>Saving...</>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Journal
              </>
            )}
          </button>

          {/* Completion Status */}
          {isComplete && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm">
                Great work reflecting on your day. Keep this habit going!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
