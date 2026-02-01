import { useState, useEffect } from 'react';
import { User, Plus, Download, RefreshCw } from 'lucide-react';
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
  subscribeToStorageData, 
  generateMockStorageData
} from '../services/firebase.service';

export function Storage() {
  const [storageData, setStorageData] = useState<Record<string, StorageData>>({});
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true); // Toggle for testing
  const farmerId = '507f1f77bcf86cd799439011'; // Temporary farmer ID

  useEffect(() => {
    if (useMockData) {
      // Use mock data for testing
      const mockData = generateMockStorageData();
      setStorageData(mockData);
      
      // Generate mock historical data
      const mockHistorical: Record<string, HistoricalDataPoint[]> = {};
      Object.keys(mockData).forEach(unitId => {
        const points: HistoricalDataPoint[] = [];
        const now = Date.now();
        
        // Generate 24 hours of data points (one per hour)
        for (let i = 24; i >= 0; i--) {
          const timestamp = now - (i * 60 * 60 * 1000);
          const tempVariation = (Math.random() - 0.5) * 4;
          const humidityVariation = (Math.random() - 0.5) * 10;
          
          points.push({
            timestamp,
            temperature: mockData[unitId].temperature.value + tempVariation,
            humidity: mockData[unitId].humidity.value + humidityVariation
          });
        }
        mockHistorical[unitId] = points;
      });
      
      setHistoricalData(mockHistorical);
      setLoading(false);
    } else {
      // Subscribe to real Firebase data
      const unsubscribe = subscribeToStorageData(farmerId, (data: Record<string, StorageData>) => {
        setStorageData(data);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [farmerId, useMockData]);

  // Generate alerts from storage data
  const generateAlerts = () => {
    const alerts: any[] = [];
    
    Object.entries(storageData).forEach(([unitId, data]) => {
      if (data.temperature.status === 'critical') {
        alerts.push({
          id: `${unitId}-temp-critical`,
          type: 'critical',
          message: `Temperature critically ${data.temperature.value > 30 ? 'high' : 'low'}: ${data.temperature.value}°C`,
          timestamp: data.timestamp,
          storageUnit: data.storageUnit
        });
      } else if (data.temperature.status === 'warning') {
        alerts.push({
          id: `${unitId}-temp-warning`,
          type: 'warning',
          message: `Temperature approaching limits: ${data.temperature.value}°C`,
          timestamp: data.timestamp,
          storageUnit: data.storageUnit
        });
      }

      if (data.humidity.status === 'critical') {
        alerts.push({
          id: `${unitId}-humidity-critical`,
          type: 'critical',
          message: `Humidity critically ${data.humidity.value > 80 ? 'high' : 'low'}: ${data.humidity.value}%`,
          timestamp: data.timestamp,
          storageUnit: data.storageUnit
        });
      }

      if (data.spoilageRisk === 'high' || data.spoilageRisk === 'critical') {
        alerts.push({
          id: `${unitId}-spoilage`,
          type: data.spoilageRisk === 'critical' ? 'critical' : 'warning',
          message: `High spoilage risk detected - immediate attention required`,
          timestamp: data.timestamp,
          storageUnit: data.storageUnit
        });
      }
    });

    return alerts;
  };

  // Calculate stats
  const calculateStats = () => {
    const units = Object.keys(storageData);
    const criticalCount = units.filter(key => 
      storageData[key].temperature.status === 'critical' || 
      storageData[key].humidity.status === 'critical' ||
      storageData[key].spoilageRisk === 'critical'
    ).length;
    
    const warningCount = units.filter(key => 
      storageData[key].temperature.status === 'warning' || 
      storageData[key].humidity.status === 'warning' ||
      storageData[key].spoilageRisk === 'high'
    ).length;

    // Calculate average risk
    const riskLevels = units.map(key => storageData[key].spoilageRisk);
    const riskScores = riskLevels.map(risk => {
      switch (risk) {
        case 'low': return 1;
        case 'medium': return 2;
        case 'high': return 3;
        case 'critical': return 4;
        default: return 1;
      }
    });
    const avgScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    const avgRisk = avgScore <= 1.5 ? 'low' : avgScore <= 2.5 ? 'medium' : avgScore <= 3.5 ? 'high' : 'critical';

    return {
      totalUnits: units.length,
      criticalAlerts: criticalCount,
      warningsActive: warningCount,
      averageRisk: avgRisk
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

  const alerts = generateAlerts();
  const stats = calculateStats();

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Storage Monitoring</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time environmental monitoring for crop storage</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseMockData(!useMockData)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {useMockData ? 'Using Mock Data' : 'Using Live Data'}
          </button>
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
            <p className="mt-4 text-gray-600">Loading storage data...</p>
          </div>
        ) : Object.keys(storageData).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg mb-4">No storage units configured</p>
            <p className="text-gray-500 text-sm mb-6">Set up your first storage unit to start monitoring</p>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Add Storage Unit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <StorageStats {...stats} />

            {/* Alerts */}
            {alerts.length > 0 && (
              <AlertPanel alerts={alerts} />
            )}

            {/* Storage Units */}
            <div className="space-y-6">
              {Object.entries(storageData).map(([unitId, data]) => (
                <div key={unitId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Unit Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{data.storageUnit}</h3>
                        <p className="text-sm text-gray-600">
                          Last updated: {new Date(data.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getSpoilageRiskColor(data.spoilageRisk)}`}>
                        <span>{getSpoilageIcon(data.spoilageRisk)}</span>
                        <span>Spoilage Risk: {data.spoilageRisk.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Unit Content */}
                  <div className="p-6 space-y-6">
                    {/* Temperature & Humidity Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <TemperatureChart
                          data={historicalData[unitId] || []}
                          currentValue={data.temperature.value}
                          status={data.temperature.status}
                        />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <HumidityChart
                          data={historicalData[unitId] || []}
                          currentValue={data.humidity.value}
                          status={data.humidity.status}
                        />
                      </div>
                    </div>

                    {/* Gas Levels */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Gas Levels</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <GasLevelCard
                          name="Carbon Dioxide"
                          symbol="CO₂"
                          data={data.gases.co2}
                          unit="ppm"
                        />
                        <GasLevelCard
                          name="Ethylene"
                          symbol="C₂H₄"
                          data={data.gases.ethylene}
                          unit="ppm"
                        />
                        <GasLevelCard
                          name="Ammonia"
                          symbol="NH₃"
                          data={data.gases.ammonia}
                          unit="ppm"
                        />
                        <GasLevelCard
                          name="Oxygen"
                          symbol="O₂"
                          data={data.gases.oxygen}
                          unit="%"
                        />
                      </div>
                    </div>

                    {/* Recommendations */}
                    {data.recommendations.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          💡 Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {data.recommendations.map((recommendation: string, index: number) => (
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
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
