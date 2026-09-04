import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { Tracker } from '../types';

interface ShareLiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: Tracker;
}

export const ShareLiveLocationModal: React.FC<ShareLiveLocationModalProps> = ({
  isOpen,
  onClose,
  tracker
}) => {
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gps-frontend-psi.vercel.app';
  const shareToken = btoa(`${tracker.id}_${Date.now() + expiryHours * 3600000}`).slice(0, 16);
  const shareUrl = `${baseUrl}/?trackerId=${tracker.id}&token=${shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `📍 Live GPS Tracking link for ${tracker.deviceName} (${tracker.trackerCode}):\n${shareUrl}\nValid for ${expiryHours} hours.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-900 border border-slate-700/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-5 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-dark-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              Share Live Tracking Link
            </h3>
            <p className="text-xs text-slate-400">
              {tracker.deviceName} (<span className="font-mono text-indigo-400 font-bold">{tracker.trackerCode}</span>)
            </p>
          </div>
        </div>

        {/* Link Expiry Selector */}
        <div className="bg-dark-800/80 p-3 rounded-xl border border-dark-700 space-y-2">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Select Link Validity
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { hours: 1, label: '1 Hour' },
              { hours: 8, label: '8 Hours' },
              { hours: 24, label: '24 Hours' },
              { hours: 168, label: '7 Days' }
            ].map(opt => (
              <button
                key={opt.hours}
                onClick={() => setExpiryHours(opt.hours)}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  expiryHours === opt.hours
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-dark-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live URL Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Public Tracking URL</label>
          <div className="flex items-center gap-2 bg-dark-950 border border-dark-700 rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp & Direct Open Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </a>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Test Public Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Anyone with this link can view live movement without logging in.
        </p>

      </div>
    </div>
  );
};
