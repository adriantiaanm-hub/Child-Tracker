import React from 'react';
import { AlertNotification, Coordinates } from '../../types/tracking';
import {
  Bell,
  AlertTriangle,
  Radio,
  ShieldAlert,
  BatteryWarning,
  HeartCrack,
  CheckCheck,
  MapPin,
  X,
  Volume2,
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  onMarkAllAsRead: () => void;
  onDismissAlert: (id: string) => void;
  onFocusCoordinates?: (coords: Coordinates) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllAsRead,
  onDismissAlert,
  onFocusCoordinates,
}) => {
  if (!isOpen) return null;

  const getAlertIcon = (type: AlertNotification['type'], severity: AlertNotification['severity']) => {
    switch (type) {
      case 'geofence_breach':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'sos':
        return <Radio className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'tamper_removed':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'low_battery':
        return <BatteryWarning className="w-4 h-4 text-amber-400" />;
      case 'high_heart_rate':
        return <HeartCrack className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-50 flex flex-col shadow-2xl select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Live Alerts & Logs</h2>
            <p className="text-[11px] text-slate-400">
              {alerts.length} incident {alerts.length === 1 ? 'event' : 'events'} recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {alerts.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3">
              <CheckCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">All Perimeters Clear</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              No active geofence wandering breaches or tamper alerts recorded.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-800/80 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type, alert.severity)}
                    <span className={`text-xs font-bold ${isCritical ? 'text-rose-200' : 'text-slate-200'}`}>
                      {alert.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{alert.message}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  {alert.coords && onFocusCoordinates ? (
                    <button
                      onClick={() => onFocusCoordinates(alert.coords!)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Locate on Map</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.zoneName || 'Boundary Event'}
                    </span>
                  )}

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
