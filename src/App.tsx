import InstallBanner from './components/InstallBanner';
import { useState } from 'react';
import { Target, CheckSquare, Timer, BookOpen, Clock, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import MissionsSection from './components/MissionsSection';
import NonNegotiablesSection from './components/NonNegotiablesSection';
import DeepWorkTimer from './components/DeepWorkTimer';
import JournalSection from './components/JournalSection';
import TimeTrackingSection from './components/TimeTrackingSection';
import FeedbackSection from './components/FeedbackSection';

type Section = 'missions' | 'habits' | 'timer' | 'journal' | 'tracking' | 'feedback';

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
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ] as const;

  const renderSection = () => {
    switch (activeSection) {
      case 'missions': return <MissionsSection />;
      case 'habits': return <NonNegotiablesSection />;
      case 'timer': return <DeepWorkTimer />;
      case 'journal': return <JournalSection />;
      case 'tracking': return <TimeTrackingSection />;
      case 'feedback': return <FeedbackSection />;
      default: return <MissionsSection />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow">
                <Target className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                PeakOS
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <section.icon className="w-4 h-4 inline mr-2" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={signOut}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors hidden md:block"
              >
                Logout
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left ${
                  activeSection === section.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
            <button
              onClick={signOut}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {renderSection()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {sections.slice(0, 5).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <style>{`
        .glow {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1);
        }
        .card-glow:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.15), 0 4px 20px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;