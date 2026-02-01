import { User, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface CropRequest {
  cropName: string;
  quantity: number;
  amount: string;
}

interface Request {
  id: number;
  buyerName: string;
  phoneNumber: string;
  crops: CropRequest[];
  totalAmount: number;
  status?: 'pending' | 'accepted' | 'denied';
}

const mockRequests: Request[] = [
  {
    id: 1,
    buyerName: 'Buyer1',
    phoneNumber: '+91 2345678',
    crops: [
      { cropName: 'Wheat', quantity: 50, amount: '90/kg' },
    ],
    totalAmount: 4500,
  },
  {
    id: 2,
    buyerName: 'Buyer2',
    phoneNumber: '+91 2345678',
    crops: [
      { cropName: 'Paddy', quantity: 50, amount: '140/kg' },
    ],
    totalAmount: 7000,
  },
];

export function StockRequest() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);

  const handleAccept = (id: number) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'accepted' as const } : req
      )
    );
  };

  const handleDeny = (id: number) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'denied' as const } : req
      )
    );
  };

  const handleChat = (buyerName: string) => {
    console.log('Opening chat with', buyerName);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl text-gray-800">Stock Request</h1>
        <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
          <User className="w-5 h-5 text-emerald-700" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="space-y-6 max-w-4xl">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              {/* Header with Buyer Name and Total Amount */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-800">{request.buyerName}</h3>
                <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-emerald-700">
                    Total amount: ₹{request.totalAmount}
                  </span>
                </div>
              </div>

              {/* Crops Table */}
              <div className="mb-4">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-sm text-gray-600">
                        Cropname
                      </th>
                      <th className="text-left py-2 text-sm text-gray-600">
                        Quantity
                      </th>
                      <th className="text-left py-2 text-sm text-gray-600">
                        Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.crops.map((crop, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800">{crop.cropName}</td>
                        <td className="py-3 text-gray-800">{crop.quantity}</td>
                        <td className="py-3 text-gray-800">{crop.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer with Phone, Chat, and Action Buttons */}
              <div className="flex items-center justify-between mt-4">
                {/* Phone Number */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{request.phoneNumber}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Chat Button */}
                  <button
                    onClick={() => handleChat(request.buyerName)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Chat</span>
                  </button>

                  {/* Accept/Deny Buttons */}
                  {request.status === 'accepted' ? (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
                      Accepted
                    </div>
                  ) : request.status === 'denied' ? (
                    <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                      Denied
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeny(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
