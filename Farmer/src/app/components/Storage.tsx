import { useState, useEffect } from 'react';
import { User, Plus, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { TemperatureChart } from './storage/TemperatureChart';
import { HumidityChart } from './storage/HumidityChart';
import { GasLevelCard } from './storage/GasLevelCard';
import { AlertPanel } from './storage/AlertPanel';
import { StorageStats } from './storage/StorageStats';
import type { 
  StorageData,
  HistoricalDataPoint 
} from '../services/firebase.service';
import { 
  subscribeToESP32Data,
  subscribeToESP32HistoricalData
} from '../services/firebase.service';

export function Storage() {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    console.log('Subscribing to ESP32 sensor data...');
    
    // Subscribe to real-time ESP32 sensor data
    const unsubscribeSensor = subscribeToESP32Data((data: StorageData | null) => {
      if (data) {
        setStorageData(data);
        setConnectionStatus('connected');
        setLoading(false);
        console.log('Received sensor data:', data);
      } else {
        // Only clear current data when disconnected, keep historical data
        setStorageData(null);
        setConnectionStatus('error');
        setLoading(false);
        console.log('ESP32 disconnected - showing last known data');
      }
    });

    // Subscribe to historical data (24 hours)
    const unsubscribeHistorical = subscribeToESP32HistoricalData(24, (data: HistoricalDataPoint[]) => {
      setHistoricalData(data);
    });

    return () => {
      unsubscribeSensor();
      unsubscribeHistorical();
    };
  }, []);

  // Generate alerts from storage data
  const generateAlerts = () => {
    const alerts: any[] = [];
    
    if (!storageData) return alerts;

    if (storageData.temperature.status === 'critical') {
      alerts.push({
        id: 'temp-critical',
        type: 'critical',
        message: `Temperature critically ${storageData.temperature.value > 30 ? 'high' : 'low'}: ${storageData.temperature.value}°C`,
        timestamp: storageData.timestamp,
        storageUnit: storageData.storageUnit
      });
    } else if (storageData.temperature.status === 'warning') {
      alerts.push({
        id: 'temp-warning',
        type: 'warning',
        message: `Temperature warning: ${storageData.temperature.value}°C`,
        timestamp: storageData.timestamp,
        storageUnit: storageData.storageUnit
      });
    }

    if (storageData.humidity.status === 'critical') {
      alerts.push({
        id: 'humidity-critical',
        type: 'critical',
        message: `Humidity critically ${storageData.humidity.value > 80 ? 'high' : 'low'}: ${storageData.humidity.value}%`,
        timestamp: storageData.timestamp,
        storageUnit: storageData.storageUnit
      });
    } else if (storageData.humidity.status === 'warning') {
      alerts.push({
        id: 'humidity-warning',
        type: 'warning',
        message: `Humidity warning: ${storageData.humidity.value}%`,
        timestamp: storageData.timestamp,
        storageUnit: storageData.storageUnit
      });
    }

    // Check gas levels
    Object.entries(storageData.gases).forEach(([gasName, gasData]) => {
      if (gasData.status === 'critical') {
        alerts.push({
          id: `${gasName}-critical`,
          type: 'critical',
          message: `${gasName.toUpperCase()} levels critical: ${gasData.value} PPM`,
          timestamp: storageData.timestamp,
          storageUnit: storageData.storageUnit
        });
      } else if (gasData.status === 'warning') {
        alerts.push({
          id: `${gasName}-warning`,
          type: 'warning',
          message: `${gasName.toUpperCase()} levels elevated: ${gasData.value} PPM`,
          timestamp: storageData.timestamp,
          storageUnit: storageData.storageUnit
        });
      }
    });

    if (storageData.spoilageRisk === 'high' || storageData.spoilageRisk === 'critical') {
      alerts.push({
        id: 'spoilage',
        type: storageData.spoilageRisk === 'critical' ? 'critical' : 'warning',
        message: `High spoilage risk detected - immediate attention required`,
        timestamp: storageData.timestamp,
        storageUnit: storageData.storageUnit
      });
    }

    return alerts;
  };

  // Calculate stats
  const calculateStats = () => {
    if (!storageData) {
      return {
        totalUnits: 0,
        criticalAlerts: 0,
        warningsActive: 0,
        averageRisk: 'low' as const
      };
    }

    const isCritical = storageData.temperature.status === 'critical' || 
      storageData.humidity.status === 'critical' ||
      storageData.spoilageRisk === 'critical' ||
      Object.values(storageData.gases).some(gas => gas.status === 'critical');
    
    const isWarning = storageData.temperature.status === 'warning' || 
      storageData.humidity.status === 'warning' ||
      storageData.spoilageRisk === 'high' ||
      Object.values(storageData.gases).some(gas => gas.status === 'warning');

    return {
      totalUnits: 1,
      criticalAlerts: isCritical ? 1 : 0,
      warningsActive: isWarning ? 1 : 0,
      averageRisk: storageData.spoilageRisk
    };
  };

  const getSpoilageRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSpoilageIcon = (risk: string) => {
    switch (risk) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <Wifi className="w-3.5 h-3.5" />
            ESP32 Connected
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <div className="w-3.5 h-3.5 border-2 border-yellow-700 border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            No Connection
          </div>
        );
    }
  };

  const alerts = generateAlerts();
  const stats = calculateStats();

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">Storage Monitoring</h1>
            {getConnectionBadge()}
          </div>
          <p className="text-sm text-gray-600 mt-1">Real-time environmental monitoring from ESP32 sensors</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
            <User className="w-5 h-5 text-emerald-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-emerald-600"></div>
            <p className="mt-4 text-gray-600">Connecting to ESP32 sensor...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show message when disconnected but still display charts */}
            {!storageData && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <WifiOff className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">ESP32 Disconnected</p>
                    <p className="text-sm text-red-600">Showing last recorded data. Current readings unavailable.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards - only show when connected */}
            {storageData && <StorageStats {...stats} />}

            {/* Alerts - only show when connected */}
            {storageData && alerts.length > 0 && (
              <AlertPanel alerts={alerts} />
            )}

            {/* Historical Charts - always show if data exists */}
            {historicalData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <TemperatureChart
                    data={historicalData}
                    currentValue={storageData?.temperature.value ?? 0}
                    status={storageData?.temperature.status ?? 'normal'}
                  />
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <HumidityChart
                    data={historicalData}
                    currentValue={storageData?.humidity.value ?? 0}
                    status={storageData?.humidity.status ?? 'normal'}
                  />
                </div>
              </div>
            )}

            {/* Storage Unit Details - only show when connected */}
            {storageData && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Unit Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{storageData.storageUnit}</h3>
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date(storageData.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getSpoilageRiskColor(storageData.spoilageRisk)}`}>
                    <span>{getSpoilageIcon(storageData.spoilageRisk)}</span>
                    <span>Spoilage Risk: {storageData.spoilageRisk.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Unit Content */}
              <div className="p-6 space-y-6">
                {/* Gas Levels */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Gas Levels (MQ135 Sensor)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <GasLevelCard
                      name="Carbon Dioxide"
                      symbol="CO₂"
                      data={storageData.gases.co2}
                      unit="ppm"
                    />
                    <GasLevelCard
                      name="Ammonia"
                      symbol="NH₃"
                      data={storageData.gases.ammonia}
                      unit="ppm"
                    />
                    <GasLevelCard
                      name="Methane"
                      symbol="CH₄"
                      data={storageData.gases.methane}
                      unit="ppm"
                    />
                    <GasLevelCard
                      name="Ethylene"
                      symbol="C₂H₄"
                      data={storageData.gases.ethylene}
                      unit="ppm"
                    />
                    <GasLevelCard
                      name="Hydrogen Sulfide"
                      symbol="H₂S"
                      data={storageData.gases.h2s}
                      unit="ppm"
                    />
                  </div>
                </div>

                {/* Recommendations */}
                {storageData.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      💡 Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {storageData.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
