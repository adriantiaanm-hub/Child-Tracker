import React, { useState } from 'react';
import { ChildProfile } from '../../types/tracking';
import {
  Watch,
  X,
  Radio,
  Heart,
  Battery,
  ShieldCheck,
  ShieldAlert,
  Footprints,
  Volume2,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface VirtualWristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  onTriggerSos: (childId: string) => void;
  onToggleClasp: (childId: string) => void;
  onSimulateWander: () => void;
  onToggleControlLock?: (childId: string, locked: boolean) => void;
  onSimulateHeartSpike?: (childId: string) => void;
}

export const VirtualWristbandModal: React.FC<VirtualWristbandModalProps> = ({
  isOpen,
  onClose,
  child,
  onTriggerSos,
  onToggleClasp,
  onSimulateWander,
  onToggleControlLock,
  onSimulateHeartSpike,
}) => {
  const [voiceNoteSent, setVoiceNoteSent] = useState(false);

  if (!isOpen) return null;

  const { wristband } = child;
  const isHeartHigh = wristband.heartRate >= wristband.heartRateThresholdMax;

  const handleSosClick = () => {
    onTriggerSos(child.id);
  };

  const handleSendSafePing = () => {
    soundManager.playSafeChime();
    setVoiceNoteSent(true);
    setTimeout(() => setVoiceNoteSent(false), 3000);
  };

  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Watch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Wristband Hardware Twin</h3>
              <p className="text-[11px] text-slate-400">
                {wristband.model} · {child.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Physical Smartwatch Visual Frame */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800">
          {/* Watch Straps */}
          <div className="w-24 h-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-t-xl opacity-90 border-t border-x border-slate-600/50" />

          {/* Watch Case Chassis */}
          <div className="relative w-64 h-64 rounded-[40px] bg-slate-950 border-4 border-slate-700 shadow-2xl p-3.5 flex flex-col items-center justify-between ring-8 ring-slate-800/60">
            {/* Watch Bezel Glass & OLED Display */}
            <div className={`w-full h-full rounded-[28px] border p-3.5 flex flex-col justify-between overflow-hidden relative shadow-inner ${
              isHeartHigh
                ? 'bg-red-950/95 border-red-500 animate-pulse'
                : 'bg-black border-slate-800'
            }`}>
              {/* Screen Top Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>4G LTE</span>
                </span>

                {/* Control Lock Badge on Screen */}
                {wristband.isControlLocked && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600 text-[9px] font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </span>
                )}

                <span className="flex items-center gap-1 text-slate-300">
                  <Battery className="w-3 h-3 text-emerald-400" />
                  <span>{wristband.batteryLevel}%</span>
                </span>
              </div>

              {/* Main Watch Face Content */}
              <div className="text-center my-auto">
                <div className="text-3xl font-extrabold font-mono text-cyan-300 tracking-tight">
                  {timeString}
                </div>

                {/* Safe / Danger Status on Child Watch */}
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border">
                  {isHeartHigh ? (
                    <span className="bg-red-900 text-white border-red-400 animate-pulse px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-300" />
                      <span>HEART RATE LOCKOUT!</span>
                    </span>
                  ) : wristband.isSosActive ? (
                    <span className="bg-red-950 text-red-300 border-red-500 animate-pulse px-2 py-0.5 rounded-full">
                      🚨 SOS ACTIVE
                    </span>
                  ) : !child.isInsideSafeZone ? (
                    <span className="bg-rose-950 text-rose-300 border-rose-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>OUTSIDE ZONE</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-950 text-emerald-300 border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{child.currentZoneName || 'Safe Zone'}</span>
                    </span>
                  )}
                </div>

                {/* Live cardiac & step stats */}
                <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] font-mono">
                  <span className={`flex items-center gap-1 font-bold ${isHeartHigh ? 'text-red-300' : 'text-rose-400'}`}>
                    <Heart className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                    <span>{wristband.heartRate} bpm</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Footprints className="w-3 h-3" />
                    <span>{wristband.stepCount}</span>
                  </span>
                </div>
              </div>

              {/* Watch bottom hint */}
              <div className="text-center text-[9px] text-slate-400 tracking-wider">
                {wristband.isControlLocked
                  ? '🔒 SETTINGS LOCKED BY PARENT'
                  : wristband.isRinging
                  ? '🔔 CALLING / RINGING...'
                  : 'KIDGUARD SECURE OS'}
              </div>
            </div>

            {/* Physical SOS Hardware Button on Side */}
            <button
              onClick={handleSosClick}
              title="Hold to simulate child triggering SOS emergency on wristband"
              className={`absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-r-md border border-slate-700 transition shadow-lg ${
                wristband.isSosActive
                  ? 'bg-red-600 animate-ping'
                  : 'bg-red-700 hover:bg-red-600 active:bg-red-800'
              }`}
            />
          </div>

          {/* Lower Watch Strap */}
          <div className="w-24 h-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-b-xl opacity-90 border-b border-x border-slate-600/50" />
        </div>

        {/* Child Simulator Triggers & Testing Tools */}
        <div className="p-5 space-y-2.5 bg-slate-900">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Hardware Simulation Triggers</span>
            <span className="text-[10px] text-slate-500 font-normal">Test alerts & locks</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* SOS Emergency Trigger */}
            <button
              onClick={handleSosClick}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${
                wristband.isSosActive
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-red-950/50 hover:bg-red-900/60 border-red-800/80 text-red-200'
              }`}
            >
              <Radio className="w-4 h-4 text-red-400" />
              <span>{wristband.isSosActive ? 'Cancel SOS' : 'Trigger SOS'}</span>
            </button>

            {/* Toggle Control Lock */}
            {onToggleControlLock && (
              <button
                onClick={() => onToggleControlLock(child.id, !wristband.isControlLocked)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${
                  wristband.isControlLocked
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
              >
                {wristband.isControlLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
                <span>{wristband.isControlLocked ? 'Unlock Settings' : 'Engage Lock'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Clasp / Tamper Sensor */}
            <button
              onClick={() => onToggleClasp(child.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${
                !wristband.isWorn
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{wristband.isWorn ? 'Sim Tamper' : 'Fasten Wrist'}</span>
            </button>

            {/* Simulate Heart Rate Spike */}
            {onSimulateHeartSpike && (
              <button
                onClick={() => onSimulateHeartSpike(child.id)}
                className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-200 flex items-center justify-center gap-1.5 font-semibold transition"
              >
                <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Sim Spike (142 BPM)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Wander Outside Fence */}
            <button
              onClick={onSimulateWander}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Wander Out</span>
            </button>

            {/* Send Safe Voice Ping to Parent */}
            <button
              onClick={handleSendSafePing}
              className="p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-200 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{voiceNoteSent ? 'Ping Sent!' : "'I'm Safe' Ping"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
