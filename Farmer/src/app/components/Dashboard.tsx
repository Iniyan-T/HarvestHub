import { User, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Crop {
  _id: string;
  cropName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  aiGrade: {
    grade: string;
    confidence: number;
    qualityScore: number;
    defects: string[];
    freshness: string;
    analysis: string;
  };
  status: string;
  createdAt: string;
}

const crops = [
  {
    id: 1,
    name: 'Wheat',
    image: 'https://images.unsplash.com/photo-1609129459698-90a2a3e4b146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZhcm0lMjBoYXJ2ZXN0fGVufDF8fHx8MTc2OTc1NDk3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'Ready to harvest',
    quantity: 2500,
  },
  {
    id: 2,
    name: 'Corn',
    image: 'https://images.unsplash.com/photo-1649251037465-72c9d378acb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjBmaWVsZHxlbnwxfHx8fDE3Njk3NDIzNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'Growing',
    quantity: 1800,
  },
  {
    id: 3,
    name: 'Rice',
    image: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3Njk2NjIyNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'Ready to harvest',
    quantity: 3200,
  },
  {
    id: 4,
    name: 'Tomatoes',
    image: 'https://images.unsplash.com/photo-1683008952375-410ae668e6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjBmYXJtJTIwZnJlc2h8ZW58MXx8fHwxNzY5NzYyNzI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'In storage',
    quantity: 450,
  },
  {
    id: 5,
    name: 'Potatoes',
    image: 'https://images.unsplash.com/photo-1764587492501-bf8b61c09792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG8lMjBoYXJ2ZXN0JTIwZmllbGR8ZW58MXx8fHwxNzY5NzYyNzI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'Growing',
    quantity: 1600,
  },
  {
    id: 6,
    name: 'Carrots',
    image: 'https://images.unsplash.com/photo-1717959159782-98c42b1d4f37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb3QlMjB2ZWdldGFibGUlMjBmYXJtfGVufDF8fHx8MTc2OTcwMjMxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'Ready to harvest',
    quantity: 890,
  },
];

export function Dashboard() {
  const [apiCrops, setApiCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Temporary farmer ID - replace with actual auth later
  const farmerId = '507f1f77bcf86cd799439011';

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/crops/farmer/${farmerId}`);
      const data = await response.json();
      
      if (data.success) {
        setApiCrops(data.data);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Available': 'bg-green-100 text-green-800',
      'Sold': 'bg-gray-100 text-gray-800',
      'Reserved': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl text-gray-800">Dashboard</h1>
        <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
          <User className="w-5 h-5 text-emerald-700" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-xl text-gray-700">Hi, Farmer!</h2>
        </div>

        {/* Stats */}
        {!loading && apiCrops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-800">{apiCrops.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {apiCrops.filter(c => c.status === 'Available').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Grade A</p>
              <p className="text-2xl font-bold text-emerald-600">
                {apiCrops.filter(c => c.aiGrade.grade === 'A').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{apiCrops.reduce((sum, c) => sum + (c.quantity * c.price), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* My Crops Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-gray-800 font-semibold">My Crops</h3>
            <button
              onClick={() => navigate('/stock-update')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Crop
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading crops...</p>
            </div>
          ) : apiCrops.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg mb-4">No crops added yet</p>
              <button
                onClick={() => navigate('/stock-update')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Your First Crop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiCrops.map((crop) => (
                <div
                  key={crop._id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 relative overflow-hidden">
                    <img
                      src={`http://localhost:5000${crop.imageUrl}`}
                      alt={crop.cropName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                    
                    {/* Grade Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full font-bold text-sm border-2 ${getGradeColor(crop.aiGrade.grade)}`}>
                        Grade {crop.aiGrade.grade}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(crop.status)}`}>
                        {crop.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{crop.cropName}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold text-gray-800">{crop.quantity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-emerald-600">₹{crop.price}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quality Score:</span>
                        <span className="font-semibold text-blue-600">{crop.aiGrade.qualityScore}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Freshness:</span>
                        <span className="font-semibold text-green-600">{crop.aiGrade.freshness}</span>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {crop.aiGrade.analysis && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-1">🤖 AI Assessment:</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{crop.aiGrade.analysis}</p>
                      </div>
                    )}

                    {/* Defects */}
                    {crop.aiGrade.defects.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Defects:</p>
                        <div className="flex flex-wrap gap-1">
                          {crop.aiGrade.defects.slice(0, 2).map((defect, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs"
                            >
                              {defect}
                            </span>
                          ))}
                          {crop.aiGrade.defects.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{crop.aiGrade.defects.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-500">
                      Added: {new Date(crop.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
