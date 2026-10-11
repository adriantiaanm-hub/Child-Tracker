import React from 'react';
import { ChildProfile, Coordinates, ParentLocationState } from '../../types/tracking';
import { formatDistance } from '../../utils/geo';
import {
  Compass,
  Navigation,
  MapPin,
  Footprints,
  Radio,
  LocateFixed,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Move,
  User,
} from 'lucide-react';

interface ParentProximityCardProps {
  child: ChildProfile;
  parentState: ParentLocationState;
  onToggleTether: (enabled: boolean) => void;
  onChangeTetherRadius: (radius: number) => void;
  onAcquireRealGps: () => void;
  onSetParentClickMode: (active: boolean) => void;
  isParentClickMode: boolean;
  onRelocateParentNearChild: () => void;
}

export const ParentProximityCard: React.FC<ParentProximityCardProps> = ({
  child,
  parentState,
  onToggleTether,
  onChangeTetherRadius,
  onAcquireRealGps,
  onSetParentClickMode,
  isParentClickMode,
  onRelocateParentNearChild,
}) => {
  const isTetherBreached =
    parentState.proximityTetherEnabled &&
    parentState.distanceToSelectedChild > parentState.proximityTetherRadiusMeters;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Parent-to-Child Distance</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400">
              Live proximity telemetry from your device to {child.name}
            </p>
          </div>
        </div>

        {/* Parent GPS status chip */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAcquireRealGps}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition flex items-center gap-1 ${
              parentState.isUsingRealGps
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
            title="Use device GPS sensor"
          >
            <LocateFixed className="w-3 h-3 text-cyan-400" />
            <span>{parentState.isUsingRealGps ? 'Live Device GPS' : 'Simulated GPS'}</span>
          </button>
        </div>
      </div>

      {/* Main Distance Meter Box */}
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          isTetherBreached
            ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
            : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            <span>Distance Between You & {child.name.split(' ')[0]}</span>
          </span>

          {isTetherBreached && (
            <span className="text-[10px] font-semibold text-rose-300 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 animate-pulse flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Tether Exceeded!</span>
            </span>
          )}
        </div>

        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-100 flex items-baseline gap-1.5">
              <span>{formatDistance(parentState.distanceToSelectedChild)}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1 text-cyan-300 font-medium">
                <Footprints className="w-3 h-3" />
                <span>~{parentState.walkingEtaMinutes} min walk</span>
              </span>
              <span>·</span>
              <span className="font-mono text-slate-300">
                Direction: {parentState.compassDirection} ({Math.round(parentState.bearingToSelectedChild)}°)
              </span>
            </div>
          </div>

          {/* Compass Bearing Visual Indicator */}
          <div className="relative w-12 h-12 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0 shadow-inner">
            <div
              style={{ transform: `rotate(${parentState.bearingToSelectedChild}deg)` }}
              className="w-full h-full flex flex-col items-center justify-start pt-1 transition-transform duration-300"
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-cyan-400" />
            </div>
            <span className="absolute text-[8px] font-mono text-slate-400 font-bold">
              {parentState.compassDirection}
            </span>
          </div>
        </div>
      </div>

      {/* Virtual Leash / Proximity Tether Control */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Virtual Leash / Proximity Tether</span>
          </div>

          <button
            onClick={() => onToggleTether(!parentState.proximityTetherEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              parentState.proximityTetherEnabled
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {parentState.proximityTetherEnabled ? 'Tether Armed' : 'Disabled'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          Alerts you instantly if {child.name.split(' ')[0]} moves farther than the safe tether distance from your position.
        </p>

        {parentState.proximityTetherEnabled && (
          <div className="pt-2 border-t border-slate-850">
            <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
              <span>Tether Boundary Radius:</span>
              <span className="font-mono text-cyan-300 font-bold">
                {parentState.proximityTetherRadiusMeters} meters
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="10"
              value={parentState.proximityTetherRadiusMeters}
              onChange={(e) => onChangeTetherRadius(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
              <span>20m (Crowd/Mall)</span>
              <span>100m (Park)</span>
              <span>250m (Neighborhood)</span>
            </div>
          </div>
        )}
      </div>

      {/* Location Simulation Toolbar */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          onClick={() => onSetParentClickMode(!isParentClickMode)}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
            isParentClickMode
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
          }`}
          title="Click on map to place parent location"
        >
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isParentClickMode ? 'Click Map for You' : 'Place You on Map'}</span>
        </button>

        <button
          onClick={onRelocateParentNearChild}
          className="py-1.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition"
          title="Teleport parent location 45m from child to simulate close supervision"
        >
          Walk Near Child
        </button>
      </div>
    </div>
  );
};
