import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  storageUnit: string;
}

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Active Alerts ({visibleAlerts.length})
      </h3>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-4 border-2 flex items-start gap-3 ${getAlertStyle(alert.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{alert.storageUnit}</p>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="flex-shrink-0 hover:bg-black hover:bg-opacity-10 p-1 rounded transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
