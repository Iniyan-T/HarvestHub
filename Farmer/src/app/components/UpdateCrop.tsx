import { Edit2, X, AlertCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Crop {
  _id: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  status: string;
  aiGrade: {
    grade: string;
    confidence: number;
    qualityScore: number;
    defects: string[];
    freshness: string;
    analysis: string;
  };
  createdAt: string;
}

export function UpdateCrop() {
  const { userId } = useParams<{ userId: string }>();
  
  // Validate userId - must be 24 hex characters (MongoDB ObjectId)
  const isValidObjectId = (id: string | null | undefined): boolean => {
    return !!id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  const urlUserId = isValidObjectId(userId) ? userId : null;
  const storedUserId = localStorage.getItem('userId');
  const farmerId = urlUserId || (isValidObjectId(storedUserId) ? storedUserId : '') || '';

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    status: '',
  });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (farmerId) {
      fetchCrops();
    }
  }, [farmerId]);

  const fetchCrops = async () => {
    if (!farmerId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/crops/farmer/${farmerId}`);
      const data = await response.json();
      
      if (data.success) {
        setCrops(data.data);
      } else {
        setError('Failed to load crops');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      cropName: crop.cropName,
      quantity: crop.quantity.toString(),
      price: crop.price.toString(),
      status: crop.status,
    });
  };

  const handleDelete = async (cropId: string) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:5000/api/crops/${cropId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCrops(crops.filter((crop) => crop._id !== cropId));
        if (editingCrop?._id === cropId) {
          setEditingCrop(null);
        }
        alert('Crop deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete crop');
      }
    } catch (err) {
      alert('Error deleting crop');
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:5000/api/crops/${editingCrop._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropName: formData.cropName,
          quantity: parseInt(formData.quantity),
          price: parseInt(formData.price),
          status: formData.status,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCrops(crops.map((crop) =>
          crop._id === editingCrop._id ? data.data : crop
        ));
        setEditingCrop(null);
        alert('Crop updated successfully!');
      } else {
        alert(data.message || 'Failed to update crop');
      }
    } catch (err) {
      alert('Error updating crop');
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseModal = () => {
    setEditingCrop(null);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Sold Out':
        return 'bg-red-100 text-red-800';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading crops...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No crops to update</p>
          <p className="text-gray-500 text-sm mt-2">Add crops first to update them</p>
        </div>
      ) : (
        <>
          {/* Crops Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">AI Grade</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quality</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Freshness</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {crops.map((crop, index) => (
                    <tr key={crop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <img
                          src={`http://localhost:5000${crop.imageUrl}`}
                          alt={crop.cropName}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{crop.cropName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{crop.quantity} kg</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{crop.price}/kg</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getGradeColor(crop.aiGrade.grade)}`}>
                          {crop.aiGrade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{crop.aiGrade.qualityScore}/100</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{crop.aiGrade.freshness}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(crop.status)}`}>
                          {crop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(crop)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="Edit Crop"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-6 text-gray-800">Edit Crop Details</h3>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="flex gap-6 items-start">
                <img
                  src={`http://localhost:5000${editingCrop.imageUrl}`}
                  alt={editingCrop.cropName}
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200?text=No+Image';
                  }}
                />
                
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">AI Quality Assessment (Non-Editable)</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Grade</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(editingCrop.aiGrade.grade)}`}>
                        Grade {editingCrop.aiGrade.grade}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Quality Score</p>
                      <p className="text-xl font-bold text-blue-900">{editingCrop.aiGrade.qualityScore}/100</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Confidence</p>
                      <p className="text-xl font-bold text-blue-900">{editingCrop.aiGrade.confidence}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Freshness</p>
                      <p className="text-xl font-bold text-blue-900">{editingCrop.aiGrade.freshness}</p>
                    </div>
                  </div>

                  {editingCrop.aiGrade.analysis && (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-600 mb-1">🤖 AI Analysis</p>
                      <p className="text-sm text-gray-700">{editingCrop.aiGrade.analysis}</p>
                    </div>
                  )}
                  
                  {editingCrop.aiGrade.defects.length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-2">Detected Defects</p>
                      <div className="flex flex-wrap gap-2">
                        {editingCrop.aiGrade.defects.map((defect, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {defect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4">Editable Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cropName" className="block text-sm font-medium mb-2 text-gray-700">
                      Crop Name
                    </label>
                    <input
                      type="text"
                      id="cropName"
                      name="cropName"
                      value={formData.cropName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-2 text-gray-700">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-700">
                      Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2 text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Added on: <span className="font-semibold text-gray-800">{new Date(editingCrop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => handleDelete(editingCrop._id)}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Crop'}
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
