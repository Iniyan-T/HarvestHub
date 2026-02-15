import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Sprout,
  Star,
  ShieldCheck,
  Package,
  IndianRupee,
  Calendar,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getValidatedUserId } from "../utils/validation";

interface Crop {
  _id: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  price: number;
  status: string;
  location?: string;
  harvestDate?: string;
  aiGrade?: {
    grade: string;
    confidence: number;
    qualityScore?: number;
    freshness?: string;
    defects?: string[];
  };
  imageUrl?: string;
}

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact: string;
  profileImage?: string;
  farmName: string;
  farmSize: number;
  rating: number;
  verificationStatus: string;
  yearsOfExperience: number;
}

interface RequestFormData {
  cropName: string;
  cropId: string;
  quantity: string;
  offerPrice: string;
  buyerName: string;
  buyerContact: string;
  paymentMethod: "online" | "offline";
  transportNeeded: boolean;
}

export function FarmerDetail() {
  const { farmerId, userId } = useParams<{
    farmerId: string;
    userId: string;
  }>();
  const navigate = useNavigate();
  const { userId: currentUserId, basePath } = getValidatedUserId(userId);
  const buyerId = currentUserId;

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loadingFarmer, setLoadingFarmer] = useState(true);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [requestForm, setRequestForm] = useState<RequestFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerData();
      fetchFarmerCrops();
    }
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/farmers/${farmerId}`
      );
      const data = await res.json();
      if (data.success) setFarmer(data.data);
    } catch (e) {
      console.error("Error fetching farmer:", e);
    } finally {
      setLoadingFarmer(false);
    }
  };

  const fetchFarmerCrops = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/crops/farmer/${farmerId}`
      );
      const data = await res.json();
      if (data.success) {
        setCrops(
          data.data.filter((c: Crop) => c.status === "Available")
        );
      }
    } catch (e) {
      console.error("Error fetching crops:", e);
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleSendRequest = (cropName: string, cropId: string) => {
    setRequestForm({
      cropName,
      cropId,
      quantity: "",
      offerPrice: "",
      buyerName: "",
      buyerContact: "",
      paymentMethod: "offline",
      transportNeeded: false,
    });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId, buyerId, ...requestForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Request sent successfully!" });
        setRequestForm(null);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send request",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Error sending request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "B":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "C":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getFreshnessColor = (freshness?: string) => {
    switch (freshness) {
      case "Excellent":
        return "text-emerald-600";
      case "Good":
        return "text-green-600";
      case "Fair":
        return "text-amber-600";
      case "Poor":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const isLoading = loadingFarmer || loadingCrops;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading farmer details...</p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 font-medium">Farmer not found</p>
          <button
            onClick={() => navigate(`${basePath}/nearby-farmers`)}
            className="mt-4 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Farmers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/nearby-farmers`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -ml-1"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sprout className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {farmer.name}
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              Farmer Profile &amp; Available Crops
            </p>
          </div>
        </div>
      </header>

      {/* Toast Message */}
      {message && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm
            ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* ── Farmer Info Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                {(farmer.name || "F").charAt(0).toUpperCase()}
              </div>

              {/* Info Grid */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {farmer.name}
                    </h2>
                    {farmer.verificationStatus === "verified" && (
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  {farmer.farmName && (
                    <p className="text-sm text-gray-500">
                      {farmer.farmName}
                      {farmer.farmSize > 0 && ` · ${farmer.farmSize} acres`}
                    </p>
                  )}
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">{farmer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{farmer.phone || farmer.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">{farmer.email}</span>
                  </div>
                  {farmer.rating > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span className="font-medium">
                        {farmer.rating.toFixed(1)} rating
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">
                    {crops.length} crop{crops.length !== 1 ? "s" : ""} available
                  </span>
                  {farmer.yearsOfExperience > 0 && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                      {farmer.yearsOfExperience} yrs experience
                    </span>
                  )}
                  <button
                    onClick={() =>
                      navigate(
                        `${basePath}/messages?farmerId=${farmerId}&farmerName=${encodeURIComponent(farmer.name)}`
                      )
                    }
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600
                      text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all
                      text-xs font-medium shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat with Farmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Crops Section ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-bold text-gray-900">
              Available Crops
            </h3>
          </div>

          {crops.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Sprout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                No crops available from this farmer
              </p>
              <p className="text-gray-400 text-sm mt-1">Check back later</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {crops.map((crop) => (
                <div
                  key={crop._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden"
                >
                  <div className="flex">
                    {/* Crop Image */}
                    {crop.imageUrl && (
                      <div className="w-32 lg:w-36 flex-shrink-0 bg-gray-100">
                        <img
                          src={`http://localhost:5000${crop.imageUrl}`}
                          alt={crop.cropName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Crop Info */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 text-base">
                          {crop.cropName}
                        </h4>
                        {crop.aiGrade && crop.aiGrade.grade !== "Pending" && (
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getGradeColor(crop.aiGrade.grade)}`}
                          >
                            Grade {crop.aiGrade.grade}
                          </span>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">
                            Quantity:{" "}
                            <span className="font-semibold text-gray-800">
                              {crop.quantity} quintals
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">
                            Price:{" "}
                            <span className="font-bold text-green-600">
                              ₹{crop.price}/quintal
                            </span>
                          </span>
                        </div>
                        {crop.harvestDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600">
                              Harvested:{" "}
                              <span className="font-medium text-gray-800">
                                {new Date(
                                  crop.harvestDate
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </span>
                          </div>
                        )}
                        {crop.aiGrade &&
                          crop.aiGrade.grade !== "Pending" && (
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-600">
                                {crop.aiGrade.confidence}% confidence
                                {crop.aiGrade.freshness &&
                                  crop.aiGrade.freshness !== "Unknown" && (
                                    <span
                                      className={`ml-1 font-medium ${getFreshnessColor(crop.aiGrade.freshness)}`}
                                    >
                                      · {crop.aiGrade.freshness}
                                    </span>
                                  )}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Request Button */}
                      <button
                        onClick={() =>
                          handleSendRequest(crop.cropName, crop._id)
                        }
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg
                          hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium shadow-sm"
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Request Form Modal ── */}
      {requestForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">
                Request for {requestForm.cropName}
              </h3>
              <p className="text-green-100 text-sm mt-0.5">
                From {farmer.name}
              </p>
            </div>

            <form
              onSubmit={handleSubmitRequest}
              className="p-5 space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.buyerName}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      buyerName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                  placeholder="Enter your name"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={requestForm.buyerContact}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      buyerContact: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                  placeholder="Enter contact number"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quantity (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={requestForm.quantity}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Offer Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Offer Price (₹ per Kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={requestForm.offerPrice}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      offerPrice: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                  placeholder="Enter offer price"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Payment Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={requestForm.paymentMethod === "online"}
                      onChange={() =>
                        setRequestForm({
                          ...requestForm,
                          paymentMethod: "online",
                        })
                      }
                      className="w-4 h-4 text-green-600 accent-green-600"
                    />
                    <span className="text-gray-700 font-medium">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="offline"
                      checked={requestForm.paymentMethod === "offline"}
                      onChange={() =>
                        setRequestForm({
                          ...requestForm,
                          paymentMethod: "offline",
                        })
                      }
                      className="w-4 h-4 text-green-600 accent-green-600"
                    />
                    <span className="text-gray-700 font-medium">Offline</span>
                  </label>
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Transport
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="transport"
                      value="own"
                      checked={!requestForm.transportNeeded}
                      onChange={() =>
                        setRequestForm({
                          ...requestForm,
                          transportNeeded: false,
                        })
                      }
                      className="w-4 h-4 text-green-600 accent-green-600"
                    />
                    <span className="text-gray-700 font-medium">Own Transport</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="transport"
                      value="need"
                      checked={requestForm.transportNeeded}
                      onChange={() =>
                        setRequestForm({
                          ...requestForm,
                          transportNeeded: true,
                        })
                      }
                      className="w-4 h-4 text-green-600 accent-green-600"
                    />
                    <span className="text-gray-700 font-medium">Need Transport</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestForm(null)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50
                    transition-colors text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg
                    hover:from-green-600 hover:to-green-700 transition-all text-sm font-semibold
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDetail;
