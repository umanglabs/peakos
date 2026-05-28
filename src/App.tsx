import { useState } from 'react';
import { Target, CheckSquare, Timer, BookOpen, Clock, Brain, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import MissionsSection from './components/MissionsSection';
import NonNegotiablesSection from './components/NonNegotiablesSection';
import DeepWorkTimer from './components/DeepWorkTimer';
import JournalSection from './components/JournalSection';
import TimeTrackingSection from './components/TimeTrackingSection';
import FeedbackSection from './components/FeedbackSection';
import AICoach from './components/AICoach';
import InstallBanner from './components/InstallBanner';

type Section = 'missions' | 'habits' | 'timer' | 'journal' | 'tracking' | 'feedback' | 'ai';

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('missions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'tracking', label: 'Time', icon: Clock },
    { id: 'ai', label: 'AI Coach', icon: Brain },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ] as const;

  const renderSection = () => {
    switch (activeSection) {
      case 'missions': return <MissionsSection />;
      case 'habits': return <NonNegotiablesSection />;
      case 'timer': return <DeepWorkTimer />;
      case 'journal': return <JournalSection />;
      case 'tracking': return <TimeTrackingSection />;
      case 'ai': return <AICoach />;
      case 'feedback': return <FeedbackSection />;
      default: return <MissionsSection />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none">
                  PeakOS
                </h1>
                <p className="text-gray-500 text-xs">Second Brain</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <button onClick={signOut} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                  Logout
                </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setMobileMenuOpen(false); }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
            <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-gray-400 text-sm truncate max-w-[180px]">{user.email}</span>
              </div>
              <button onClick={signOut} className="text-xs text-red-400 hover:text-red-300">
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 pb-24 md:pb-8 px-4">
        <div className="max-w-4xl mx-auto py-6">
          {renderSection()}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 md:hidden z-50">
        <div className="flex items-center justify-around py-1">
          {sections.slice(0, 6).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <InstallBanner />
    </div>
  );
}

export default App;