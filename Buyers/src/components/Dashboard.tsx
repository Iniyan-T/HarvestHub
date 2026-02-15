import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Package, User, MapPin } from "lucide-react";
import { getValidatedUserId } from "../utils/validation";

interface Crop {
  _id: string;
  cropName: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl?: string;
  farmerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      city?: string;
      state?: string;
    };
  };
  aiGrade?: {
    grade: string;
    confidence: number;
  };
}

interface CropSummary {
  cropName: string;
  totalQuantity: number;
  avgPrice: number;
  farmerCount: number;
  crops: Crop[];
}

export function Dashboard() {
  const { userId } = useParams<{ userId: string }>();
  const { userId: currentUserId, basePath } = getValidatedUserId(userId);
  const [cropSummaries, setCropSummaries] = useState<CropSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCropTypes();
  }, []);

  const fetchAvailableCropTypes = async () => {
    try {
      console.log('Fetching crops from backend...');
      const response = await fetch('http://localhost:5000/api/crops?status=Available');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Crops data:', data.data);
        // Group crops by name and calculate summaries
        const cropGroups: { [key: string]: Crop[] } = {};
        data.data.forEach((crop: Crop) => {
          if (!cropGroups[crop.cropName]) {
            cropGroups[crop.cropName] = [];
          }
          cropGroups[crop.cropName].push(crop);
        });

        const summaries: CropSummary[] = Object.entries(cropGroups).map(([cropName, crops]) => {
          const totalQuantity = crops.reduce((sum, c) => sum + c.quantity, 0);
          const avgPrice = crops.reduce((sum, c) => sum + c.price, 0) / crops.length;
          const uniqueFarmers = new Set(crops.map(c => c.farmerId?._id).filter(Boolean));
          return {
            cropName,
            totalQuantity,
            avgPrice: Math.round(avgPrice),
            farmerCount: uniqueFarmers.size,
            crops
          };
        });

        console.log('Crop summaries:', summaries);
        setCropSummaries(summaries);
      } else {
        setError('Failed to fetch crops');
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError('Error connecting to server. Make sure backend is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  const getCropColor = (index: number) => {
    const colors = [
      "bg-yellow-100",
      "bg-amber-100",
      "bg-green-100",
      "bg-orange-100",
      "bg-red-100",
      "bg-purple-100",
      "bg-blue-100",
      "bg-pink-100",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="text-gray-700 font-medium">Loading crops...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-l-red-500 text-red-800 px-6 py-4 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hi Buyers!</h2>
            <p className="text-xl text-gray-600">Available Crops:</p>
          </div>
          <button
            onClick={fetchAvailableCropTypes}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Crop Cards Grid */}
      {cropSummaries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="bg-white border-l-4 border-l-blue-500 rounded-2xl shadow-lg p-8 max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌾</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2 text-center">No crops available</p>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Farmers need to add crops first in the Farmer Portal
            </p>
            <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-4 rounded-xl">
              <p className="flex items-center gap-2">📊 <span className="font-medium">Backend:</span> localhost:5000</p>
              <p className="flex items-center gap-2">🌾 <span className="font-medium">Farmer Portal:</span> localhost:5173</p>
              <p className="flex items-center gap-2">🛒 <span className="font-medium">Buyer Portal:</span> localhost:3000</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cropSummaries.map((summary, index) => (
            <Link
              key={summary.cropName}
              to={`${basePath}/crop/${summary.cropName.toLowerCase()}`}
              className="group bg-white rounded-2xl p-6 min-h-[220px] hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative z-10">
                {/* Header with crop name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xl">🌾</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                    {summary.cropName}
                  </h3>
                </div>

                {/* Crop details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      <span className="font-semibold text-gray-800">{summary.totalQuantity}</span> kg available
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-4 h-4 flex items-center justify-center text-green-500 font-bold">₹</span>
                    <span className="text-sm">
                      Avg. <span className="font-semibold text-gray-800">₹{summary.avgPrice}</span>/kg
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      <span className="font-semibold text-gray-800">{summary.farmerCount}</span> farmer{summary.farmerCount > 1 ? 's' : ''} selling
                    </span>
                  </div>

                  {/* Show first farmer location if available */}
                  {summary.crops[0]?.farmerId?.address?.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{summary.crops[0].farmerId.address.city}</span>
                    </div>
                  )}

                  {/* AI Grade badge if available */}
                  {summary.crops[0]?.aiGrade?.grade && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        summary.crops[0].aiGrade.grade === 'A' ? 'bg-green-100 text-green-800' :
                        summary.crops[0].aiGrade.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Grade {summary.crops[0].aiGrade.grade}
                      </span>
                    </div>
                  )}
                </div>

                {/* View details link */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-sm text-green-600 font-medium group-hover:text-green-700">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}