import React, { useState } from 'react';
import { ChildProfile, WristbandTelemetry } from '../../types/tracking';
import {
  Heart,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Sliders,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';

interface HeartRateControlLockCardProps {
  child: ChildProfile;
  onToggleControlLock: (childId: string, locked: boolean) => void;
  onChangeLockMode: (childId: string, mode: WristbandTelemetry['lockMode']) => void;
  onUpdateHeartThreshold: (childId: string, maxBpm: number) => void;
  onToggleAutoLock: (childId: string, enabled: boolean) => void;
  onSimulateHeartSpike: (childId: string) => void;
  onResetHeartRate: (childId: string) => void;
}

export const HeartRateControlLockCard: React.FC<HeartRateControlLockCardProps> = ({
  child,
  onToggleControlLock,
  onChangeLockMode,
  onUpdateHeartThreshold,
  onToggleAutoLock,
  onSimulateHeartSpike,
  onResetHeartRate,
}) => {
  const { wristband } = child;
  const isHeartHigh = wristband.heartRate >= wristband.heartRateThresholdMax;

  // Render SVG Heart Rate Sparkline
  const renderSparkline = () => {
    const history = wristband.heartRateHistory || [];
    if (history.length < 2) return null;

    const minBpm = Math.min(...history.map((h) => h.bpm), 60);
    const maxBpm = Math.max(...history.map((h) => h.bpm), 140);
    const range = maxBpm - minBpm || 1;

    const width = 280;
    const height = 48;

    const points = history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((h.bpm - minBpm) / range) * (height - 8) - 4;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-12 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Baseline threshold dashed line */}
        <line
          x1="0"
          y1={height - ((wristband.heartRateThresholdMax - minBpm) / range) * (height - 8) - 4}
          x2={width}
          y2={height - ((wristband.heartRateThresholdMax - minBpm) / range) * (height - 8) - 4}
          stroke="#f43f5e"
          strokeWidth="1"
          strokeDasharray="4, 4"
          opacity="0.6"
        />
        {/* Trend Polyline */}
        <polyline
          fill="none"
          stroke={isHeartHigh ? '#f43f5e' : '#06b6d4'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Last node dot */}
        {history.length > 0 && (
          <circle
            cx={width}
            cy={
              height -
              ((history[history.length - 1].bpm - minBpm) / range) * (height - 8) -
              4
            }
            r="4"
            fill={isHeartHigh ? '#f43f5e' : '#38bdf8'}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Biometric Heart Rate & Device Lock</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Continuous cardiac monitoring and remote wristband safety lockout
            </p>
          </div>
        </div>

        {/* Lock Status Pill */}
        <div className="flex items-center gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
              wristband.isControlLocked
                ? 'bg-amber-950/80 border-amber-600/70 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {wristband.isControlLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
            <span>{wristband.isControlLocked ? 'Wristband Locked' : 'Unlocked'}</span>
          </span>
        </div>
      </div>

      {/* Heart Rate Telemetry & Live Trend Card */}
      <div
        className={`p-3 rounded-xl border transition-all ${
          isHeartHigh
            ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/30'
            : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-100">
              {wristband.heartRate}
            </span>
            <span className="text-xs font-mono text-slate-400">BPM</span>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                isHeartHigh
                  ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                  : wristband.heartRate > 100
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {isHeartHigh ? 'CRITICAL SPIKE' : wristband.heartRate > 100 ? 'ELEVATED' : 'RESTING NORMAL'}
            </span>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-400">
            <div>Resting: <span className="text-slate-200">{wristband.restingHeartRate} BPM</span></div>
            <div>Peak Today: <span className="text-slate-200">{wristband.peakHeartRate} BPM</span></div>
          </div>
        </div>

        {/* Sparkline Waveform */}
        <div className="mt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-1">
            <span>Last 10 min cardiac trend</span>
            <span className="text-rose-400">Threshold: {wristband.heartRateThresholdMax} BPM</span>
          </div>
          {renderSparkline()}
        </div>
      </div>

      {/* Control Lock Panel */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Parent Control Lockout</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Locks wristband screen & power button so child cannot tamper or shut down
            </p>
          </div>

          <button
            onClick={() => onToggleControlLock(child.id, !wristband.isControlLocked)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm flex items-center gap-1.5 ${
              wristband.isControlLocked
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
          >
            {wristband.isControlLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{wristband.isControlLocked ? 'Lock Active' : 'Engage Lock'}</span>
          </button>
        </div>

        {/* Lock Mode Selector */}
        {wristband.isControlLocked && (
          <div className="pt-2 border-t border-slate-850">
            <span className="text-[10px] text-slate-400 block mb-1.5">Select Lock Preset:</span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                onClick={() => onChangeLockMode(child.id, 'child_lock')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                  wristband.lockMode === 'child_lock'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Child Safety Lock
              </button>
              <button
                onClick={() => onChangeLockMode(child.id, 'school_lock')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                  wristband.lockMode === 'school_lock'
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Classroom Silence
              </button>
              <button
                onClick={() => onChangeLockMode(child.id, 'emergency_lockdown')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                  wristband.lockMode === 'emergency_lockdown'
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Emergency Lock
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Heart Rate Auto-Lock Trigger Configuration */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Cardiac Auto-Lock Trigger</span>
          </div>

          <button
            onClick={() => onToggleAutoLock(child.id, !wristband.autoLockOnHeartSpike)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition ${
              wristband.autoLockOnHeartSpike
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {wristband.autoLockOnHeartSpike ? 'Auto-Lock Enabled' : 'Disabled'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          If {child.name.split(' ')[0]}'s heart rate exceeds threshold (panic, struggle, or sprinting), the wristband locks into distress mode and alarms parents.
        </p>

        {/* Threshold Slider */}
        <div className="pt-1.5">
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span>Distress Alert Threshold:</span>
            <span className="font-mono text-rose-400 font-bold">
              {wristband.heartRateThresholdMax} BPM
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="160"
            step="5"
            value={wristband.heartRateThresholdMax}
            onChange={(e) => onUpdateHeartThreshold(child.id, Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Simulation Actions */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          onClick={() => onSimulateHeartSpike(child.id)}
          className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 transition flex items-center justify-center gap-1.5 shadow"
          title="Simulate sudden heart rate spike to 142 BPM to test biometric auto-lock"
        >
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate Heart Spike</span>
        </button>

        <button
          onClick={() => onResetHeartRate(child.id)}
          className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition flex items-center justify-center gap-1.5"
          title="Normalize heart rate back to resting 82 BPM"
        >
          <Heart className="w-3.5 h-3.5 text-emerald-400" />
          <span>Normalize BPM</span>
        </button>
      </div>
    </div>
  );
};
