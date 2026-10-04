import React, { useState } from 'react';
import { GeofenceZone, Coordinates } from '../../types/tracking';
import { Shield, AlertTriangle, Plus, Trash2, Check, X, Sliders, MapPin } from 'lucide-react';

interface GeofenceManagerProps {
  geofences: GeofenceZone[];
  onToggleZoneActive: (id: string) => void;
  onUpdateRadius: (id: string, newRadius: number) => void;
  onDeleteZone: (id: string) => void;
  onAddZone: (zone: GeofenceZone) => void;
  defaultCenter: Coordinates;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  onToggleZoneActive,
  onUpdateRadius,
  onDeleteZone,
  onAddZone,
  defaultCenter,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<'safe' | 'danger'>('safe');
  const [newZoneRadius, setNewZoneRadius] = useState<number>(200);
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [editingRadiusId, setEditingRadiusId] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const newZone: GeofenceZone = {
      id: `zone-custom-${Date.now()}`,
      name: newZoneName.trim(),
      type: newZoneType,
      shape: 'circle',
      center: { ...defaultCenter },
      radius: newZoneRadius,
      color: newZoneType === 'safe' ? '#10b981' : '#f43f5e',
      active: true,
      scheduleDescription: '24/7 Monitored',
      description: newZoneDesc.trim() || (newZoneType === 'safe' ? 'Custom safe perimeter' : 'Restricted boundary'),
    };

    onAddZone(newZone);
    setNewZoneName('');
    setNewZoneDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none flex flex-col gap-3">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">Active Geofences</h3>
            <p className="text-[10px] text-slate-400">
              {geofences.filter((g) => g.active).length} of {geofences.length} perimeters active
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{showAddForm ? 'Cancel' : 'New Zone'}</span>
        </button>
      </div>

      {/* Add Zone inline Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateSubmit} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Define New Geofence Perimeter</span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Zone Name</label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="e.g. Grandparents House, Library, Soccer Pitch"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Perimeter Type</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setNewZoneType('safe')}
                  className={`flex-1 py-1 rounded text-center font-medium transition ${
                    newZoneType === 'safe'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Safe Zone
                </button>
                <button
                  type="button"
                  onClick={() => setNewZoneType('danger')}
                  className={`flex-1 py-1 rounded text-center font-medium transition ${
                    newZoneType === 'danger'
                      ? 'bg-rose-950 border border-rose-500 text-rose-300'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Danger Zone
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Radius</span>
                <span className="font-mono text-cyan-300 font-semibold">{newZoneRadius}m</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={newZoneRadius}
                onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Note / Description</label>
            <input
              type="text"
              value={newZoneDesc}
              onChange={(e) => setNewZoneDesc(e.target.value)}
              placeholder="e.g. Front yard & patio"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded-lg text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Zone</span>
            </button>
          </div>
        </form>
      )}

      {/* Geofence List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {geofences.map((zone) => {
          const isDanger = zone.type === 'danger';
          const isEditingThisRadius = editingRadiusId === zone.id;

          return (
            <div
              key={zone.id}
              className={`p-3 rounded-xl border transition ${
                zone.active
                  ? isDanger
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : 'bg-slate-950/60 border-slate-800'
                  : 'bg-slate-950/20 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => onToggleZoneActive(zone.id)}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition ${
                      zone.active
                        ? isDanger
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                    title={zone.active ? 'Disable Geofence' : 'Enable Geofence'}
                  >
                    {zone.active && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">{zone.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          isDanger
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isDanger ? 'DANGER ZONE' : 'SAFE ZONE'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {zone.description}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{zone.radius}m perimeter</span>
                      <span>·</span>
                      <span>{zone.scheduleDescription || '24/7'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingRadiusId(isEditingThisRadius ? null : zone.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      isEditingThisRadius
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Adjust Radius"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {zone.id.startsWith('zone-custom') && (
                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Custom Geofence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Radius Slider */}
              {isEditingThisRadius && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                    <span>Adjust Boundary Radius:</span>
                    <span className="font-mono text-cyan-400 font-bold">{zone.radius} meters</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="20"
                    value={zone.radius}
                    onChange={(e) => onUpdateRadius(zone.id, Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
