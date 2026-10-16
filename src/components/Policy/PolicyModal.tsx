/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 text-left p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5E1324]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans space-y-3">
          <p>{content}</p>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-500">
            For dedicated assistance or special institutional corporate orders, write to us at{' '}
            <strong className="text-[#5E1324]">care@vastrika.com</strong> or call our toll-free
            concierge at <strong className="text-[#5E1324]">+91 800-VASTRIKA</strong>.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#5E1324] text-white text-xs font-bold rounded-xl hover:bg-[#781D32] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
