import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface HumidityChartProps {
  data: Array<{ timestamp: number; humidity: number }>;
  currentValue: number;
  status: 'normal' | 'warning' | 'critical';
}

export function HumidityChart({ data, currentValue, status }: HumidityChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#3b82f6'; // blue
      case 'warning':
        return '#f59e0b'; // yellow
      case 'critical':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
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
            Humidity: <span className="font-bold text-blue-600">{data.humidity.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = data.length > 0 ? data : [
    { timestamp: Date.now() - 3600000, humidity: currentValue },
    { timestamp: Date.now(), humidity: currentValue }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Humidity (24h)</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {currentValue.toFixed(1)}%
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
            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
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
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            stroke={getStatusColor(status)}
            strokeWidth={2}
            fill="url(#humidityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between text-xs text-gray-500 px-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Optimal: 50-70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Critical: &lt;40% or &gt;80%
        </span>
      </div>
    </div>
  );
}
