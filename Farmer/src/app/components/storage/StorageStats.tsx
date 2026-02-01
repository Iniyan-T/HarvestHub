import { Warehouse, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface StorageStatsProps {
  totalUnits: number;
  criticalAlerts: number;
  warningsActive: number;
  averageRisk: string;
}

export function StorageStats({ totalUnits, criticalAlerts, warningsActive, averageRisk }: StorageStatsProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = [
    {
      label: 'Active Storage Units',
      value: totalUnits,
      icon: Warehouse,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Critical Alerts',
      value: criticalAlerts,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Warnings Active',
      value: warningsActive,
      icon: Activity,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Average Risk',
      value: averageRisk.charAt(0).toUpperCase() + averageRisk.slice(1),
      icon: TrendingUp,
      color: getRiskColor(averageRisk),
      bgColor: 'bg-purple-50',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.isText ? stat.color : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
