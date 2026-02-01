import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { GasData } from '../../services/firebase.service';

interface GasLevelCardProps {
  name: string;
  symbol: string;
  data: GasData;
  unit: string;
}

export function GasLevelCard({ name, symbol, data, unit }: GasLevelCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return '🟢';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const percentage = Math.min((data.value / data.threshold) * 100, 100);

  return (
    <div className={`rounded-lg p-4 border-2 transition-all hover:shadow-md ${getStatusColor(data.status)}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-600">{name}</p>
          <p className="text-sm text-gray-500">{symbol}</p>
        </div>
        <span className="text-lg">{getStatusIcon(data.status)}</span>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900">
          {data.value}
          <span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getProgressColor(data.status)}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Threshold: {data.threshold}{unit}</span>
        <span className="font-semibold capitalize">{data.status}</span>
      </div>
    </div>
  );
}
