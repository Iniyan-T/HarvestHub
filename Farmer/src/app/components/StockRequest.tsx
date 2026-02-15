import { User, Phone, MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getValidatedUserId } from '../../utils/validation';

interface IRequest {
  _id: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  cropName: string;
  requestedQuantity: number;
  offerPrice: number;
  totalAmount: number;
  paymentMethod?: 'online' | 'offline';
  transportNeeded?: boolean;
  notes: string;
  status: 'pending' | 'accepted' | 'denied' | 'completed';
  createdAt: string;
}

export function StockRequest() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const { userId: farmerId, basePath } = getValidatedUserId(urlUserId);
  
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/requests/farmer/${farmerId}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: 'accepted' | 'denied' | 'completed') => {
    try {
      setUpdating(requestId);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setRequests(
          requests.map((req) =>
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
        // Close popup after accepting
        if (newStatus === 'accepted') {
          setSelectedRequest(null);
        }
      } else {
        setError(data.message || 'Failed to update request');
      }
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request status');
    } finally {
      setUpdating(null);
    }
  };

  const handleChat = (buyerId: string, buyerName: string) => {
    if (!buyerId) {
      console.error('Buyer ID is missing');
      return;
    }
    navigate(`${basePath}/messages?userId=${buyerId}&userName=${encodeURIComponent(buyerName)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl text-gray-800">Stock Request</h1>
        <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
          <User className="w-5 h-5 text-emerald-700" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>

                  {/* Buyer Info & Crop Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">{request.buyerName}</h3>
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        request.status === 'denied' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-700 font-medium">{request.cropName}</span>
                      <span className="text-gray-600">Qty: {request.requestedQuantity} kg</span>
                      <span className="text-green-700 font-semibold">₹{request.totalAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                      <Phone className="w-4 h-4" />
                      <span>{request.buyerContact}</span>
                    </div>
                  </div>

                  {/* Chat Icon */}
                  <button
                    onClick={() => handleChat(request.buyerId || '', request.buyerName)}
                    className="px-3 py-2 flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    Chat
                  </button>

                  {/* Proceed/View Details Button */}
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    {request.status === 'pending' ? 'Proceed' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Details Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-0 max-w-md w-full relative shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <h2 className="text-lg font-semibold pr-8">Fill the details to Proceed with the Request</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Buyer Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedRequest.buyerName}</h3>
                  <p className="text-sm text-gray-600">{selectedRequest.buyerContact}</p>
                </div>
              </div>

              {/* Request Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Crop */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Crop</p>
                  <p className="text-base font-medium text-gray-800">{selectedRequest.cropName}</p>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quantity</p>
                  <p className="text-base font-medium text-gray-800">{selectedRequest.requestedQuantity} kg</p>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment method</p>
                  <p className="text-base font-medium text-gray-800 capitalize">
                    <span className={`inline-flex items-center gap-1 ${selectedRequest.paymentMethod === 'online' ? 'text-blue-600' : 'text-gray-800'}`}>
                      {selectedRequest.paymentMethod === 'online' ? '● Online' : '○ Offline'}
                    </span>
                  </p>
                </div>

                {/* Transport */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transport</p>
                  <p className="text-base font-medium text-gray-800">
                    <span className={`inline-flex items-center gap-1 ${selectedRequest.transportNeeded ? 'text-orange-600' : 'text-green-600'}`}>
                      {selectedRequest.transportNeeded ? '● Need Transport' : '● Own'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-700">₹{selectedRequest.totalAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              {selectedRequest.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedRequest._id, 'denied')}
                    disabled={updating === selectedRequest._id}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRequest._id, 'accepted')}
                    disabled={updating === selectedRequest._id}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating === selectedRequest._id ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              ) : (
                <div className={`w-full px-6 py-3 rounded-lg text-center font-medium ${
                  selectedRequest.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  selectedRequest.status === 'denied' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedRequest.status === 'accepted' ? '✓ Request Accepted' : 
                   selectedRequest.status === 'denied' ? '✗ Request Denied' : 
                   '✓ Completed'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
