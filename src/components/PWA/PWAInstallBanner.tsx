/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';
import { Download, Smartphone, X, WifiOff } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — Displaying cached catalog</span>
        </div>
      )}

      {/* In-App Install Strip */}
      {!isInstalled && !dismissed && (isInstallable || isIOS) && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-[#2A2523] text-stone-200 p-3.5 rounded-2xl shadow-2xl border border-stone-700 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5E1324] text-white flex items-center justify-center font-serif font-bold text-sm">
              V
            </div>
            <div>
              <p className="font-bold text-white leading-tight">Install Vastrika App</p>
              <p className="text-[11px] text-stone-400">Fast native saree shopping</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#B38E44] text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-medium rounded-lg text-xs transition cursor-pointer"
              >
                iOS Install
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-stone-400 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#5E1324]" />
                <span>Install Vastrika on iPhone</span>
              </h3>
              <button onClick={() => setShowIOSGuide(false)}>
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              1. Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar at the bottom of your screen.<br /><br />
              2. Scroll down the actions and tap <strong>Add to Home Screen</strong>.<br /><br />
              3. Tap <strong>Add</strong> in the top right corner. The Vastrika icon will appear directly on your home screen.
            </p>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-[#5E1324] py-2.5 text-xs font-bold text-white hover:bg-[#781D32] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
