import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ChildProfile, Coordinates, GeofenceZone, GPSBreadcrumb, ReferenceLandmark } from '../../types/tracking';
import {
  Layers,
  Crosshair,
  MapPin,
  Eye,
  EyeOff,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Sparkles,
  Map as MapIcon,
  Sliders,
  Shield,
  Building,
} from 'lucide-react';

interface LiveTrackingMapProps {
  selectedChild: ChildProfile;
  allChildren: ChildProfile[];
  geofences: GeofenceZone[];
  historyPoints: GPSBreadcrumb[];
  showHistoryTrail: boolean;
  onToggleHistoryTrail: () => void;
  onMoveChildManual: (newCoords: Coordinates) => void;
  isSimulatingWander: boolean;
  onStartWanderSimulation: () => void;
  onStopWanderSimulation: () => void;
  onAddNewGeofenceAt: (coords: Coordinates) => void;
  isAddGeofenceMode: boolean;
  setIsAddGeofenceMode: (val: boolean) => void;
  onRingChild: (childId: string) => void;
  onOpenIntercom: (child: ChildProfile) => void;
  // Sample Map & Blueprint Reference additions
  overlaySvgUrl?: string;
  overlayBounds?: { northEast: Coordinates; southWest: Coordinates };
  showBlueprintOverlay?: boolean;
  onToggleBlueprintOverlay?: (val: boolean) => void;
  blueprintOpacity?: number;
  landmarks?: ReferenceLandmark[];
  onOpenReferenceMapModal?: () => void;
  scenarioName?: string;
}

type MapTileTheme = 'dark' | 'voyager' | 'osm';

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  selectedChild,
  allChildren,
  geofences,
  historyPoints,
  showHistoryTrail,
  onToggleHistoryTrail,
  onMoveChildManual,
  isSimulatingWander,
  onStartWanderSimulation,
  onStopWanderSimulation,
  onAddNewGeofenceAt,
  isAddGeofenceMode,
  setIsAddGeofenceMode,
  onRingChild,
  onOpenIntercom,
  overlaySvgUrl,
  overlayBounds,
  showBlueprintOverlay = true,
  onToggleBlueprintOverlay,
  blueprintOpacity = 0.85,
  landmarks = [],
  onOpenReferenceMapModal,
  scenarioName = 'Oakridge Campus',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const geofencesLayerRef = useRef<L.LayerGroup | null>(null);
  const historyLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const blueprintOverlayRef = useRef<L.ImageOverlay | null>(null);

  const [mapTheme, setMapTheme] = useState<MapTileTheme>('dark');
  const [clickToMoveEnabled, setClickToMoveEnabled] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedChild.currentCoords.lat, selectedChild.currentCoords.lng],
        zoom: 17,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create Layer groups
      const geofencesGroup = L.layerGroup().addTo(map);
      const historyGroup = L.layerGroup().addTo(map);
      const landmarksGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      geofencesLayerRef.current = geofencesGroup;
      historyLayerRef.current = historyGroup;
      landmarksLayerRef.current = landmarksGroup;
      markersLayerRef.current = markersGroup;
      mapRef.current = map;

      // Handle map clicks
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isAddGeofenceMode) {
          onAddNewGeofenceAt({ lat: e.latlng.lat, lng: e.latlng.lng });
          setIsAddGeofenceMode(false);
        } else if (clickToMoveEnabled) {
          onMoveChildManual({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when Theme Changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';

    if (mapTheme === 'voyager') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else if (mapTheme === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';
    }

    const tileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapRef.current);

    tileLayerRef.current = tileLayer;
  }, [mapTheme]);

  // Update Blueprint Architectural Overlay
  useEffect(() => {
    if (!mapRef.current) return;

    if (blueprintOverlayRef.current) {
      mapRef.current.removeLayer(blueprintOverlayRef.current);
      blueprintOverlayRef.current = null;
    }

    if (showBlueprintOverlay && overlaySvgUrl && overlayBounds) {
      const bounds: L.LatLngBoundsExpression = [
        [overlayBounds.southWest.lat, overlayBounds.southWest.lng],
        [overlayBounds.northEast.lat, overlayBounds.northEast.lng],
      ];

      const overlay = L.imageOverlay(overlaySvgUrl, bounds, {
        opacity: blueprintOpacity,
        interactive: false,
        zIndex: 200,
      }).addTo(mapRef.current);

      blueprintOverlayRef.current = overlay;
    }
  }, [showBlueprintOverlay, overlaySvgUrl, overlayBounds, blueprintOpacity]);

  // Render Reference Landmarks (Gates, Muster Points, Classrooms, Playgrounds)
  useEffect(() => {
    if (!landmarksLayerRef.current || !mapRef.current) return;
    landmarksLayerRef.current.clearLayers();

    landmarks.forEach((lm) => {
      const isHazard = lm.category === 'hazard';
      const isMuster = lm.category === 'muster';
      const isGate = lm.category === 'gate';

      const bgClass = isHazard
        ? 'bg-rose-950 border-rose-500 text-rose-300'
        : isMuster
        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
        : isGate
        ? 'bg-amber-950 border-amber-500 text-amber-300'
        : 'bg-cyan-950 border-cyan-500 text-cyan-300';

      const landmarkIcon = L.divIcon({
        className: 'landmark-marker-label',
        html: `
          <div class="px-2 py-1 rounded-md text-[10px] font-mono border backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap ${bgClass}">
            <span class="w-1.5 h-1.5 rounded-full ${isHazard ? 'bg-rose-400 animate-ping' : 'bg-current'}"></span>
            <span class="font-bold">${lm.name}</span>
          </div>
        `,
        iconSize: [140, 24],
        iconAnchor: [70, 12],
      });

      const marker = L.marker([lm.coords.lat, lm.coords.lng], { icon: landmarkIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px;" class="p-1">
          <div class="font-bold text-slate-900">${lm.name}</div>
          <div class="text-slate-600 mt-0.5">${lm.description}</div>
          <div class="text-[10px] text-cyan-700 font-mono mt-1">Category: ${lm.category.toUpperCase()}</div>
        </div>
      `);
      landmarksLayerRef.current?.addLayer(marker);
    });
  }, [landmarks]);

  // Render Geofences
  useEffect(() => {
    if (!geofencesLayerRef.current || !mapRef.current) return;
    geofencesLayerRef.current.clearLayers();

    geofences.forEach((zone) => {
      const isDanger = zone.type === 'danger';
      const strokeColor = isDanger ? '#ef4444' : zone.color || '#10b981';
      const fillColor = isDanger ? '#ef4444' : zone.color || '#10b981';

      if (zone.shape === 'circle') {
        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radius,
          color: strokeColor,
          weight: zone.active ? 2.5 : 1,
          dashArray: isDanger ? '6, 6' : zone.active ? undefined : '4, 4',
          fillColor: fillColor,
          fillOpacity: zone.active ? (isDanger ? 0.22 : 0.14) : 0.04,
        });

        circle.bindPopup(`
          <div style="font-family: inherit; min-width: 190px;" class="p-1">
            <div class="flex items-center gap-1.5 mb-1">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${strokeColor}"></span>
              <strong style="color: #0f172a; font-size: 13px;">${zone.name}</strong>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              ${zone.description}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: ${isDanger ? '#dc2626' : '#059669'};">
              Type: ${isDanger ? 'Restricted / Hazard Zone' : 'Safe Sanctuary Zone'}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
              Radius: ${zone.radius}m · Schedule: ${zone.scheduleDescription || 'Always Active'}
            </div>
          </div>
        `);

        geofencesLayerRef.current?.addLayer(circle);

        const centerIcon = L.divIcon({
          className: 'zone-center-label',
          html: `
            <div class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide whitespace-nowrap shadow-sm border backdrop-blur-sm ${
              isDanger
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/80 border-emerald-500/30 text-emerald-300'
            }">
              ${zone.name} (${zone.radius}m)
            </div>
          `,
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });
        const labelMarker = L.marker([zone.center.lat, zone.center.lng], { icon: centerIcon });
        geofencesLayerRef.current?.addLayer(labelMarker);
      }
    });
  }, [geofences]);

  // Render History Trail
  useEffect(() => {
    if (!historyLayerRef.current) return;
    historyLayerRef.current.clearLayers();

    if (!showHistoryTrail || historyPoints.length < 2) return;

    const latLngs = historyPoints.map((p) => [p.coords.lat, p.coords.lng] as [number, number]);

    const polyline = L.polyline(latLngs, {
      color: '#06b6d4',
      weight: 3.5,
      opacity: 0.75,
      dashArray: '2, 6',
      lineCap: 'round',
    });
    historyLayerRef.current.addLayer(polyline);

    historyPoints.forEach((point, index) => {
      if (index % 4 === 0 || index === historyPoints.length - 1) {
        const timeStr = new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dotIcon = L.divIcon({
          className: 'history-milestone-marker',
          html: `
            <div class="w-2.5 h-2.5 rounded-full ${point.isInsideSafeZone ? 'bg-cyan-400' : 'bg-rose-500 ring-2 ring-rose-500/50'} border border-slate-900 shadow"></div>
          `,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const dotMarker = L.marker([point.coords.lat, point.coords.lng], { icon: dotIcon });
        dotMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 11px;">
            <div class="font-semibold text-slate-900">${timeStr} · Speed: ${point.speedKmh.toFixed(1)} km/h</div>
            <div class="text-slate-600">${point.activeZoneName || (point.isInsideSafeZone ? 'Safe Area' : 'Outside Geofence')}</div>
            <div class="text-[10px] text-slate-500">Battery at time: ${point.batteryLevel}%</div>
          </div>
        `);
        historyLayerRef.current?.addLayer(dotMarker);
      }
    });
  }, [historyPoints, showHistoryTrail]);

  // Render Children Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    allChildren.forEach((child) => {
      const isSelected = child.id === selectedChild.id;
      const isBreached = child.status === 'breached' || !child.isInsideSafeZone;
      const isSos = child.status === 'sos' || child.wristband.isSosActive;

      let statusColor = 'border-emerald-500 shadow-emerald-500/40 text-emerald-400';
      let ringColor = 'ring-emerald-400/30';
      let pulseGlow = 'bg-emerald-500/20';

      if (isSos) {
        statusColor = 'border-red-600 shadow-red-600/70 text-red-400 animate-pulse';
        ringColor = 'ring-red-500/60';
        pulseGlow = 'bg-red-600/40';
      } else if (isBreached) {
        statusColor = 'border-rose-500 shadow-rose-500/50 text-rose-400';
        ringColor = 'ring-rose-500/40';
        pulseGlow = 'bg-rose-500/30';
      } else if (child.wristband.batteryLevel < 20) {
        statusColor = 'border-amber-500 shadow-amber-500/40 text-amber-400';
        ringColor = 'ring-amber-400/30';
        pulseGlow = 'bg-amber-500/20';
      }

      const markerHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <div class="absolute -inset-4 rounded-full ${pulseGlow} animate-ping opacity-60"></div>
          
          <div class="relative w-12 h-12 rounded-full border-2 ${statusColor} p-0.5 bg-slate-900 shadow-lg ring-4 ${ringColor} transition-transform hover:scale-110">
            <img 
              src="${child.avatar}" 
              alt="${child.name}" 
              class="w-full h-full object-cover rounded-full" 
            />
            
            <div 
              style="transform: rotate(${child.heading}deg) translateY(-22px);"
              class="absolute top-1/2 left-1/2 -ml-1 w-2 h-2 bg-cyan-400 border border-slate-900 rotate-45 transform"
            ></div>

            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isSos
                ? 'bg-red-600 text-white animate-bounce'
                : isBreached
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }">
              ${isSos ? '!' : isBreached ? '✕' : '✓'}
            </div>
          </div>

          <div class="mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight shadow-md border backdrop-blur-md whitespace-nowrap ${
            isSelected
              ? 'bg-slate-900/95 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/80 border-slate-700 text-slate-300'
          }">
            <span>${child.name}</span>
            <span class="opacity-60 font-mono text-[10px] ml-1">· ${child.speedKmh.toFixed(1)} km/h</span>
          </div>
        </div>
      `;

      const childIcon = L.divIcon({
        className: 'custom-child-marker',
        html: markerHtml,
        iconSize: [48, 70],
        iconAnchor: [24, 32],
      });

      const marker = L.marker([child.currentCoords.lat, child.currentCoords.lng], {
        icon: childIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      marker.on('click', () => {
        mapRef.current?.panTo([child.currentCoords.lat, child.currentCoords.lng]);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px;" class="p-1 text-slate-900">
          <div class="flex items-center gap-2 mb-2">
            <img src="${child.avatar}" class="w-8 h-8 rounded-full object-cover border" />
            <div>
              <div class="font-bold text-sm leading-tight">${child.name} (Age ${child.age})</div>
              <div class="text-[11px] text-slate-500 font-mono">${child.wristband.model}</div>
            </div>
          </div>

          <div class="space-y-1 text-xs border-y border-slate-200 py-1.5 my-1.5">
            <div class="flex justify-between">
              <span class="text-slate-500">Status:</span>
              <strong class="${isBreached ? 'text-rose-600 font-bold' : 'text-emerald-600'}">
                ${isSos ? '🚨 SOS EMERGENCY' : isBreached ? '⚠️ OUTSIDE GEOFENCE' : '✓ Safe inside zone'}
              </strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Zone:</span>
              <span>${child.currentZoneName || 'Unassigned / Open'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Speed / Heading:</span>
              <span>${child.speedKmh.toFixed(1)} km/h · ${Math.round(child.heading)}°</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Wristband Battery:</span>
              <span class="font-medium">${child.wristband.batteryLevel}% · Heart: ${child.wristband.heartRate} bpm</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Skin Contact:</span>
              <span>${child.wristband.isWorn ? '✓ Worn on wrist' : '⚠️ Clasp Removed!'}</span>
            </div>
          </div>

          <div class="mt-2 flex gap-1.5">
            <button id="btn-ring-${child.id}" class="flex-1 py-1 px-2 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded transition">
              Ring Wristband
            </button>
            <button id="btn-intercom-${child.id}" class="flex-1 py-1 px-2 text-[11px] font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded transition">
              Call Voice
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const ringBtn = document.getElementById(`btn-ring-${child.id}`);
        const intercomBtn = document.getElementById(`btn-intercom-${child.id}`);
        if (ringBtn) ringBtn.onclick = () => onRingChild(child.id);
        if (intercomBtn) intercomBtn.onclick = () => onOpenIntercom(child);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [allChildren, selectedChild]);

  // Recenter map on selected child coordinate change
  const centerOnSelectedChild = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(
        [selectedChild.currentCoords.lat, selectedChild.currentCoords.lng],
        17,
        { duration: 0.8 }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-slate-950 overflow-hidden select-none">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Map Controls - Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Active Child Focus Chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs text-slate-200">
          <div className="relative">
            <img
              src={selectedChild.avatar}
              alt={selectedChild.name}
              className="w-7 h-7 rounded-full object-cover border border-cyan-400/40"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                selectedChild.isInsideSafeZone ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`}
            />
          </div>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{selectedChild.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {selectedChild.wristband.model.split(' ')[0]}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{selectedChild.currentZoneName || 'Outside Boundaries'}</span>
              <span>·</span>
              <span className="font-mono text-cyan-300">{selectedChild.speedKmh.toFixed(1)} km/h</span>
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg">
          <button
            onClick={centerOnSelectedChild}
            title="Center on Child"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleHistoryTrail}
            title={showHistoryTrail ? 'Hide GPS Breadcrumb History' : 'Show GPS Breadcrumbs'}
            className={`p-2 rounded-lg transition ${
              showHistoryTrail
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showHistoryTrail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsAddGeofenceMode(!isAddGeofenceMode)}
            title={isAddGeofenceMode ? 'Cancel Geofence Placement' : 'Click on Map to Add Geofence'}
            className={`p-2 rounded-lg transition ${
              isAddGeofenceMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setClickToMoveEnabled(!clickToMoveEnabled)}
            title={clickToMoveEnabled ? 'Click-to-Move GPS Mode (Active)' : 'Click-to-Move GPS Mode (Paused)'}
            className={`p-2 rounded-lg transition ${
              clickToMoveEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* Reference Map Modal Trigger */}
          {onOpenReferenceMapModal && (
            <button
              onClick={onOpenReferenceMapModal}
              title="Sample Reference Maps & Site Blueprints"
              className="p-2 rounded-lg hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 transition"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Blueprint Overlay Badge & Scenario Pill - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {onOpenReferenceMapModal && (
          <button
            onClick={onOpenReferenceMapModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/40 backdrop-blur-md shadow-xl text-xs font-semibold text-cyan-200 hover:border-cyan-400 transition"
          >
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reference Map: {scenarioName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Blueprint ON
            </span>
          </button>
        )}
      </div>

      {/* Map Mode Status Banner (if Add Geofence active) */}
      {isAddGeofenceMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-emerald-950/90 border border-emerald-500/50 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-emerald-200 animate-pulse">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Click anywhere on the map to place a new safe/danger geofence center</span>
          <button
            onClick={() => setIsAddGeofenceMode(false)}
            className="ml-2 underline text-emerald-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Floating Simulation Bar - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Live Wander Simulator Trigger */}
        <button
          onClick={isSimulatingWander ? onStopWanderSimulation : onStartWanderSimulation}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition shadow-lg border ${
            isSimulatingWander
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-500/60 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isSimulatingWander ? 'text-rose-400' : 'text-amber-400'}`} />
          <span>{isSimulatingWander ? 'Stop Wander Simulation' : 'Simulate Child Wandering Out'}</span>
        </button>

        {/* Map Tile Theme Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg text-[11px]">
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapTheme === 'dark' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Ops
          </button>
          <button
            onClick={() => setMapTheme('voyager')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapTheme === 'voyager' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapTheme('osm')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapTheme === 'osm' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OSM
          </button>
        </div>
      </div>

      {/* Click-to-move Hint Badge - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80 hover:opacity-100 transition">
        <div className="px-3.5 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full text-[11px] text-slate-400 shadow-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Tip: Click map to relocate child GPS · Blueprint site plan aligned</span>
          {showHistoryTrail && (
            <span className="text-cyan-400 font-mono">· {historyPoints.length} breadcrumbs</span>
          )}
        </div>
      </div>
    </div>
  );
};
