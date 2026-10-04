import React, { useState, useEffect } from 'react';
import { Shield, Radio, Volume2, VolumeX, AlertOctagon, Watch, Bell, RefreshCw, Zap, Map as MapIcon } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface HeaderProps {
  activeBreachCount: number;
  hasSos: boolean;
  onOpenWristbandSimulator: () => void;
  onOpenAlertsFeed: () => void;
  unreadAlertsCount: number;
  onResetData: () => void;
  onOpenReferenceMap?: () => void;
  activeScenarioBadge?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeBreachCount,
  hasSos,
  onOpenWristbandSimulator,
  onOpenAlertsFeed,
  unreadAlertsCount,
  onResetData,
  onOpenReferenceMap,
  activeScenarioBadge = 'School Campus',
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const testAlarmSound = () => {
    soundManager.playBreachAlarm();
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Brand & System Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
          <Shield className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-slate-100 text-base md:text-lg">
              Kineti<span className="text-cyan-400">Guard</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 uppercase">
              Parent Ops
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Active</span>
            </span>
            <span>·</span>
            <span className="font-mono text-slate-400">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Emergency Status Pill if Breach or SOS */}
      {(hasSos || activeBreachCount > 0) && (
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md animate-pulse ${
          hasSos
            ? 'bg-red-950/80 border-red-500 text-red-200'
            : 'bg-rose-950/80 border-rose-500 text-rose-200'
        }`}>
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold">
            {hasSos ? 'SOS EMERGENCY SIGNAL RECEIVED!' : `${activeBreachCount} Child Outside Safe Perimeter!`}
          </span>
        </div>
      )}

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sample Reference Map Switcher Button */}
        {onOpenReferenceMap && (
          <button
            onClick={onOpenReferenceMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-600/40 shadow-md transition"
            title="Open sample reference maps, site blueprints, and campus layouts"
          >
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Reference Maps</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-900 text-cyan-300 border border-cyan-700">
              {activeScenarioBadge}
            </span>
          </button>
        )}

        {/* Wristband Digital Twin Simulator Modal Button */}
        <button
          onClick={onOpenWristbandSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-md hover:border-cyan-400/60 transition"
          title="Open interactive digital twin of child wristband hardware"
        >
          <Watch className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Wearable Twin</span>
        </button>

        {/* Audio Mute & Sound Test Button */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg text-xs transition ${
              isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-cyan-400 hover:text-cyan-300'
            }`}
            title={isMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {!isMuted && (
            <button
              onClick={testAlarmSound}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 font-medium"
              title="Test Breach Alarm Siren"
            >
              Test Siren
            </button>
          )}
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlertsFeed}
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          title="Open Geofence & System Alerts Feed"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-slate-950">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Reset Simulation Data */}
        <button
          onClick={onResetData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          title="Reset to Baseline Simulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

