import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface TemperatureChartProps {
  data: Array<{ timestamp: number; temperature: number }>;
  currentValue: number;
  status: 'normal' | 'warning' | 'critical';
}

export function TemperatureChart({ data, currentValue, status }: TemperatureChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#10b981'; // green
      case 'warning':
        return '#f59e0b'; // yellow
      case 'critical':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'rgba(16, 185, 129, 0.1)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)';
      case 'critical':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-800">
            {format(new Date(data.timestamp), 'MMM dd, HH:mm')}
          </p>
          <p className="text-sm text-gray-600">
            Temperature: <span className="font-bold text-emerald-600">{data.temperature.toFixed(1)}°C</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = data.length > 0 ? data : [
    { timestamp: Date.now() - 3600000, temperature: currentValue },
    { timestamp: Date.now(), temperature: currentValue }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Temperature (24h)</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {currentValue.toFixed(1)}°C
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          status === 'normal' ? 'bg-green-100 text-green-800' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status.toUpperCase()}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getStatusColor(status)} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getStatusColor(status)} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke={getStatusColor(status)}
            strokeWidth={2}
            fill="url(#temperatureGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between text-xs text-gray-500 px-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Optimal: 15-25°C
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Critical: &lt;10°C or &gt;30°C
        </span>
      </div>
    </div>
  );
}
