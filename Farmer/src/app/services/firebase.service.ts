import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, query, orderByChild, limitToLast } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEaLKnPxkqL8VXJk1JvZqY3h3Z7L0N4Qo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agri-48613.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://agri-48613-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agri-48613",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agri-48613.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface GasData {
  value: number;
  status: 'normal' | 'warning' | 'critical';
  threshold: number;
}

export interface StorageData {
  timestamp: number;
  temperature: {
    value: number;
    status: 'normal' | 'warning' | 'critical';
    unit: string;
  };
  humidity: {
    value: number;
    status: 'normal' | 'warning' | 'critical';
    unit: string;
  };
  gases: {
    co2: GasData;
    ethylene: GasData;
    ammonia: GasData;
    methane: GasData;
    h2s: GasData;
  };
  spoilageRisk: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  storageUnit: string;
}

// ESP32 sensor raw data interface
export interface ESP32SensorData {
  temperature: number;
  humidity: number;
  CO2: number;
  ammonia: number;
  methane: number;
  ethylene: number;
  H2S: number;
  timestamp?: number; // Optional - may not exist in old data
}

export interface HistoricalDataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
}

// Transform ESP32 raw data to StorageData format
const transformESP32Data = (sensorData: ESP32SensorData): StorageData => {
  const now = sensorData.timestamp || Date.now();
  
  // Calculate temperature status (optimal: 15-25°C)
  const tempStatus = calculateStatus(
    sensorData.temperature,
    { min: 15, max: 25 },
    { min: 10, max: 30 }
  );
  
  // Calculate humidity status (optimal: 50-70%)
  const humidityStatus = calculateStatus(
    sensorData.humidity,
    { min: 50, max: 70 },
    { min: 40, max: 80 }
  );
  
  // Gas thresholds (PPM)
  const co2Status = calculateStatus(sensorData.CO2, { min: 0, max: 1000 }, { min: 0, max: 1500 });
  const ammoniaStatus = calculateStatus(sensorData.ammonia, { min: 0, max: 25 }, { min: 0, max: 50 });
  const methaneStatus = calculateStatus(sensorData.methane, { min: 0, max: 100 }, { min: 0, max: 200 });
  const ethyleneStatus = calculateStatus(sensorData.ethylene, { min: 0, max: 10 }, { min: 0, max: 20 });
  const h2sStatus = calculateStatus(sensorData.H2S, { min: 0, max: 10 }, { min: 0, max: 20 });
  
  // Calculate overall spoilage risk
  const criticalCount = [tempStatus, humidityStatus, co2Status, ammoniaStatus, methaneStatus, ethyleneStatus, h2sStatus]
    .filter(status => status === 'critical').length;
  const warningCount = [tempStatus, humidityStatus, co2Status, ammoniaStatus, methaneStatus, ethyleneStatus, h2sStatus]
    .filter(status => status === 'warning').length;
  
  let spoilageRisk: 'low' | 'medium' | 'high' | 'critical';
  if (criticalCount >= 2) spoilageRisk = 'critical';
  else if (criticalCount >= 1 || warningCount >= 3) spoilageRisk = 'high';
  else if (warningCount >= 1) spoilageRisk = 'medium';
  else spoilageRisk = 'low';
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (tempStatus !== 'normal') {
    recommendations.push(sensorData.temperature > 25 
      ? 'Reduce temperature - activate cooling system'
      : 'Increase temperature - check heating system');
  }
  if (humidityStatus !== 'normal') {
    recommendations.push(sensorData.humidity > 70
      ? 'Reduce humidity - improve ventilation'
      : 'Increase humidity - check moisture levels');
  }
  if (co2Status !== 'normal') {
    recommendations.push('High CO2 levels detected - increase ventilation');
  }
  if (ethyleneStatus !== 'normal') {
    recommendations.push('Ethylene levels rising - separate ripening produce');
  }
  if (ammoniaStatus !== 'normal') {
    recommendations.push('Ammonia detected - check for decomposition');
  }
  if (methaneStatus !== 'normal') {
    recommendations.push('Methane levels elevated - inspect for fermentation');
  }
  if (h2sStatus !== 'normal') {
    recommendations.push('H2S detected - potential spoilage in progress');
  }
  if (recommendations.length === 0) {
    recommendations.push('All parameters within normal range');
  }
  
  return {
    timestamp: now,
    temperature: {
      value: Math.round(sensorData.temperature * 10) / 10,
      status: tempStatus,
      unit: '°C'
    },
    humidity: {
      value: Math.round(sensorData.humidity * 10) / 10,
      status: humidityStatus,
      unit: '%'
    },
    gases: {
      co2: { value: Math.round(sensorData.CO2), status: co2Status, threshold: 1000 },
      ammonia: { value: Math.round(sensorData.ammonia * 10) / 10, status: ammoniaStatus, threshold: 25 },
      methane: { value: Math.round(sensorData.methane * 10) / 10, status: methaneStatus, threshold: 100 },
      ethylene: { value: Math.round(sensorData.ethylene * 10) / 10, status: ethyleneStatus, threshold: 10 },
      h2s: { value: Math.round(sensorData.H2S * 10) / 10, status: h2sStatus, threshold: 10 }
    },
    spoilageRisk,
    recommendations,
    storageUnit: 'Main Storage'
  };
};

// Subscribe to real-time ESP32 sensor data
// Track last Firebase data change timestamp
let lastFirebaseChangeTime = 0;
let previousDataHash = '';
let staleCheckInterval: NodeJS.Timeout | null = null;

export const subscribeToESP32Data = (
  callback: (data: StorageData | null) => void
) => {
  const sensorRef = ref(database, 'sensor');
  
  // Clear any existing interval
  if (staleCheckInterval) {
    clearInterval(staleCheckInterval);
  }
  
  // Check every 5 seconds if data is stale
  staleCheckInterval = setInterval(() => {
    if (lastFirebaseChangeTime > 0) {
      const timeSinceLastChange = Date.now() - lastFirebaseChangeTime;
      if (timeSinceLastChange > 15000) {
        console.log(`⚠️ No updates for ${Math.floor(timeSinceLastChange / 1000)}s. ESP32 disconnected.`);
        callback(null);
      }
    }
  }, 5000);
  
  const unsubscribe = onValue(sensorRef, (snapshot) => {
    const rawData = snapshot.val() as ESP32SensorData | null;
    
    if (rawData && rawData.temperature !== undefined) {
      // Always update connection time when we receive ANY data from Firebase
      lastFirebaseChangeTime = Date.now();
      
      // Create hash to detect if actual sensor values changed
      const dataHash = JSON.stringify({
        temp: rawData.temperature,
        hum: rawData.humidity,
        co2: rawData.CO2
      });
      
      if (dataHash !== previousDataHash) {
        previousDataHash = dataHash;
        console.log('✅ ESP32 sending data - sensor values updated');
      } else {
        console.log('✅ ESP32 connected - monitoring...');
      }
      
      // Transform ESP32 data to StorageData format
      const transformedData = transformESP32Data(rawData);
      
      // Save to historical data in Firebase (only if data is fresh)
      const historyRef = ref(database, `history/${Date.now()}`);
      set(historyRef, {
        timestamp: Date.now(),
        temperature: rawData.temperature,
        humidity: rawData.humidity,
        CO2: rawData.CO2,
        ammonia: rawData.ammonia,
        methane: rawData.methane,
        ethylene: rawData.ethylene,
        H2S: rawData.H2S
      }).catch(error => console.error('Error saving history:', error));
      
      callback(transformedData);
    } else {
      console.log('No sensor data available yet');
      callback(null);
    }
  }, (error) => {
    console.error('Firebase sensor read error:', error);
    callback(null);
  });

  return () => {
    if (staleCheckInterval) {
      clearInterval(staleCheckInterval);
      staleCheckInterval = null;
    }
    off(sensorRef, 'value', unsubscribe);
  };
};

// Subscribe to historical sensor data for charts
export const subscribeToESP32HistoricalData = (
  hoursBack: number,
  callback: (data: HistoricalDataPoint[]) => void
) => {
  const historyRef = ref(database, 'history');
  const historyQuery = query(historyRef, orderByChild('timestamp'), limitToLast(1000));
  
  const unsubscribe = onValue(historyQuery, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      const now = Date.now();
      const cutoff = now - (hoursBack * 60 * 60 * 1000);
      
      // Convert to array and filter by time
      const historicalData: HistoricalDataPoint[] = Object.values(data)
        .filter((item: any) => item.timestamp >= cutoff)
        .map((item: any) => ({
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      callback(historicalData);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Firebase historical sensor error:', error);
    callback([]);
  });

  return () => off(historyRef, 'value', unsubscribe);
};

// Subscribe to real-time storage data (legacy - for multiple storage units)
export const subscribeToStorageData = (
  farmerId: string,
  callback: (data: Record<string, StorageData>) => void
) => {
  const storageRef = ref(database, `storageData/${farmerId}`);
  
  const unsubscribe = onValue(storageRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Firebase read error:', error);
    callback({});
  });

  return () => off(storageRef, 'value', unsubscribe);
};

// Subscribe to historical data for charts
export const subscribeToHistoricalData = (
  farmerId: string,
  storageUnitId: string,
  hoursBack: number,
  callback: (data: HistoricalDataPoint[]) => void
) => {
  const historicalRef = ref(database, `historicalData/${farmerId}/${storageUnitId}`);
  
  const unsubscribe = onValue(historicalRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const now = Date.now();
      const cutoff = now - (hoursBack * 60 * 60 * 1000);
      
      // Convert to array and filter by time
      const historicalData = Object.values(data)
        .filter((item: any) => item.timestamp >= cutoff)
        .map((item: any) => ({
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      callback(historicalData);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Firebase historical data error:', error);
    callback([]);
  });

  return () => off(historicalRef, 'value', unsubscribe);
};

// Calculate status based on value and thresholds
export const calculateStatus = (
  value: number,
  normalRange: { min: number; max: number },
  warningRange: { min: number; max: number }
): 'normal' | 'warning' | 'critical' => {
  if (value >= normalRange.min && value <= normalRange.max) {
    return 'normal';
  } else if (value >= warningRange.min && value <= warningRange.max) {
    return 'warning';
  } else {
    return 'critical';
  }
};

// Generate mock data for testing (remove in production)
export const generateMockStorageData = (): Record<string, StorageData> => {
  return {
    'storage_unit_1': {
      timestamp: Date.now(),
      temperature: {
        value: 18,
        status: 'normal',
        unit: '°C'
      },
      humidity: {
        value: 65,
        status: 'normal',
        unit: '%'
      },
      gases: {
        co2: { value: 450, status: 'normal', threshold: 1000 },
        ethylene: { value: 12, status: 'warning', threshold: 10 },
        ammonia: { value: 5, status: 'normal', threshold: 25 },
        methane: { value: 45, status: 'normal', threshold: 100 },
        h2s: { value: 3, status: 'normal', threshold: 10 }
      },
      spoilageRisk: 'medium',
      recommendations: [
        'Reduce ethylene levels by improving ventilation',
        'Monitor temperature - approaching upper limit'
      ],
      storageUnit: 'Rice Storage A'
    },
    'storage_unit_2': {
      timestamp: Date.now(),
      temperature: {
        value: 22,
        status: 'warning',
        unit: '°C'
      },
      humidity: {
        value: 78,
        status: 'warning',
        unit: '%'
      },
      gases: {
        co2: { value: 890, status: 'warning', threshold: 1000 },
        ethylene: { value: 8, status: 'normal', threshold: 10 },
        ammonia: { value: 22, status: 'warning', threshold: 25 },
        methane: { value: 85, status: 'normal', threshold: 100 },
        h2s: { value: 7, status: 'normal', threshold: 10 }
      },
      spoilageRisk: 'high',
      recommendations: [
        'Temperature and humidity both elevated - improve cooling',
        'CO2 levels approaching critical - check ventilation system',
        'Consider redistributing crops to reduce density'
      ],
      storageUnit: 'Wheat Storage B'
    }
  };
};

export { database, ref };
