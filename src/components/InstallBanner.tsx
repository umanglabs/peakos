import { useState } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallBanner() {
  const { install, isInstalled, isIOS, canInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-50">
        <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-500/10">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Get PeakOS App</p>
              <p className="text-xs text-gray-400">Free • No App Store needed</p>
            </div>
          </div>

          <div className="space-y-1.5 mb-4">
            {['Works offline', 'No browser bar', 'Native app feel', 'Instant access'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {f}
              </div>
            ))}
          </div>

          {isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white flex items-center justify-center gap-2"
            >
              <Share className="w-4 h-4" />
              Install on iPhone
            </button>
          ) : (
            <button
              onClick={install}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Download className="w-4 h-4" />
              Install App — It's Free
            </button>
          )}
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl p-6 border-t border-cyan-500/30">
            <h3 className="text-lg font-bold mb-4 text-center">Install on iPhone</h3>
            <div className="space-y-4">
              {[
                { step: '1', text: 'Tap the Share button at the bottom of Safari', icon: '⬆️' },
                { step: '2', text: 'Scroll down and tap "Add to Home Screen"', icon: '➕' },
                { step: '3', text: 'Tap "Add" — PeakOS will appear on your home screen!', icon: '✅' },
              ].map(({ step, text, icon }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                    {step}
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{icon} {text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowIOSGuide(false); setDismissed(true); }}
              className="w-full mt-6 py-3 rounded-xl bg-gray-800 text-gray-400"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}