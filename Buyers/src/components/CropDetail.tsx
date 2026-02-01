import { useParams, useNavigate } from "react-router";
import { ArrowLeft, User } from "lucide-react";

// Mock farmer data for each crop
const farmersByCrop: Record<string, Array<{ id: number; name: string; price: string; avatar?: string }>> = {
  wheat: [
    { id: 1, name: "RAM", price: "₹2,500/quintal" },
    { id: 2, name: "HARI", price: "₹2,400/quintal" },
    { id: 3, name: "SURI", price: "₹2,550/quintal" },
  ],
  paddy: [
    { id: 1, name: "KUMAR", price: "₹1,800/quintal" },
    { id: 2, name: "RAVI", price: "₹1,750/quintal" },
    { id: 3, name: "ANIL", price: "₹1,850/quintal" },
  ],
  rice: [
    { id: 1, name: "SURESH", price: "₹3,200/quintal" },
    { id: 2, name: "DINESH", price: "₹3,150/quintal" },
    { id: 3, name: "MAHESH", price: "₹3,250/quintal" },
  ],
  carrot: [
    { id: 1, name: "PRAKASH", price: "₹1,200/quintal" },
    { id: 2, name: "VIJAY", price: "₹1,150/quintal" },
    { id: 3, name: "AJAY", price: "₹1,250/quintal" },
  ],
  potato: [
    { id: 1, name: "RAMESH", price: "₹800/quintal" },
    { id: 2, name: "GANESH", price: "₹750/quintal" },
    { id: 3, name: "RAJESH", price: "₹820/quintal" },
  ],
  onion: [
    { id: 1, name: "MOHAN", price: "₹1,500/quintal" },
    { id: 2, name: "SOHAN", price: "₹1,450/quintal" },
    { id: 3, name: "ROHAN", price: "₹1,550/quintal" },
  ],
};

export function CropDetail() {
  const { cropName } = useParams<{ cropName: string }>();
  const navigate = useNavigate();
  
  const farmers = farmersByCrop[cropName?.toLowerCase() || ""] || [];
  const displayName = cropName?.toUpperCase() || "";

  const handleSendRequest = (farmerName: string) => {
    alert(`Request sent to ${farmerName} for ${displayName}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        <h2 className="text-3xl font-medium text-gray-800">{displayName}</h2>
      </div>

      {/* Farmers List */}
      <div className="max-w-3xl space-y-4">
        {farmers.map((farmer) => (
          <div
            key={farmer.id}
            className="bg-white border border-gray-300 rounded-lg p-6 flex items-center gap-6 hover:shadow-md transition-shadow"
          >
            {/* Avatar */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>

            {/* Farmer Name */}
            <div className="flex-1">
              <h3 className="text-xl font-medium text-gray-800">{farmer.name}</h3>
            </div>

            {/* Price */}
            <div className="text-lg text-gray-700 font-medium min-w-[140px]">
              {farmer.price}
            </div>

            {/* Send Request Button */}
            <button
              onClick={() => handleSendRequest(farmer.name)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              SEND REQ
            </button>
          </div>
        ))}
      </div>

      {farmers.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No farmers available for this crop.</p>
      )}
    </div>
  );
}
