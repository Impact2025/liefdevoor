'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

export function InstallPrompt() {
  const { isInstalled, isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown');

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    setDeviceType(getDeviceType());

    // Show prompt after 3 seconds if not installed
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
  };

  const handleInstall = async () => {
    if (deviceType === 'ios') {
      setShowIOSInstructions(true);
    } else if (isInstallable) {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    }
  };

  // Don't show if installed or dismissed
  if (isInstalled || isDismissed || !isVisible) return null;

  // Don't show on desktop unless installable
  if (deviceType === 'desktop' && !isInstallable) return null;

  return (
    <>
      {/* Main Install Banner */}
      <AnimatePresence>
        {!showIOSInstructions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom"
          >
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* App Icon */}
                  <div className="w-14 h-14 bg-stone-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">
                      Installeer de app
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {deviceType === 'ios'
                        ? 'Voeg toe aan je beginscherm voor de beste ervaring'
                        : 'Installeer voor snellere toegang en meldingen'}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleDismiss}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleInstall}
                    className="flex-1 py-3 px-4 text-sm font-medium text-white bg-stone-500 rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Installeren
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden safe-bottom"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              <div className="px-6 pb-8">
                <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
                  Installeren op iOS
                </h2>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Tik op de deel-knop
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Share className="w-5 h-5 text-blue-500" />
                        <span>in de Safari navigatiebalk</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Scroll naar beneden
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        En tik op &ldquo;Zet op beginscherm&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Tik op &ldquo;Voeg toe&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Plus className="w-5 h-5 text-slate-600" />
                        <span>rechtsboven in het scherm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowIOSInstructions(false);
                    handleDismiss();
                  }}
                  className="w-full mt-8 py-4 text-white font-bold bg-stone-500 rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Begrepen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
