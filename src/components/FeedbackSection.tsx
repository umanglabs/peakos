import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Feedback = Database['public']['Tables']['feedback_entries']['Row'];

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      const stored = localStorage.getItem('peakos_feedback');
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveFeedback = (updated: Feedback[]) => {
    setFeedbacks(updated);
    localStorage.setItem('peakos_feedback', JSON.stringify(updated));
  };

  const submitFeedback = async () => {
    if (!content.trim()) return;
    setSubmitting(true);

    const feedback: Feedback = {
      id: crypto.randomUUID(),
      user_id: '',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('feedback_entries').insert(feedback);
      await fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      saveFeedback([feedback, ...feedbacks]);
    }

    setContent('');
    setSubmitting(false);
  };

  const deleteFeedback = async (id: string) => {
    try {
      await supabase.from('feedback_entries').delete().eq('id', id);
      await fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      saveFeedback(feedbacks.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Feedback</h2>
        <p className="text-gray-400 text-sm mt-1">Share your thoughts and suggestions</p>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your feedback
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What would make PeakOS better for you?"
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-cyan-500/50 focus:outline-none transition-colors text-white placeholder-gray-500 resize-none"
        />
        <button
          onClick={submitFeedback}
          disabled={!content.trim() || submitting}
          className="mt-3 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 glow"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Sending...' : 'Submit Feedback'}
        </button>
      </div>

      {/* Previous Feedback */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-3 border-b border-gray-700">
          <h3 className="font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Your Feedback History
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p>No feedback submitted yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 hover:bg-gray-700/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-gray-300">{feedback.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(feedback.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
