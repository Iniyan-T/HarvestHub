import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface HistoricalData {
  date: string;
  price: number;
}

interface PredictionData {
  cropType: string;
  currentPrice: number;
  predictedPrice: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  bestSellTime: string;
  historicalData: HistoricalData[];
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number | undefined;
}

export function PriceGraph() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  useEffect(() => {
    fetchAndProcessCropData();
  }, []);

  const fetchAndProcessCropData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch all available crops
      const cropsResponse = await fetch("http://localhost:5000/api/crops?status=Available");
      if (!cropsResponse.ok) {
        throw new Error("Failed to fetch crops");
      }

      const cropsData = await cropsResponse.json();
      if (!cropsData.success || !cropsData.data) {
        throw new Error("No crops data received");
      }

      // Step 2: Extract unique crop names
      const uniqueCropNames = [...new Set(cropsData.data.map((crop: any) => crop.cropName))] as string[];

      if (uniqueCropNames.length === 0) {
        setError("No crops available in the system");
        setLoading(false);
        return;
      }

      // Step 3: Fetch price predictions for each crop
      const predictionPromises = uniqueCropNames.map((cropName) =>
        fetch(`http://localhost:5000/api/quality/price/${cropName}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error(`Error fetching prediction for ${cropName}:`, err);
            return { success: false };
          })
      );

      const predictionResults = await Promise.all(predictionPromises);

      // Step 4: Process predictions
      const successfulPredictions: PredictionData[] = [];
      predictionResults.forEach((result, index) => {
        if (result.success && result.data) {
          const data = result.data;
          successfulPredictions.push({
            cropType: data.cropType || uniqueCropNames[index],
            currentPrice: data.currentPrice || 0,
            predictedPrice: data.predictedPrice || 0,
            trend: data.trend || "stable",
            confidence: data.confidence || 0,
            bestSellTime: data.bestSellTime || "Not Available",
            historicalData: data.data?.historicalData || [],
          });
        }
      });

      if (successfulPredictions.length === 0) {
        setError("No price predictions available. Please try again later.");
        setLoading(false);
        return;
      }

      setPredictions(successfulPredictions);
      setSelectedCrop(successfulPredictions[0].cropType);
      
      // Step 5: Prepare chart data
      prepareChartData(successfulPredictions);
    } catch (err: any) {
      console.error("Error fetching price data:", err);
      setError(err.message || "Failed to load price data. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (predictionsList: PredictionData[]) => {
    // Combine all historical data points and create chart data
    const dataMap = new Map<string, ChartDataPoint>();

    predictionsList.forEach((prediction) => {
      prediction.historicalData.forEach((point) => {
        const dateKey = point.date;
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { date: dateKey });
        }
        const entry = dataMap.get(dateKey)!;
        entry[`${prediction.cropType}_actual`] = point.price;
      });

      // Add predicted price for the future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateKey = futureDate.toISOString().split("T")[0];

      if (!dataMap.has(futureDateKey)) {
        dataMap.set(futureDateKey, { date: futureDateKey });
      }
      const futureEntry = dataMap.get(futureDateKey)!;
      futureEntry[`${prediction.cropType}_predicted`] = prediction.predictedPrice;
    });

    // Convert map to sorted array
    const sortedData = Array.from(dataMap.values()).sort((a, b) => {
      const dateA = new Date(a.date as string);
      const dateB = new Date(b.date as string);
      return dateA.getTime() - dateB.getTime();
    });

    setChartData(sortedData);
  };

  const getColors = () => {
    return [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
  };

  const colors = getColors();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading crop price predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Error Loading Price Graph</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-lg">
          <p>No crops available with price predictions yet.</p>
        </div>
      </div>
    );
  }

  const selectedPrediction = predictions.find((p) => p.cropType === selectedCrop);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-800 mb-2">Crop Price Predictions</h2>
        <p className="text-gray-600">
          Historical prices and AI-predicted future trends to help plan procurement timing
        </p>
      </div>

      {/* Crop Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {predictions.map((pred, idx) => (
          <button
            key={pred.cropType}
            onClick={() => setSelectedCrop(pred.cropType)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCrop === pred.cropType
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {pred.cropType}
          </button>
        ))}
      </div>

      {/* Stats Cards for Selected Crop */}
      {selectedPrediction && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm font-medium mb-1">Current Price</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{selectedPrediction.currentPrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-2">/kg</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-gray-600 text-sm font-medium mb-1">Predicted Price</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{selectedPrediction.predictedPrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {((selectedPrediction.predictedPrice - selectedPrediction.currentPrice) / selectedPrediction.currentPrice * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-gray-600 text-sm font-medium mb-1">Trend</p>
            <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
              {selectedPrediction.trend === "up" && <TrendingUp className="w-5 h-5" />}
              {selectedPrediction.trend === "down" && <TrendingDown className="w-5 h-5" />}
              {selectedPrediction.trend === "stable" && "→"}
              {selectedPrediction.trend.charAt(0).toUpperCase() + selectedPrediction.trend.slice(1)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <p className="text-gray-600 text-sm font-medium mb-1">Confidence</p>
            <p className="text-2xl font-bold text-orange-600">{selectedPrediction.confidence}%</p>
            <p className="text-xs text-gray-600 mt-2">Best: {selectedPrediction.bestSellTime}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                label={{ value: "Price (₹)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") {
                    return `₹${value.toFixed(2)}`;
                  }
                  return value;
                }}
              />
              <Legend />

              {/* Render lines for each crop */}
              {predictions.map((pred, idx) => (
                <Line
                  key={`${pred.cropType}_actual`}
                  type="monotone"
                  dataKey={`${pred.cropType}_actual`}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${pred.cropType} (Historical)`}
                  connectNulls
                />
              ))}

              {/* Render dashed lines for predictions */}
              {predictions.map((pred, idx) => (
                <Line
                  key={`${pred.cropType}_predicted`}
                  type="monotone"
                  dataKey={`${pred.cropType}_predicted`}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={`${pred.cropType} (Predicted)`}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-20">No chart data available</p>
        )}
      </div>

      {/* Legend Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-900 mb-2">📊 How to Read This Chart:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Solid Lines:</strong> Historical price data from past transactions</li>
          <li>• <strong>Dashed Lines:</strong> AI-predicted future price trends (next 7 days)</li>
          <li>• <strong>Farmers:</strong> Use to decide optimal harvest and selling timing</li>
          <li>• <strong>Buyers:</strong> Plan procurement when prices are favorable</li>
        </ul>
      </div>

      {/* Data Last Updated Note */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
