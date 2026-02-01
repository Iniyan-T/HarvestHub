import { Link } from "react-router";

export function Dashboard() {
  const crops = [
    { id: 1, name: "Paddy", color: "bg-yellow-100" },
    { id: 2, name: "Wheat", color: "bg-amber-100" },
    { id: 3, name: "Rice", color: "bg-yellow-50" },
    { id: 4, name: "Carrot", color: "bg-orange-100" },
    { id: 5, name: "Potato", color: "bg-amber-50" },
    { id: 6, name: "Onion", color: "bg-purple-50" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-800 mb-2">Hi Sellers!</h2>
        <p className="text-xl text-gray-600">CROPS:</p>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <Link
            key={crop.id}
            to={`/crop/${crop.name.toLowerCase()}`}
            className={`${crop.color} border border-gray-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer`}
          >
            <span className="text-xl text-gray-700">{crop.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}