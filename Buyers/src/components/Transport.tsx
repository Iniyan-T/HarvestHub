import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Loader2, RefreshCw, Truck, MapPin, Clock, Wind, Thermometer, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { getValidatedUserId } from "../utils/validation";

interface TransportData {
  _id: string;
  orderId: {
    orderNumber: string;
    totalAmount: number;
  };
  farmerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  estimatedETA: {
    distanceKm: number;
    hours: number;
    minutes: number;
    calculatedAt: string;
  };
  estimatedDeliveryDate: string;
  pickupDate: string;
  actualDeliveryDate?: string;
  pickupLocation: {
    address: string;
    city: string;
    state: string;
  };
  deliveryLocation: {
    address: string;
    city: string;
    state: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  transportProvider: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  temperature?: number;
  humidity?: number;
  photos?: string[];
  notes?: string;
}

interface PaginationInfo {
  total: number;
  skip: number;
  limit: number;
}

export function Transport() {
  const { userId } = useParams<{ userId: string }>();
  const [transports, setTransports] = useState<TransportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, skip: 0, limit: 10 });
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { userId: currentUserId } = getValidatedUserId(userId);

  useEffect(() => {
    if (currentUserId) {
      fetchTransports();
    }
  }, [statusFilter, currentUserId]);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = statusFilter ? `?status=${statusFilter}` : "";
      const response = await fetch(`http://localhost:5000/api/transport/user/${currentUserId}${query}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch transports");
      }

      if (data.success) {
        setTransports(data.data);
        setPagination(data.pagination);
      } else {
        setError("Failed to fetch transports");
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "delayed":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-5 h-5" />;
      case "in_transit":
        return <Truck className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const calculateTimeRemaining = (deliveryDate: string) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffMs = delivery.getTime() - now.getTime();
    
    if (diffMs < 0) return "Delivery completed";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days}d ${diffHours % 24}h remaining`;
    }
    
    return `${diffHours}h ${diffMinutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-medium text-gray-800 mb-2">Shipment Tracking</h2>
          <p className="text-gray-600">Track your incoming deliveries and estimated arrival times</p>
        </div>
        <button
          onClick={fetchTransports}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {["pending", "scheduled", "in_transit", "delivered"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {transports.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
            <Truck className="w-12 h-12 mx-auto text-blue-400 mb-4" />
            <p className="text-lg text-gray-700 mb-2">No shipments found</p>
            <p className="text-sm text-gray-600">
              {statusFilter 
                ? "No shipments with this status yet"
                : "Your orders haven't been assigned for transport yet"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Transports Grid */}
          <div className="space-y-4">
            {transports.map((transport) => (
              <div
                key={transport._id}
                className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order #{transport.orderId.orderNumber}</p>
                      <p className="text-lg font-semibold text-gray-800">
                        From {transport.farmerId.name}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(transport.status)}`}>
                      {getStatusIcon(transport.status)}
                      <span className="text-sm font-medium capitalize">{transport.status.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    {/* ETA Info */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Est. Delivery Time</p>
                        <p className="text-lg font-bold text-gray-800">
                          {transport.estimatedETA.hours}h {transport.estimatedETA.minutes}m
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {calculateTimeRemaining(transport.estimatedDeliveryDate)}
                        </p>
                      </div>
                    </div>

                    {/* Distance Info */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Distance</p>
                        <p className="text-lg font-bold text-gray-800">
                          {transport.estimatedETA.distanceKm} km
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {transport.pickupLocation.city} → {transport.deliveryLocation.city}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Date Info */}
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Est. Delivery</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(transport.estimatedDeliveryDate).split(" ").slice(0, 3).join(" ")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(transport.estimatedDeliveryDate).split(" ").slice(3).join(" ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Pickup</p>
                      <p className="text-sm text-gray-800 font-medium">{transport.pickupLocation.address}</p>
                      <p className="text-xs text-gray-600">{transport.pickupLocation.city}, {transport.pickupLocation.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Delivery</p>
                      <p className="text-sm text-gray-800 font-medium">{transport.deliveryLocation.address}</p>
                      <p className="text-xs text-gray-600">{transport.deliveryLocation.city}, {transport.deliveryLocation.state}</p>
                    </div>
                  </div>

                  {/* Transport Provider Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Transport Provider</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{transport.transportProvider.name}</p>
                        <p className="text-xs text-gray-600 mt-1">Vehicle: {transport.transportProvider.vehicleNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600 font-semibold">{transport.transportProvider.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Environmental Monitoring if available */}
                  {(transport.temperature !== undefined || transport.humidity !== undefined) && (
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {transport.temperature !== undefined && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-xs text-gray-600">Temperature</p>
                            <p className="text-sm font-bold text-red-600">{transport.temperature}°C</p>
                          </div>
                        </div>
                      )}
                      {transport.humidity !== undefined && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Humidity</p>
                            <p className="text-sm font-bold text-blue-600">{transport.humidity}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes if available */}
                  {transport.notes && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Notes</p>
                      <p className="text-sm text-gray-800">{transport.notes}</p>
                    </div>
                  )}

                  {/* Farmer Contact Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Farmer Contact</p>
                      <p className="text-sm font-semibold text-gray-800">{transport.farmerId.phone}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Contact Farmer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {transports.length} of {pagination.total} shipments
          </div>
        </>
      )}
    </div>
  );
}
