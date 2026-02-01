import { Link } from "react-router";
import { User } from "lucide-react";

// Mock farmer data
const farmers = [
  { id: 1, name: "Ramesh Kumar", location: "Village A, 5 km away" },
  { id: 2, name: "Suresh Patel", location: "Village B, 8 km away" },
  { id: 3, name: "Dinesh Singh", location: "Village C, 12 km away" },
  { id: 4, name: "Mahesh Yadav", location: "Village D, 15 km away" },
  { id: 5, name: "Rajesh Sharma", location: "Village E, 18 km away" },
  { id: 6, name: "Ganesh Verma", location: "Village F, 20 km away" },
];

export function NearbyFarmers() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-800">Nearby Farmers</h2>
        <p className="text-gray-600 mt-2">Select a farmer to view their available crops</p>
      </div>

      {/* Farmers List */}
      <div className="max-w-2xl space-y-4">
        {farmers.map((farmer) => (
          <Link
            key={farmer.id}
            to={`/nearby-farmers/${farmer.id}`}
            className="bg-white border border-gray-300 rounded-lg p-6 flex items-center gap-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>

            {/* Farmer Info */}
            <div className="flex-1">
              <h3 className="text-xl font-medium text-gray-800">{farmer.name}</h3>
              <p className="text-gray-600 mt-1">{farmer.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
