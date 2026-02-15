import { useParams, useNavigate } from "react-router";
import { ArrowLeft, User, Loader2, Phone, Package, MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getValidatedUserId } from "../utils/validation";

interface CropData {
  _id: string;
  cropName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  aiGrade?: {
    grade: string;
    confidence: number;
  };
  harvestDate?: string;
}

interface FarmerWithCrops {
  farmerId: string;
  farmerName: string;
  location: string;
  contact: string;
  crops: CropData[];
  totalQuantity: number;
  averagePrice: number;
}

interface RequestFormData {
  quantity: string;
  paymentMethod: 'online' | 'offline';
  transportNeeded: boolean;
}

export function CropDetail() {
  const { cropName, userId } = useParams<{ cropName: string; userId: string }>();
  const navigate = useNavigate();
  
  const { userId: currentUserId, basePath } = getValidatedUserId(userId);
  
  const displayName = cropName ? cropName.charAt(0).toUpperCase() + cropName.slice(1) : "";

  const [farmers, setFarmers] = useState<FarmerWithCrops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerWithCrops | null>(null);
  const [requestForm, setRequestForm] = useState<RequestFormData>({
    quantity: '1',
    paymentMethod: 'online',
    transportNeeded: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFarmersByCrop();
  }, [cropName]);

  const fetchFarmersByCrop = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/farmers/by-crop/${cropName}`);
      const data = await response.json();
      
      if (data.success) {
        setFarmers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch farmers');
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = (farmer: FarmerWithCrops) => {
    setSelectedFarmer(farmer);
    setShowModal(true);
    setRequestForm({
      quantity: '1',
      paymentMethod: 'online',
      transportNeeded: false
    });
    setMessage(null);
  };

  const handleSubmitRequest = async () => {
    if (!selectedFarmer || !cropName) return;

    const quantityNum = parseFloat(requestForm.quantity);
    
    if (!quantityNum || quantityNum <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity' });
      return;
    }

    // Use current user ID from URL params
    const buyerId = currentUserId;
    const buyerName = localStorage.getItem('userName') || 'Buyer';
    const buyerContact = localStorage.getItem('userPhone') || '';
    const token = localStorage.getItem('token');
    
    const totalAmount = quantityNum * selectedFarmer.averagePrice;

    try {
      setSubmitting(true);
      setMessage(null);

      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId: selectedFarmer.farmerId,
          buyerId: buyerId,
          buyerName: buyerName,
          buyerContact: buyerContact,
          cropName: displayName,
          requestedQuantity: quantityNum,
          offerPrice: selectedFarmer.averagePrice,
          totalAmount: totalAmount,
          paymentMethod: requestForm.paymentMethod,
          transportNeeded: requestForm.transportNeeded,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Request sent successfully! Redirecting to dashboard...' });
        setTimeout(() => {
          navigate(basePath);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send request' });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFarmer = (farmerId: string) => {
    navigate(`${basePath}/nearby-farmers/${farmerId}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(basePath)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{displayName}</h2>
        <p className="text-gray-600 mt-2">
          {loading ? 'Loading...' : `${farmers.length} farmer(s) available with this crop`}
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading farmers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      ) : (
        <>
          {/* Farmers List - Compact Card Design */}
          <div className="space-y-4 max-w-4xl">
            {farmers.map((farmer, index) => (
              <div
                key={farmer.farmerId}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Index Number */}
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-gray-500" />
                  </div>

                  {/* Farmer Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-800">{farmer.farmerName}</h3>
                      <span className="text-gray-600">Qty: {farmer.totalQuantity.toFixed(0)} kg</span>
                      <span className="text-green-700 font-bold">₹{(farmer.totalQuantity * farmer.averagePrice).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                      <Phone className="w-4 h-4" />
                      <span>{farmer.contact}</span>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${basePath}/messages?farmerId=${farmer.farmerId}&farmerName=${encodeURIComponent(farmer.farmerName)}`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    Chat
                  </button>

                  {/* Proceed Button */}
                  <button
                    onClick={() => handleProceed(farmer)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            ))}
          </div>

          {farmers.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No farmers currently have {displayName} available</p>
              <button
                onClick={() => navigate(basePath)}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Other Crops
              </button>
            </div>
          )}
        </>
      )}

      {/* Request Modal */}
      {showModal && selectedFarmer && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-96 relative border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 pr-8">
                Fill the details to Proceed with the Request
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                To: <span className="font-medium">{selectedFarmer.farmerName}</span>
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-5">

            {/* Success/Error Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={requestForm.quantity}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                    placeholder="Enter quantity in kg"
                  />
              </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={requestForm.paymentMethod === 'online'}
                        onChange={(e) =>
                          setRequestForm({ ...requestForm, paymentMethod: e.target.value as 'online' | 'offline' })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 text-sm">Online</span>
                  </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="offline"
                        checked={requestForm.paymentMethod === 'offline'}
                        onChange={(e) =>
                          setRequestForm({ ...requestForm, paymentMethod: e.target.value as 'online' | 'offline' })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 text-sm">Offline</span>
                  </label>
                </div>
              </div>

                {/* Transport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transport"
                        value="own"
                        checked={!requestForm.transportNeeded}
                        onChange={() =>
                          setRequestForm({ ...requestForm, transportNeeded: false })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 text-sm">Own</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transport"
                        value="need"
                        checked={requestForm.transportNeeded}
                        onChange={() =>
                          setRequestForm({ ...requestForm, transportNeeded: true })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 text-sm">Need Transport</span>
                  </label>
                </div>
              </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-xl font-bold text-green-700">
                      ₹{((parseFloat(requestForm.quantity) || 0) * selectedFarmer.averagePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <button
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {submitting ? 'Sending Request...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
