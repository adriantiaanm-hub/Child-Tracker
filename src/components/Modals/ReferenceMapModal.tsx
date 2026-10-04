import React, { useState } from 'react';
import { SampleScenario, ReferenceLandmark } from '../../types/tracking';
import { SAMPLE_MAP_SCENARIOS } from '../../data/mockScenarios';
import {
  Map,
  X,
  Layers,
  CheckCircle2,
  Sliders,
  Sparkles,
  MapPin,
  Shield,
  AlertTriangle,
  Upload,
  Eye,
  Building,
  Flag,
  ChevronRight,
} from 'lucide-react';

interface ReferenceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  onSelectScenario: (scenario: SampleScenario) => void;
  showBlueprintOverlay: boolean;
  onToggleBlueprintOverlay: (val: boolean) => void;
  blueprintOpacity: number;
  onChangeBlueprintOpacity: (val: number) => void;
  onCustomMapImageUpload?: (url: string) => void;
}

export const ReferenceMapModal: React.FC<ReferenceMapModalProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  onSelectScenario,
  showBlueprintOverlay,
  onToggleBlueprintOverlay,
  blueprintOpacity,
  onChangeBlueprintOpacity,
  onCustomMapImageUpload,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(activeScenarioId);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customError, setCustomError] = useState<string>('');

  if (!isOpen) return null;

  const currentScenario =
    SAMPLE_MAP_SCENARIOS.find((s) => s.id === selectedScenarioId) || SAMPLE_MAP_SCENARIOS[0];

  const handleApplyScenario = (scenario: SampleScenario) => {
    onSelectScenario(scenario);
    onClose();
  };

  const handleApplyCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    if (onCustomMapImageUpload) {
      onCustomMapImageUpload(customImageUrl.trim());
      setCustomImageUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">Sample Reference Maps & Site Blueprints</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Architectural GIS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect campus layouts, building footprints, muster stations, and sample geofence boundaries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scenarios Selector + Interactive Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Scenario Choices */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-2.5 overflow-y-auto bg-slate-950/30 shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Sample Reference Map
            </div>

            {SAMPLE_MAP_SCENARIOS.map((scenario) => {
              const isSelected = scenario.id === selectedScenarioId;
              const isActiveInApp = scenario.id === activeScenarioId;

              return (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-cyan-500/70 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-200">{scenario.name}</span>
                    {isActiveInApp && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{scenario.landmarks.length} Landmarks</span>
                    <span>{scenario.geofences.length} Geofences</span>
                  </div>
                </div>
              );
            })}

            {/* Custom Reference Image Upload Section */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Custom Reference Map URL</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                Input any blueprint, school floor plan, or park guide image URL to overlay on the map.
              </p>
              <form onSubmit={handleApplyCustomImage} className="space-y-1.5">
                <input
                  type="url"
                  placeholder="https://example.com/site-plan.png"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!customImageUrl.trim()}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition"
                >
                  Load Custom Blueprint
                </button>
              </form>
            </div>
          </div>

          {/* Right Main Pane: Blueprint Detailed Diagram & Landmarks */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Top Toolbar: Scenario Header + Activate Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-100">{currentScenario.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentScenario.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentScenario.description}</p>
              </div>

              <button
                onClick={() => handleApplyScenario(currentScenario)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Load This Map Scenario</span>
              </button>
            </div>

            {/* Illustrated Architectural Blueprint Frame */}
            <div className="relative rounded-2xl border-2 border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl p-2 group">
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-cyan-300">
                BLUEPRINT REFERENCE SCHEMATIC (GIS ALIGNED)
              </div>

              {/* Blueprint Image Display */}
              <div className="w-full aspect-[4/3] max-h-[290px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={currentScenario.overlaySvgUrl}
                  alt={currentScenario.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Map Overlay Controls Overlay Bar */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBlueprintOverlay(!showBlueprintOverlay)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      showBlueprintOverlay
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {showBlueprintOverlay ? 'Map Overlay: Active' : 'Map Overlay: Hidden'}
                    </span>
                  </button>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="text-slate-400">Overlay Opacity:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={blueprintOpacity}
                    onChange={(e) => onChangeBlueprintOpacity(Number(e.target.value))}
                    className="w-28 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono text-cyan-300 font-semibold">
                    {Math.round(blueprintOpacity * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Landmark Directory & Safety Annotations */}
            <div>
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Reference Landmarks & Safety Perimeters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentScenario.landmarks.map((lm) => {
                  const isHazard = lm.category === 'hazard';
                  const isGate = lm.category === 'gate';
                  const isMuster = lm.category === 'muster';

                  return (
                    <div
                      key={lm.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        isHazard
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : isMuster
                          ? 'bg-emerald-950/20 border-emerald-900/60'
                          : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isHazard ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : isMuster ? (
                          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className={`font-semibold ${isHazard ? 'text-rose-200' : 'text-slate-200'}`}>
                          {lm.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{lm.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {lm.coords.lat.toFixed(4)}, {lm.coords.lng.toFixed(4)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
