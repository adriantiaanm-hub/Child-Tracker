import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../../types/tracking';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface IntercomModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
}

export const IntercomModal: React.FC<IntercomModalProps> = ({ isOpen, onClose, child }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerBoost, setIsSpeakerBoost] = useState(true);
  const [customMsg, setCustomMsg] = useState('');
  const [sentPhrases, setSentPhrases] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }

    // Play quick call connect chirp
    soundManager.playSafeChime();

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPhrases = [
    'Emma, stay right where you are, Mom is on the way!',
    'Are you with your teacher or classmates?',
    'Head back inside the school gates immediately!',
    'I see you on the map, everything is okay.',
  ];

  const handleSendPhrase = (phrase: string) => {
    soundManager.playWristbandBeep();
    setSentPhrases((prev) => [...prev, phrase]);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    handleSendPhrase(customMsg.trim());
    setCustomMsg('');
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Top Active Call Bar */}
        <div className="p-6 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 flex flex-col items-center border-b border-slate-800 text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 shadow-lg ring-8 ring-cyan-500/20">
              <img
                src={child.avatar}
                alt={child.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <PhoneCall className="w-3 h-3 text-slate-950" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-100">{child.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {child.wristband.model} · VoLTE Encrypted
          </p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Call Connected: {formatCallTime(callDuration)}</span>
          </div>

          {/* Simulated Audio Frequency Spectrum Visualizer */}
          <div className="mt-4 flex items-center justify-center gap-1 h-8 w-48">
            {[40, 75, 100, 60, 85, 30, 95, 60, 80, 45, 90, 65, 35].map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-cyan-400/80 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(15, (height * (isMuted ? 0.2 : 1)))}%`,
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Voice Prompt Buttons */}
        <div className="p-4 border-b border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Voice Directives (Spoken via Wristband Speaker)</span>
          </div>

          <div className="space-y-1.5">
            {quickPhrases.map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleSendPhrase(phrase)}
                className="w-full text-left text-xs p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate pr-2">{phrase}</span>
                <Send className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom text-to-wristband input */}
          <form onSubmit={handleSendCustom} className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Speak custom message to child..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Send
            </button>
          </form>
        </div>

        {/* Call Controls Footer */}
        <div className="p-4 bg-slate-950 flex items-center justify-around">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-2xl border transition ${
              isMuted
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-950 transition"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>

          {/* Speaker Boost */}
          <button
            onClick={() => setIsSpeakerBoost(!isSpeakerBoost)}
            className={`p-3 rounded-2xl border transition ${
              isSpeakerBoost
                ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Speaker Boost"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
