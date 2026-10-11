import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChildProfile,
  Coordinates,
  GeofenceZone,
  GPSBreadcrumb,
  AlertNotification,
  SampleScenario,
  ParentLocationState,
  WristbandTelemetry,
} from './types/tracking';
import {
  INITIAL_CHILDREN,
  INITIAL_GEOFENCES,
  DEFAULT_MAP_CENTER,
} from './data/mockData';
import { SAMPLE_MAP_SCENARIOS } from './data/mockScenarios';
import {
  evaluateGeofences,
  getDistanceMeters,
  calculateBearing,
  getCompassDirection,
  calculateWalkingEtaMinutes,
  formatDistance,
} from './utils/geo';
import { soundManager } from './utils/audio';

import { Header } from './components/Dashboard/Header';
import { ChildSelector } from './components/Dashboard/ChildSelector';
import { WearableCard } from './components/Dashboard/WearableCard';
import { ParentProximityCard } from './components/Dashboard/ParentProximityCard';
import { HeartRateControlLockCard } from './components/Dashboard/HeartRateControlLockCard';
import { GeofenceManager } from './components/Dashboard/GeofenceManager';
import { HistoryPlayback } from './components/Dashboard/HistoryPlayback';
import { AlertsDrawer } from './components/Dashboard/AlertsDrawer';
import { LiveTrackingMap } from './components/Map/LiveTrackingMap';
import { VirtualWristbandModal } from './components/Modals/VirtualWristbandModal';
import { IntercomModal } from './components/Modals/IntercomModal';
import { ReferenceMapModal } from './components/Modals/ReferenceMapModal';

import {
  AlertTriangle,
  Radio,
  ShieldCheck,
  Watch,
  Navigation,
  Sparkles,
  PhoneCall,
  BellRing,
  ExternalLink,
  Compass,
  Heart,
  Lock,
} from 'lucide-react';

export default function App() {
  // Scenario & Reference Map State
  const [activeScenario, setActiveScenario] = useState<SampleScenario>(SAMPLE_MAP_SCENARIOS[0]);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [showBlueprintOverlay, setShowBlueprintOverlay] = useState(true);
  const [blueprintOpacity, setBlueprintOpacity] = useState(0.8);
  const [customOverlayUrl, setCustomOverlayUrl] = useState<string | null>(null);

  // Dynamic Children & Geofence State
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(SAMPLE_MAP_SCENARIOS[0].children);
  const [selectedChildId, setSelectedChildId] = useState<string>(SAMPLE_MAP_SCENARIOS[0].children[0].id);
  const [geofences, setGeofences] = useState<GeofenceZone[]>(SAMPLE_MAP_SCENARIOS[0].geofences);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [showHistoryTrail, setShowHistoryTrail] = useState<boolean>(true);

  // Parent Location & Proximity Tether State
  const [parentCoords, setParentCoords] = useState<Coordinates>({ lat: 37.4442, lng: -122.1505 });
  const [isUsingRealGps, setIsUsingRealGps] = useState<boolean>(false);
  const [isParentClickMode, setIsParentClickMode] = useState<boolean>(false);
  const [proximityTetherEnabled, setProximityTetherEnabled] = useState<boolean>(false);
  const [proximityTetherRadiusMeters, setProximityTetherRadiusMeters] = useState<number>(80);

  // Right sidebar active tab navigation (All-in-one vs category)
  const [activeTab, setActiveTab] = useState<'overview' | 'proximity' | 'cardiac_lock'>('overview');

  // Modals & Drawers State
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isWristbandModalOpen, setIsWristbandModalOpen] = useState(false);
  const [intercomChild, setIntercomChild] = useState<ChildProfile | null>(null);

  // Map Add Geofence Mode
  const [isAddGeofenceMode, setIsAddGeofenceMode] = useState(false);

  // Playback & Scrubber State
  const [isLiveScrubbing, setIsLiveScrubbing] = useState(false);
  const [temporaryScrubbedCoords, setTemporaryScrubbedCoords] = useState<Coordinates | null>(null);

  // Simulation State
  const [isSimulatingWander, setIsSimulatingWander] = useState(false);
  const wanderIntervalRef = useRef<number | null>(null);
  const wanderStepRef = useRef<number>(0);

  // Active Selected Child
  const selectedChild =
    childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  // Calculate live distance & proximity metrics from Parent to Selected Child
  const parentState: ParentLocationState = useMemo(() => {
    const childCoords = temporaryScrubbedCoords || selectedChild.currentCoords;
    const distanceToSelectedChild = getDistanceMeters(parentCoords, childCoords);
    const bearingToSelectedChild = calculateBearing(parentCoords, childCoords);
    const compassDirection = getCompassDirection(bearingToSelectedChild);
    const walkingEtaMinutes = calculateWalkingEtaMinutes(distanceToSelectedChild);

    return {
      coords: parentCoords,
      accuracyMeters: isUsingRealGps ? 4.8 : 3.5,
      isUsingRealGps,
      proximityTetherEnabled,
      proximityTetherRadiusMeters,
      distanceToSelectedChild,
      bearingToSelectedChild,
      compassDirection,
      walkingEtaMinutes,
    };
  }, [
    parentCoords,
    selectedChild.currentCoords,
    temporaryScrubbedCoords,
    isUsingRealGps,
    proximityTetherEnabled,
    proximityTetherRadiusMeters,
  ]);

  // Helper to push alerts
  const pushAlert = useCallback(
    (newAlert: Omit<AlertNotification, 'id' | 'timestamp' | 'read'>) => {
      const alertItem: AlertNotification = {
        ...newAlert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        read: false,
      };
      setAlerts((prev) => [alertItem, ...prev.slice(0, 40)]);
    },
    []
  );

  // Check proximity tether breach
  useEffect(() => {
    if (
      proximityTetherEnabled &&
      parentState.distanceToSelectedChild > proximityTetherRadiusMeters
    ) {
      soundManager.playBreachAlarm();
      pushAlert({
        childId: selectedChild.id,
        type: 'geofence_breach',
        severity: 'critical',
        title: `VIRTUAL LEASH EXCEEDED: ${selectedChild.name}!`,
        message: `${selectedChild.name} is ${Math.round(parentState.distanceToSelectedChild)}m away (Tether max: ${proximityTetherRadiusMeters}m). Immediate proximity alert!`,
        coords: selectedChild.currentCoords,
        zoneName: 'Virtual Leash Boundary',
      });
    }
  }, [
    proximityTetherEnabled,
    proximityTetherRadiusMeters,
    parentState.distanceToSelectedChild,
    selectedChild.id,
  ]);

  // Switch Sample Reference Scenario
  const handleSelectScenario = (scenario: SampleScenario) => {
    if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
    setIsSimulatingWander(false);

    setActiveScenario(scenario);
    setChildrenList(scenario.children);
    setSelectedChildId(scenario.children[0].id);
    setGeofences(scenario.geofences);
    setCustomOverlayUrl(null);
    setIsLiveScrubbing(false);
    setTemporaryScrubbedCoords(null);

    // Place parent 70 meters south of the scenario center
    setParentCoords({
      lat: scenario.center.lat - 0.0006,
      lng: scenario.center.lng + 0.0004,
    });

    soundManager.playSafeChime();
    pushAlert({
      childId: scenario.children[0].id,
      type: 'info' as any,
      severity: 'info',
      title: `Reference Map Loaded: ${scenario.name}`,
      message: `Active blueprint layout, landmarks, and geofence boundaries updated for ${scenario.badge}.`,
    });
  };

  // Custom Map Image Upload / URL Handler
  const handleCustomMapImageUpload = (url: string) => {
    setCustomOverlayUrl(url);
    setShowBlueprintOverlay(true);
    pushAlert({
      childId: selectedChildId,
      type: 'info' as any,
      severity: 'info',
      title: 'Custom Blueprint Overlay Aligned',
      message: 'Custom site plan map has been projected onto GPS coordinates.',
    });
  };

  // Acquire real device GPS
  const handleAcquireRealGps = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setParentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsUsingRealGps(true);
          soundManager.playSafeChime();
          pushAlert({
            childId: selectedChildId,
            type: 'info' as any,
            severity: 'info',
            title: 'Live Device GPS Acquired',
            message: `Parent location calibrated to real GPS fix (accuracy: ±${Math.round(pos.coords.accuracy)}m).`,
          });
        },
        (err) => {
          // Fallback simulation
          setIsUsingRealGps(false);
          pushAlert({
            childId: selectedChildId,
            type: 'info' as any,
            severity: 'warning',
            title: 'GPS Sensor Simulation',
            message: 'Device GPS permission unavailable; using precision simulator mode.',
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Teleport parent 40m from child for testing
  const handleRelocateParentNearChild = () => {
    setParentCoords({
      lat: selectedChild.currentCoords.lat - 0.0003,
      lng: selectedChild.currentCoords.lng + 0.0002,
    });
    soundManager.playSafeChime();
  };

  // Toggle Control Lock
  const handleToggleControlLock = (childId: string, locked: boolean) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const newLockMode: WristbandTelemetry['lockMode'] = locked
          ? (c.wristband.lockMode === 'unlocked' ? 'child_lock' : c.wristband.lockMode)
          : 'unlocked';
        const newWristband: WristbandTelemetry = {
          ...c.wristband,
          isControlLocked: locked,
          lockMode: newLockMode,
        };
        return { ...c, wristband: newWristband };
      })
    );

    if (locked) {
      soundManager.playSafeChime();
      pushAlert({
        childId,
        type: 'info' as any,
        severity: 'info',
        title: `Control Lock Activated: ${selectedChild.name}'s Wristband`,
        message: 'Settings menu, power-off button, and Bluetooth disconnect locked to protect child.',
      });
    } else {
      soundManager.playWristbandBeep();
      pushAlert({
        childId,
        type: 'info' as any,
        severity: 'info',
        title: `Control Lock Released: ${selectedChild.name}'s Wristband`,
        message: 'Device settings menu unlocked by parent authority.',
      });
    }
  };

  // Change Lock Mode
  const handleChangeLockMode = (childId: string, mode: WristbandTelemetry['lockMode']) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        return {
          ...c,
          wristband: {
            ...c.wristband,
            lockMode: mode,
            isControlLocked: mode !== 'unlocked',
          },
        };
      })
    );

    soundManager.playWristbandBeep();
    pushAlert({
      childId,
      type: 'info' as any,
      severity: 'info',
      title: `Lock Mode Updated: ${mode.toUpperCase()}`,
      message: `Configured wristband lock policy for ${selectedChild.name}.`,
    });
  };

  // Update Max Heart Threshold
  const handleUpdateHeartThreshold = (childId: string, maxBpm: number) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        return {
          ...c,
          wristband: {
            ...c.wristband,
            heartRateThresholdMax: maxBpm,
          },
        };
      })
    );
  };

  // Toggle Auto-Lock on Heart Spike
  const handleToggleAutoLock = (childId: string, enabled: boolean) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        return {
          ...c,
          wristband: {
            ...c.wristband,
            autoLockOnHeartSpike: enabled,
          },
        };
      })
    );
  };

  // Simulate Sudden Heart Rate Spike
  const handleSimulateHeartSpike = (childId: string) => {
    const spikeBpm = 142;
    soundManager.playBreachAlarm();

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const autoLockEngaged = c.wristband.autoLockOnHeartSpike;

        const updatedHistory = [
          ...(c.wristband.heartRateHistory || []),
          { timestamp: Date.now(), bpm: spikeBpm },
        ];

        return {
          ...c,
          wristband: {
            ...c.wristband,
            heartRate: spikeBpm,
            peakHeartRate: Math.max(c.wristband.peakHeartRate, spikeBpm),
            stressStatus: 'critical',
            isControlLocked: autoLockEngaged ? true : c.wristband.isControlLocked,
            lockMode: autoLockEngaged ? 'emergency_lockdown' : c.wristband.lockMode,
            heartRateHistory: updatedHistory,
          },
        };
      })
    );

    pushAlert({
      childId,
      type: 'high_heart_rate',
      severity: 'critical',
      title: `🚨 CARDIAC DISTRESS ALERT: ${selectedChild.name} (142 BPM)!`,
      message: `Heart rate spiked past safety threshold (${selectedChild.wristband.heartRateThresholdMax} BPM). Device auto-locked into Emergency Lockdown with screen beacon active!`,
      coords: selectedChild.currentCoords,
      zoneName: selectedChild.currentZoneName,
    });
  };

  // Normalize Heart Rate
  const handleResetHeartRate = (childId: string) => {
    const normalBpm = 82;
    soundManager.playSafeChime();

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const updatedHistory = [
          ...(c.wristband.heartRateHistory || []),
          { timestamp: Date.now(), bpm: normalBpm },
        ];
        return {
          ...c,
          wristband: {
            ...c.wristband,
            heartRate: normalBpm,
            stressStatus: 'normal',
            heartRateHistory: updatedHistory,
          },
        };
      })
    );

    pushAlert({
      childId,
      type: 'info' as any,
      severity: 'info',
      title: 'Heart Rate Normalized',
      message: `${selectedChild.name}'s cardiac telemetry returned to resting rate (82 BPM).`,
    });
  };

  // Move Child (Manual or Simulated)
  const moveChild = useCallback(
    (childId: string, newCoords: Coordinates, simulatedSpeedKmh = 3.5) => {
      setChildrenList((prevList) => {
        return prevList.map((child) => {
          if (child.id !== childId) return child;

          const bearing = calculateBearing(child.currentCoords, newCoords);

          // Get child assigned geofences
          const childGeofences = geofences.filter((g) =>
            child.assignedGeofenceIds.includes(g.id)
          );

          // Evaluate geofence boundaries
          const evaluation = evaluateGeofences(newCoords, childGeofences);

          let newStatus = child.status;
          let zoneName = evaluation.activeZone?.name;

          // Check Danger Zone entry
          if (evaluation.isInDangerZone) {
            newStatus = 'breached';
            zoneName = evaluation.dangerZone?.name;

            if (child.status !== 'breached') {
              soundManager.playBreachAlarm();
              pushAlert({
                childId: child.id,
                type: 'geofence_breach',
                severity: 'critical',
                title: `DANGER: ${child.name} entered restricted zone!`,
                message: `${child.name} entered prohibited area (${evaluation.dangerZone?.name}). Immediate action recommended!`,
                coords: newCoords,
                zoneName: evaluation.dangerZone?.name,
              });
            }
          }
          // Check outside all safe geofences
          else if (!evaluation.isSafe) {
            newStatus = 'breached';
            const distPast = Math.round(evaluation.distanceToSafePerimeter || 0);

            if (child.isInsideSafeZone) {
              soundManager.playBreachAlarm();
              pushAlert({
                childId: child.id,
                type: 'geofence_breach',
                severity: 'critical',
                title: `GEOFENCE BREACH: ${child.name} wandered outside!`,
                message: `${child.name} has moved ${distPast}m beyond safe boundary limits at ${simulatedSpeedKmh.toFixed(1)} km/h.`,
                coords: newCoords,
                zoneName: 'Outside Safe Boundary',
              });
            }
          }
          // Safely back inside safe perimeter
          else {
            if (child.status === 'breached' && !child.wristband.isSosActive) {
              newStatus = 'safe';
              soundManager.playSafeChime();
              pushAlert({
                childId: child.id,
                type: 'geofence_entry',
                severity: 'info',
                title: `${child.name} returned inside safe perimeter`,
                message: `GPS confirms ${child.name} is safely back inside ${zoneName}.`,
                coords: newCoords,
                zoneName,
              });
            } else if (!child.wristband.isSosActive) {
              newStatus = 'safe';
            }
          }

          // Add to breadcrumb history
          const newBreadcrumb: GPSBreadcrumb = {
            id: `bc-${Date.now()}`,
            timestamp: Date.now(),
            coords: newCoords,
            speedKmh: simulatedSpeedKmh,
            accuracyMeters: 3.2,
            isInsideSafeZone: evaluation.isSafe && !evaluation.isInDangerZone,
            activeZoneName: zoneName,
            batteryLevel: child.wristband.batteryLevel,
          };

          return {
            ...child,
            currentCoords: newCoords,
            heading: bearing,
            speedKmh: simulatedSpeedKmh,
            isInsideSafeZone: evaluation.isSafe && !evaluation.isInDangerZone,
            currentZoneName: zoneName,
            status: child.wristband.isSosActive ? 'sos' : newStatus,
            history: [...child.history, newBreadcrumb],
          };
        });
      });
    },
    [geofences, pushAlert]
  );

  // Periodic subtle telemetry heart rate & step pulse
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setChildrenList((prev) =>
        prev.map((c) => {
          // If in critical spike, decay gradually down
          let nextHeart = c.wristband.heartRate;
          if (c.wristband.heartRate > 120) {
            nextHeart = Math.max(88, c.wristband.heartRate - 4);
          } else {
            nextHeart = Math.max(70, Math.min(115, c.wristband.heartRate + (Math.floor(Math.random() * 5) - 2)));
          }

          const history = [
            ...(c.wristband.heartRateHistory || []).slice(-15),
            { timestamp: Date.now(), bpm: nextHeart },
          ];

          return {
            ...c,
            wristband: {
              ...c.wristband,
              heartRate: nextHeart,
              heartRateHistory: history,
              stepCount: c.wristband.stepCount + (c.speedKmh > 1 ? 4 : 0),
              lastSyncTimestamp: Date.now(),
            },
          };
        })
      );
    }, 4500);

    return () => clearInterval(pulseInterval);
  }, []);

  // Automated Wander Outside Geofence Simulation
  const handleStartWanderSimulation = () => {
    setIsSimulatingWander(true);
    wanderStepRef.current = 0;

    const wanderPath = activeScenario.wanderPath || [
      { lat: 37.4452, lng: -122.152 },
      { lat: 37.4455, lng: -122.151 },
      { lat: 37.4459, lng: -122.1495 },
      { lat: 37.4464, lng: -122.148 },
      { lat: 37.447, lng: -122.1465 },
    ];

    if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);

    wanderIntervalRef.current = window.setInterval(() => {
      wanderStepRef.current += 1;
      const step = wanderStepRef.current;

      if (step < wanderPath.length) {
        const nextPt = wanderPath[step];
        moveChild(selectedChildId, nextPt, 4.5);
      } else {
        if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
        setIsSimulatingWander(false);
      }
    }, 1800);
  };

  const handleStopWanderSimulation = () => {
    if (wanderIntervalRef.current) {
      clearInterval(wanderIntervalRef.current);
      wanderIntervalRef.current = null;
    }
    setIsSimulatingWander(false);
  };

  // Ring child wristband
  const handleRingWristband = (childId: string) => {
    soundManager.playWristbandBeep();

    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === childId
          ? { ...c, wristband: { ...c.wristband, isRinging: true } }
          : c
      )
    );

    pushAlert({
      childId,
      type: 'info' as any,
      severity: 'info',
      title: 'Audible Beacon Activated',
      message: `Sounding 85dB high-pitch locator chime on ${selectedChild.wristband.model}.`,
    });

    setTimeout(() => {
      setChildrenList((prev) =>
        prev.map((c) =>
          c.id === childId
            ? { ...c, wristband: { ...c.wristband, isRinging: false } }
            : c
        )
      );
    }, 4500);
  };

  // Simulate Tamper (Wristband Unfastened / Removed)
  const handleToggleClasp = (childId: string) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const newWornState = !c.wristband.isWorn;

        if (!newWornState) {
          soundManager.playTamperAlert();
          pushAlert({
            childId,
            type: 'tamper_removed',
            severity: 'critical',
            title: `TAMPER ALERT: ${c.name}'s wristband unfastened!`,
            message: `Optical skin-contact sensor broken on ${c.wristband.deviceId}. Wristband was taken off or fell off!`,
            coords: c.currentCoords,
            zoneName: c.currentZoneName,
          });
        } else {
          soundManager.playSafeChime();
          pushAlert({
            childId,
            type: 'info' as any,
            severity: 'info',
            title: `Wristband Clasp Re-Secured`,
            message: `${c.name}'s wristband is re-fastened. Optical skin sensors locked.`,
          });
        }

        return {
          ...c,
          wristband: {
            ...c.wristband,
            isWorn: newWornState,
          },
        };
      })
    );
  };

  // Simulate Child SOS Trigger
  const handleToggleSos = (childId: string) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const newSos = !c.wristband.isSosActive;

        if (newSos) {
          soundManager.playSosAlarm();
          pushAlert({
            childId,
            type: 'sos',
            severity: 'critical',
            title: `🚨 EMERGENCY SOS TRIGGERED BY ${c.name.toUpperCase()}!`,
            message: `Child pressed and held physical SOS button on ${c.wristband.model}. Live GPS tracking & emergency broadcast broadcasted!`,
            coords: c.currentCoords,
            zoneName: c.currentZoneName,
          });
        } else {
          pushAlert({
            childId,
            type: 'info' as any,
            severity: 'info',
            title: 'SOS Emergency Cleared',
            message: `Emergency SOS status resolved for ${c.name}.`,
          });
        }

        return {
          ...c,
          status: newSos ? 'sos' : c.isInsideSafeZone ? 'safe' : 'breached',
          wristband: {
            ...c.wristband,
            isSosActive: newSos,
          },
        };
      })
    );
  };

  // Add new geofence
  const handleAddGeofence = (newZone: GeofenceZone) => {
    setGeofences((prev) => [...prev, newZone]);
    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === selectedChildId
          ? { ...c, assignedGeofenceIds: [...c.assignedGeofenceIds, newZone.id] }
          : c
      )
    );
    pushAlert({
      childId: selectedChildId,
      type: 'info' as any,
      severity: 'info',
      title: `New Geofence Activated: ${newZone.name}`,
      message: `${newZone.radius}m perimeter created and deployed to all linked child wristbands.`,
    });
  };

  // Add geofence clicked on map
  const handleAddNewGeofenceAt = (coords: Coordinates) => {
    const newZone: GeofenceZone = {
      id: `zone-custom-${Date.now()}`,
      name: `Safe Zone #${geofences.length + 1}`,
      type: 'safe',
      shape: 'circle',
      center: coords,
      radius: 180,
      color: '#10b981',
      active: true,
      scheduleDescription: '24/7 Monitored',
      description: 'Custom perimeter placed via map interaction.',
    };
    handleAddGeofence(newZone);
  };

  const handleToggleZoneActive = (id: string) => {
    setGeofences((prev) =>
      prev.map((z) => (z.id === id ? { ...z, active: !z.active } : z))
    );
  };

  const handleUpdateZoneRadius = (id: string, newRadius: number) => {
    setGeofences((prev) =>
      prev.map((z) => (z.id === id ? { ...z, radius: newRadius } : z))
    );
  };

  const handleDeleteZone = (id: string) => {
    setGeofences((prev) => prev.filter((z) => z.id !== id));
  };

  // Scrubber Handling
  const handleScrubPosition = (coords: Coordinates, point: GPSBreadcrumb) => {
    setIsLiveScrubbing(true);
    setTemporaryScrubbedCoords(coords);
  };

  const handleResetToLive = () => {
    setIsLiveScrubbing(false);
    setTemporaryScrubbedCoords(null);
  };

  // Reset demo data to current scenario baseline
  const handleResetData = () => {
    if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
    setIsSimulatingWander(false);
    setChildrenList(activeScenario.children);
    setSelectedChildId(activeScenario.children[0].id);
    setGeofences(activeScenario.geofences);
    setAlerts([]);
    setIsLiveScrubbing(false);
    setTemporaryScrubbedCoords(null);
    setParentCoords({ lat: 37.4442, lng: -122.1505 });
    soundManager.playSafeChime();
  };

  // Count active breaches and SOS
  const activeBreaches = childrenList.filter(
    (c) => c.status === 'breached' || !c.isInsideSafeZone
  ).length;
  const hasSos = childrenList.some(
    (c) => c.status === 'sos' || c.wristband.isSosActive
  );
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  // Active display child coordinates
  const displayChild = {
    ...selectedChild,
    currentCoords: temporaryScrubbedCoords || selectedChild.currentCoords,
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Operations Header */}
      <Header
        activeBreachCount={activeBreaches}
        hasSos={hasSos}
        onOpenWristbandSimulator={() => setIsWristbandModalOpen(true)}
        onOpenAlertsFeed={() => setIsAlertsDrawerOpen(true)}
        unreadAlertsCount={unreadAlerts}
        onResetData={handleResetData}
        onOpenReferenceMap={() => setIsReferenceModalOpen(true)}
        activeScenarioBadge={activeScenario.badge}
      />

      {/* Main Two-Column Dashboard Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Interactive Map & Live Visualizer */}
        <section className="flex-1 flex flex-col relative h-[50vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-slate-800">
          <LiveTrackingMap
            selectedChild={displayChild}
            allChildren={childrenList}
            geofences={geofences}
            historyPoints={selectedChild.history}
            showHistoryTrail={showHistoryTrail}
            onToggleHistoryTrail={() => setShowHistoryTrail(!showHistoryTrail)}
            onMoveChildManual={(coords) => moveChild(selectedChildId, coords)}
            isSimulatingWander={isSimulatingWander}
            onStartWanderSimulation={handleStartWanderSimulation}
            onStopWanderSimulation={handleStopWanderSimulation}
            onAddNewGeofenceAt={handleAddNewGeofenceAt}
            isAddGeofenceMode={isAddGeofenceMode}
            setIsAddGeofenceMode={setIsAddGeofenceMode}
            onRingChild={handleRingWristband}
            onOpenIntercom={(child) => setIntercomChild(child)}
            overlaySvgUrl={customOverlayUrl || activeScenario.overlaySvgUrl}
            overlayBounds={activeScenario.overlayBounds}
            showBlueprintOverlay={showBlueprintOverlay}
            onToggleBlueprintOverlay={setShowBlueprintOverlay}
            blueprintOpacity={blueprintOpacity}
            landmarks={activeScenario.landmarks}
            onOpenReferenceMapModal={() => setIsReferenceModalOpen(true)}
            scenarioName={activeScenario.name}
            parentState={parentState}
            isParentClickMode={isParentClickMode}
            setIsParentClickMode={setIsParentClickMode}
            onSetParentCoords={(coords) => setParentCoords(coords)}
          />

          {/* Quick Floating Emergency Breach Alert Bar on Map */}
          {(!selectedChild.isInsideSafeZone || selectedChild.status === 'breached') && (
            <div className="absolute bottom-14 left-4 right-4 z-20 mx-auto max-w-xl p-3 rounded-2xl bg-rose-950/90 border border-rose-500/80 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-bounce">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-200">
                    Geofence Alert: {selectedChild.name} is Outside Perimeter!
                  </div>
                  <div className="text-[11px] text-rose-300/80">
                    Distance from you: {formatDistance(parentState.distanceToSelectedChild)} ({parentState.compassDirection}) · Speed: {selectedChild.speedKmh.toFixed(1)} km/h
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleRingWristband(selectedChild.id)}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-900 hover:bg-rose-800 text-white rounded-lg border border-rose-700 transition flex items-center gap-1"
                >
                  <BellRing className="w-3 h-3" />
                  <span>Ring</span>
                </button>

                <button
                  onClick={() => setIntercomChild(selectedChild)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-rose-950 hover:bg-rose-100 rounded-lg shadow font-bold transition flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Child</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Parent Telemetry, Proximity, Cardiac Lock, Geofences & History Playback */}
        <aside className="w-full lg:w-[480px] xl:w-[520px] flex flex-col bg-slate-950 overflow-y-auto p-4 gap-4 no-scrollbar">
          {/* Child Selector Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Monitored Children</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {childrenList.length} Active Wristbands
              </span>
            </div>
            <ChildSelector
              childrenList={childrenList}
              selectedChildId={selectedChildId}
              onSelectChild={(id) => {
                setSelectedChildId(id);
                handleResetToLive();
              }}
              onRingChild={handleRingWristband}
            />
          </div>

          {/* Quick Feature Filter Pill Nav */}
          <div className="flex bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Controls
            </button>
            <button
              onClick={() => setActiveTab('proximity')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'proximity'
                  ? 'bg-indigo-950 border border-indigo-600/50 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Distance & Tether</span>
            </button>
            <button
              onClick={() => setActiveTab('cardiac_lock')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'cardiac_lock'
                  ? 'bg-rose-950 border border-rose-600/50 text-rose-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Heart & Lock</span>
            </button>
          </div>

          {/* Feature 1: Parent-to-Child Distance & Proximity Tether Card */}
          {(activeTab === 'overview' || activeTab === 'proximity') && (
            <ParentProximityCard
              child={selectedChild}
              parentState={parentState}
              onToggleTether={setProximityTetherEnabled}
              onChangeTetherRadius={setProximityTetherRadiusMeters}
              onAcquireRealGps={handleAcquireRealGps}
              onSetParentClickMode={setIsParentClickMode}
              isParentClickMode={isParentClickMode}
              onRelocateParentNearChild={handleRelocateParentNearChild}
            />
          )}

          {/* Feature 2: Heart Rate Continuous Monitoring & Device Control Lock Card */}
          {(activeTab === 'overview' || activeTab === 'cardiac_lock') && (
            <HeartRateControlLockCard
              child={selectedChild}
              onToggleControlLock={handleToggleControlLock}
              onChangeLockMode={handleChangeLockMode}
              onUpdateHeartThreshold={handleUpdateHeartThreshold}
              onToggleAutoLock={handleToggleAutoLock}
              onSimulateHeartSpike={handleSimulateHeartSpike}
              onResetHeartRate={handleResetHeartRate}
            />
          )}

          {/* Wearable Hardware Telemetry Card */}
          <WearableCard
            child={selectedChild}
            onRingWristband={handleRingWristband}
            onOpenIntercom={(child) => setIntercomChild(child)}
            onSimulateTamper={handleToggleClasp}
            onSimulateSos={handleToggleSos}
            onToggleControlLock={handleToggleControlLock}
          />

          {/* GPS Location History & Journey Playback */}
          <HistoryPlayback
            breadcrumbs={selectedChild.history}
            childName={selectedChild.name}
            onScrubPosition={handleScrubPosition}
            onResetToLive={handleResetToLive}
            isLiveScrubbing={isLiveScrubbing}
          />

          {/* Active Geofence Perimeters & Editor */}
          <GeofenceManager
            geofences={geofences}
            onToggleZoneActive={handleToggleZoneActive}
            onUpdateRadius={handleUpdateZoneRadius}
            onDeleteZone={handleDeleteZone}
            onAddZone={handleAddGeofence}
            defaultCenter={selectedChild.currentCoords}
          />
        </aside>
      </div>

      {/* Slide-in Alerts Feed Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onMarkAllAsRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
        onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
        onFocusCoordinates={(coords) => {
          setIsAlertsDrawerOpen(false);
        }}
      />

      {/* Interactive Child Wristband Hardware Twin Modal */}
      <VirtualWristbandModal
        isOpen={isWristbandModalOpen}
        onClose={() => setIsWristbandModalOpen(false)}
        child={selectedChild}
        onTriggerSos={handleToggleSos}
        onToggleClasp={handleToggleClasp}
        onSimulateWander={handleStartWanderSimulation}
        onToggleControlLock={handleToggleControlLock}
        onSimulateHeartSpike={handleSimulateHeartSpike}
      />

      {/* Two-Way Voice Intercom Call Modal */}
      {intercomChild && (
        <IntercomModal
          isOpen={!!intercomChild}
          onClose={() => setIntercomChild(null)}
          child={intercomChild}
        />
      )}

      {/* Sample Reference Map & Site Blueprint Modal */}
      <ReferenceMapModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        activeScenarioId={activeScenario.id}
        onSelectScenario={handleSelectScenario}
        showBlueprintOverlay={showBlueprintOverlay}
        onToggleBlueprintOverlay={setShowBlueprintOverlay}
        blueprintOpacity={blueprintOpacity}
        onChangeBlueprintOpacity={setBlueprintOpacity}
        onCustomMapImageUpload={handleCustomMapImageUpload}
      />
    </div>
  );
}
