import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
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
    oxygen: GasData;
  };
  spoilageRisk: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  storageUnit: string;
}

export interface HistoricalDataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
}

// Subscribe to real-time storage data
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
        oxygen: { value: 21, status: 'normal', threshold: 19 }
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
        oxygen: { value: 20, status: 'normal', threshold: 19 }
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
