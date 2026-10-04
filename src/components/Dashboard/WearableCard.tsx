import React, { useState } from 'react';
import { ChildProfile } from '../../types/tracking';
import {
  Watch,
  Heart,
  Battery,
  BatteryCharging,
  Signal,
  Radio,
  Footprints,
  Thermometer,
  BellRing,
  PhoneCall,
  AlertCircle,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

interface WearableCardProps {
  child: ChildProfile;
  onRingWristband: (childId: string) => void;
  onOpenIntercom: (child: ChildProfile) => void;
  onSimulateTamper: (childId: string) => void;
  onSimulateSos: (childId: string) => void;
}

export const WearableCard: React.FC<WearableCardProps> = ({
  child,
  onRingWristband,
  onOpenIntercom,
  onSimulateTamper,
  onSimulateSos,
}) => {
  const { wristband } = child;
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 900);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      {/* Header: Model & Hardware ID */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>{wristband.model}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              ID: {wristband.deviceId} · FW {wristband.firmwareVersion}
            </div>
          </div>
        </div>

        {/* Live sync pill */}
        <button
          onClick={handlePing}
          title="Manual GPS & Telemetry Sync"
          className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
        >
          <RotateCw className={`w-3 h-3 text-cyan-400 ${isPinging ? 'animate-spin' : ''}`} />
          <span>Synced</span>
        </button>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        {/* Heart Rate Metric */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Heart Rate</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-100">{wristband.heartRate}</span>
            <span className="text-[10px] text-slate-400">BPM</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${Math.min(100, (wristband.heartRate / 140) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-emerald-400">Normal</span>
          </div>
        </div>

        {/* Battery Metric */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Battery</span>
            {wristband.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery
                className={`w-3.5 h-3.5 ${wristband.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`}
              />
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-100">{wristband.batteryLevel}%</span>
            <span className="text-[10px] text-slate-400">~18h rem</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  wristband.batteryLevel < 20 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${wristband.batteryLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Skin Contact / Tamper Status */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Wrist Clasp</span>
            <ShieldCheck
              className={`w-3.5 h-3.5 ${wristband.isWorn ? 'text-emerald-400' : 'text-rose-500'}`}
            />
          </div>
          <div className="mt-1">
            <span
              className={`text-xs font-semibold ${
                wristband.isWorn ? 'text-emerald-300' : 'text-rose-400 font-bold'
              }`}
            >
              {wristband.isWorn ? 'Fastened On Wrist' : 'Tamper Detected!'}
            </span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400">
            {wristband.isWorn ? 'Optical skin lock active' : 'Wristband removed'}
          </div>
        </div>

        {/* Connectivity & Satellites */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Cellular & GPS</span>
            <Signal className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-200">{wristband.cellularType}</span>
            <span className="text-[10px] text-cyan-400 font-mono">({wristband.satelliteCount} Sats)</span>
          </div>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className={`w-1.5 h-1.5 rounded-sm ${
                  bar <= wristband.signalStrength ? 'bg-cyan-400' : 'bg-slate-800'
                }`}
              />
            ))}
            <span className="text-[9px] text-slate-400 ml-1 font-mono">-76dBm</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row: Activity Steps & Ambient Temp */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/40 rounded-xl border border-slate-800/50 text-xs text-slate-300 mb-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Steps Today:</span>
          <span className="font-mono font-semibold text-slate-200">
            {wristband.stepCount.toLocaleString()} steps
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({((wristband.stepCount * 0.00065)).toFixed(1)} km)
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-slate-300 text-[11px]">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>{wristband.ambientTempC.toFixed(1)}°C</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Ring Wristband */}
        <button
          onClick={() => onRingWristband(child.id)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
            wristband.isRinging
              ? 'bg-amber-950 border-amber-500 text-amber-300 animate-bounce'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
          title="Sound 85dB beacon chime on child wristband"
        >
          <BellRing className={`w-3.5 h-3.5 ${wristband.isRinging ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} />
          <span>{wristband.isRinging ? 'Ringing...' : 'Ring Watch'}</span>
        </button>

        {/* 2-Way Voice Intercom Call */}
        <button
          onClick={() => onOpenIntercom(child)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 transition"
          title="Start two-way voice call with child's wristband"
        >
          <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intercom</span>
        </button>

        {/* Simulate Wristband Tamper / Removal */}
        <button
          onClick={() => onSimulateTamper(child.id)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
            !wristband.isWorn
              ? 'bg-rose-950/80 border-rose-500 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Simulate unbuckling or removing the wristband"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{wristband.isWorn ? 'Sim Tamper' : 'Fasten Wrist'}</span>
        </button>

        {/* Trigger Child SOS */}
        <button
          onClick={() => onSimulateSos(child.id)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
            wristband.isSosActive
              ? 'bg-red-600 border-red-400 text-white animate-pulse'
              : 'bg-red-950/70 hover:bg-red-900/90 border-red-700/60 text-red-200'
          }`}
          title="Simulate child pressing SOS emergency button on wristband"
        >
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span>{wristband.isSosActive ? 'Cancel SOS' : 'Simulate SOS'}</span>
        </button>
      </div>
    </div>
  );
};
