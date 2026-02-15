import { useNavigate, useParams } from "react-router";
import {
  Users,
  Loader2,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Sprout,
  ChevronRight,
  Star,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getValidatedUserId } from "../utils/validation";

interface FarmerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profileImage?: string;
  farmName: string;
  farmSize: number;
  rating: number;
  verificationStatus: string;
  cropsCount: number;
  totalQuantity: number;
  cropNames: string[];
}

export function NearbyFarmers() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { userId: currentUserId, basePath } = getValidatedUserId(userId);
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/farmers");
      const data = await response.json();
      if (data.success) {
        setFarmers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationString = (address: FarmerData["address"]) => {
    const parts: string[] = [];
    if (address?.city) parts.push(address.city);
    if (address?.state) parts.push(address.state);
    if (address?.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const getInitial = (name: string) =>
    (name || "F").charAt(0).toUpperCase();

  const filteredFarmers = farmers.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      getLocationString(f.address).toLowerCase().includes(q) ||
      f.cropNames.some((c) => c.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Nearby Farmers
              </h1>
              <p className="text-xs text-gray-400">
                {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                transition-all"
            />
          </div>
        </div>
      </header>

      {/* Farmer Cards */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {filteredFarmers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">
              {searchQuery ? "No matching farmers" : "No farmers available"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Check back later for available farmers"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-5">
                  {/* Top: Avatar + Name + Badge */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                      {getInitial(farmer.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-gray-900 text-base truncate">
                          {farmer.name}
                        </h3>
                        {farmer.verificationStatus === "verified" && (
                          <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {farmer.farmName && (
                        <p className="text-xs text-gray-500 truncate">
                          {farmer.farmName}
                          {farmer.farmSize > 0 &&
                            ` · ${farmer.farmSize} acres`}
                        </p>
                      )}
                      {farmer.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium text-gray-600">
                            {farmer.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {getLocationString(farmer.address)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{farmer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {farmer.email}
                      </span>
                    </div>
                  </div>

                  {/* Crop Tags */}
                  {farmer.cropNames.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sprout className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Available Crops
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {farmer.cropNames.map((crop) => (
                          <span
                            key={crop}
                            className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100"
                          >
                            {crop}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md border border-blue-100">
                          {farmer.totalQuantity} quintals
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `${basePath}/messages?farmerId=${farmer._id}&farmerName=${encodeURIComponent(farmer.name)}`
                        );
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-green-500 text-green-600 rounded-lg
                        hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `${basePath}/nearby-farmers/${farmer._id}`
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600
                        text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all
                        text-sm font-medium shadow-sm group-hover:shadow-md"
                    >
                      View Crops
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
