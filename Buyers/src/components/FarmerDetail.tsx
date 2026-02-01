import { useParams, useNavigate } from "react-router";
import { ArrowLeft, User } from "lucide-react";
import { useState } from "react";

// Mock farmer and crop data
const farmerData: Record<string, any> = {
  "1": {
    name: "Ramesh Kumar",
    location: "Village A, 5 km away",
    crops: [
      { id: 1, name: "Wheat", availability: "500 quintals", grade: "Grade A", price: "₹2,500/quintal" },
      { id: 2, name: "Rice", availability: "300 quintals", grade: "Grade A", price: "₹3,200/quintal" },
      { id: 3, name: "Potato", availability: "200 quintals", grade: "Grade B", price: "₹800/quintal" },
    ],
  },
  "2": {
    name: "Suresh Patel",
    location: "Village B, 8 km away",
    crops: [
      { id: 1, name: "Paddy", availability: "400 quintals", grade: "Grade A", price: "₹1,800/quintal" },
      { id: 2, name: "Onion", availability: "150 quintals", grade: "Grade B", price: "₹1,500/quintal" },
    ],
  },
  "3": {
    name: "Dinesh Singh",
    location: "Village C, 12 km away",
    crops: [
      { id: 1, name: "Carrot", availability: "100 quintals", grade: "Grade A", price: "₹1,200/quintal" },
      { id: 2, name: "Wheat", availability: "350 quintals", grade: "Grade B", price: "₹2,400/quintal" },
      { id: 3, name: "Rice", availability: "250 quintals", grade: "Grade A", price: "₹3,150/quintal" },
    ],
  },
  "4": {
    name: "Mahesh Yadav",
    location: "Village D, 15 km away",
    crops: [
      { id: 1, name: "Potato", availability: "600 quintals", grade: "Grade A", price: "₹820/quintal" },
      { id: 2, name: "Onion", availability: "200 quintals", grade: "Grade A", price: "₹1,550/quintal" },
    ],
  },
  "5": {
    name: "Rajesh Sharma",
    location: "Village E, 18 km away",
    crops: [
      { id: 1, name: "Paddy", availability: "450 quintals", grade: "Grade B", price: "₹1,750/quintal" },
      { id: 2, name: "Wheat", availability: "380 quintals", grade: "Grade A", price: "₹2,550/quintal" },
    ],
  },
  "6": {
    name: "Ganesh Verma",
    location: "Village F, 20 km away",
    crops: [
      { id: 1, name: "Carrot", availability: "120 quintals", grade: "Grade B", price: "₹1,150/quintal" },
      { id: 2, name: "Rice", availability: "280 quintals", grade: "Grade A", price: "₹3,250/quintal" },
      { id: 3, name: "Potato", availability: "180 quintals", grade: "Grade B", price: "₹750/quintal" },
    ],
  },
};

export function FarmerDetail() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);

  const farmer = farmerData[farmerId || ""];

  if (!farmer) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Farmer not found.</p>
      </div>
    );
  }

  const handleSendRequest = (cropName: string) => {
    alert(`Request sent to ${farmer.name} for ${cropName}`);
    setSelectedCrop(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/nearby-farmers")}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>

        {/* Farmer Info Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 flex items-center gap-6 max-w-2xl">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-gray-800">{farmer.name}</h2>
            <p className="text-gray-600 mt-1">{farmer.location}</p>
          </div>
        </div>
      </div>

      {/* Crops List */}
      <div className="max-w-3xl">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Available Crops</h3>
        <div className="space-y-4">
          {farmer.crops.map((crop: any) => (
            <div
              key={crop.id}
              className="bg-white border border-gray-300 rounded-lg p-6"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 min-w-[120px]">Crop Name:</span>
                      <span className="font-medium text-gray-800">{crop.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 min-w-[120px]">Availability:</span>
                      <span className="text-gray-800">{crop.availability}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 min-w-[120px]">Grade:</span>
                      <span className="text-gray-800">{crop.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 min-w-[120px]">Price:</span>
                      <span className="font-medium text-gray-800">{crop.price}</span>
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendRequest(crop.name)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
