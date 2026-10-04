import React, { useState, useEffect, useRef } from 'react';
import { GPSBreadcrumb, Coordinates } from '../../types/tracking';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Download,
  List,
  Navigation,
  Compass,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HistoryPlaybackProps {
  breadcrumbs: GPSBreadcrumb[];
  childName: string;
  onScrubPosition: (coords: Coordinates, point: GPSBreadcrumb) => void;
  onResetToLive: () => void;
  isLiveScrubbing: boolean;
}

export const HistoryPlayback: React.FC<HistoryPlaybackProps> = ({
  breadcrumbs,
  childName,
  onScrubPosition,
  onResetToLive,
  isLiveScrubbing,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(breadcrumbs.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [showLogTable, setShowLogTable] = useState<boolean>(false);
  const playbackTimerRef = useRef<number | null>(null);

  // Sync index when breadcrumbs update if at end
  useEffect(() => {
    if (!isLiveScrubbing) {
      setCurrentIndex(breadcrumbs.length - 1);
    }
  }, [breadcrumbs.length, isLiveScrubbing]);

  // Automated playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(120, 1000 / playSpeed);
      playbackTimerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= breadcrumbs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const pt = breadcrumbs[next];
          if (pt) {
            onScrubPosition(pt.coords, pt);
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, playSpeed, breadcrumbs]);

  const currentPoint = breadcrumbs[currentIndex] || breadcrumbs[breadcrumbs.length - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    setCurrentIndex(idx);
    const pt = breadcrumbs[idx];
    if (pt) {
      onScrubPosition(pt.coords, pt);
    }
  };

  const handleTogglePlay = () => {
    if (currentIndex >= breadcrumbs.length - 1) {
      setCurrentIndex(0);
      const pt = breadcrumbs[0];
      if (pt) onScrubPosition(pt.coords, pt);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    const pt = breadcrumbs[0];
    if (pt) onScrubPosition(pt.coords, pt);
  };

  const exportCSV = () => {
    const header = 'Timestamp,Time,Latitude,Longitude,Speed_kmh,Accuracy_m,Inside_SafeZone,Zone_Name,Battery_Percent\n';
    const rows = breadcrumbs
      .map((b) => {
        const timeStr = new Date(b.timestamp).toISOString();
        return `${b.timestamp},"${timeStr}",${b.coords.lat},${b.coords.lng},${b.speedKmh},${b.accuracyMeters},${b.isInsideSafeZone},"${b.activeZoneName || ''}",${b.batteryLevel}`;
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${childName.replace(/\s+/g, '_')}_GPS_Location_History.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const startTime = breadcrumbs.length > 0 ? formatTime(breadcrumbs[0].timestamp) : '--';
  const endTime = breadcrumbs.length > 0 ? formatTime(breadcrumbs[breadcrumbs.length - 1].timestamp) : '--';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">GPS Location History & Playback</h3>
            <p className="text-[10px] text-slate-400">
              {breadcrumbs.length} recorded breadcrumbs today ({startTime} - {endTime})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isLiveScrubbing && (
            <button
              onClick={onResetToLive}
              className="px-2 py-1 text-[11px] font-semibold bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-lg hover:bg-emerald-900 transition flex items-center gap-1"
            >
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>Back to Live</span>
            </button>
          )}

          <button
            onClick={() => setShowLogTable(!showLogTable)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={showLogTable ? 'Hide Detailed Table' : 'Show Location Log Table'}
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exportCSV}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Export CSV GPS History Report"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Scrubber Progress Bar & Timestamps */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>{startTime}</span>
          <div className="px-2 py-0.5 rounded bg-slate-950 font-mono text-cyan-300 border border-slate-800 flex items-center gap-1.5 font-semibold">
            <span>{currentPoint ? formatTime(currentPoint.timestamp) : '--'}</span>
            <span className="text-[10px] text-slate-500">
              ({currentIndex + 1}/{breadcrumbs.length})
            </span>
          </div>
          <span>{endTime}</span>
        </div>

        <input
          type="range"
          min="0"
          max={breadcrumbs.length > 0 ? breadcrumbs.length - 1 : 0}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
        />
      </div>

      {/* Snapshot at selected breadcrumb moment */}
      {currentPoint && (
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Location / Zone</span>
            <span className="font-semibold text-slate-200 truncate block">
              {currentPoint.activeZoneName || (currentPoint.isInsideSafeZone ? 'Safe Zone' : 'Outside Geofence')}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block">Movement Speed</span>
            <span className="font-mono text-cyan-300 font-semibold">
              {currentPoint.speedKmh.toFixed(1)} km/h
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block">Perimeter State</span>
            <span
              className={`font-semibold flex items-center gap-1 text-[11px] ${
                currentPoint.isInsideSafeZone ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentPoint.isInsideSafeZone ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Within Bound</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Outside Bound</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Playback Controls (Play/Pause, Speed, Step) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-900/40"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Journey'}</span>
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-[10px] font-mono">
          <span className="text-slate-500 px-1">Speed:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setPlaySpeed(s)}
              className={`px-1.5 py-0.5 rounded transition ${
                playSpeed === s ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Log Table View (if expanded) */}
      {showLogTable && (
        <div className="mt-2 border-t border-slate-800 pt-2">
          <div className="text-[11px] font-semibold text-slate-300 mb-1.5">Historical Breadcrumb Ledger</div>
          <div className="max-h-48 overflow-y-auto pr-1">
            <table className="w-full text-left text-[10px] font-mono">
              <thead className="text-slate-500 border-b border-slate-800 sticky top-0 bg-slate-900">
                <tr>
                  <th className="py-1">Time</th>
                  <th className="py-1">Lat/Lng</th>
                  <th className="py-1">Speed</th>
                  <th className="py-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {breadcrumbs.map((b, i) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setCurrentIndex(i);
                      onScrubPosition(b.coords, b);
                    }}
                    className={`cursor-pointer hover:bg-slate-800/60 ${
                      i === currentIndex ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    <td className="py-1">{formatTime(b.timestamp)}</td>
                    <td className="py-1">
                      {b.coords.lat.toFixed(4)}, {b.coords.lng.toFixed(4)}
                    </td>
                    <td className="py-1">{b.speedKmh.toFixed(1)} km/h</td>
                    <td className="py-1">
                      <span className={b.isInsideSafeZone ? 'text-emerald-400' : 'text-rose-400'}>
                        {b.isInsideSafeZone ? 'Safe' : 'Breach'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
