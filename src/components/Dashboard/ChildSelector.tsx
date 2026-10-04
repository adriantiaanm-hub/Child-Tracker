import React from 'react';
import { ChildProfile } from '../../types/tracking';
import { BatteryCharging, Battery, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

interface ChildSelectorProps {
  childrenList: ChildProfile[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  onRingChild: (id: string) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
  onRingChild,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
      {childrenList.map((child) => {
        const isSelected = child.id === selectedChildId;
        const isBreached = child.status === 'breached' || !child.isInsideSafeZone;
        const isSos = child.status === 'sos' || child.wristband.isSosActive;

        return (
          <div
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`cursor-pointer min-w-[210px] flex-1 p-3 rounded-2xl border transition-all duration-200 relative ${
              isSelected
                ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            {/* Top row: Avatar + Name + SOS/Status badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isSos
                        ? 'bg-red-600 animate-ping'
                        : isBreached
                        ? 'bg-rose-500'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm leading-tight flex items-center gap-1">
                    <span>{child.name}</span>
                    <span className="text-xs text-slate-400 font-normal">({child.age}y)</span>
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[100px]">
                    {child.wristband.deviceId}
                  </div>
                </div>
              </div>

              {/* Status Indicator Icon */}
              {isSos ? (
                <div className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300 text-[10px] font-bold animate-pulse">
                  SOS!
                </div>
              ) : isBreached ? (
                <div className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Out</span>
                </div>
              ) : (
                <div className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Safe</span>
                </div>
              )}
            </div>

            {/* Bottom row: Current Zone & Battery / Speed */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[120px] text-slate-300">
                {child.currentZoneName || 'Outside Geofence'}
              </span>

              <div className="flex items-center gap-1.5 shrink-0 font-mono">
                {child.wristband.isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Battery
                    className={`w-3.5 h-3.5 ${
                      child.wristband.batteryLevel < 20 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  />
                )}
                <span className={child.wristband.batteryLevel < 20 ? 'text-rose-400 font-semibold' : ''}>
                  {child.wristband.batteryLevel}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
