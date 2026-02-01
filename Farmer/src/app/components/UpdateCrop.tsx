import { Edit2, X } from 'lucide-react';
import { useState } from 'react';

interface Crop {
  id: number;
  name: string;
  unit: number;
  grade: string;
  price: number;
}

const mockCrops: Crop[] = [
  { id: 1, name: 'Wheat', unit: 600, grade: 'A', price: 100 },
  { id: 2, name: 'Rice', unit: 500, grade: 'B', price: 150 },
];

export function UpdateCrop() {
  const [crops, setCrops] = useState<Crop[]>(mockCrops);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    grade: '',
    price: '',
  });

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      unit: crop.unit.toString(),
      grade: crop.grade,
      price: crop.price.toString(),
    });
  };

  const handleDelete = (id: number) => {
    setCrops(crops.filter((crop) => crop.id !== id));
    if (editingCrop?.id === id) {
      setEditingCrop(null);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrop) {
      setCrops(
        crops.map((crop) =>
          crop.id === editingCrop.id
            ? {
                ...crop,
                name: formData.name,
                unit: parseInt(formData.unit),
                grade: formData.grade,
                price: parseInt(formData.price),
              }
            : crop
        )
      );
      setEditingCrop(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseModal = () => {
    setEditingCrop(null);
  };

  return (
    <div className="space-y-6">
      {/* Crops Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm text-gray-700">S.No</th>
              <th className="px-6 py-3 text-left text-sm text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm text-gray-700">Unit</th>
              <th className="px-6 py-3 text-left text-sm text-gray-700">Grade</th>
              <th className="px-6 py-3 text-left text-sm text-gray-700">Price</th>
              <th className="px-6 py-3 text-left text-sm text-gray-700">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {crops.map((crop, index) => (
              <tr key={crop.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{crop.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{crop.unit}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{crop.grade}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{crop.price}kg</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(crop)}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg mb-4 text-gray-800">Edit Crop</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm mb-2 text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label htmlFor="grade" className="block text-sm mb-2 text-gray-700">
                    Grade
                  </label>
                  <input
                    type="text"
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label htmlFor="unit" className="block text-sm mb-2 text-gray-700">
                    Unit
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm mb-2 text-gray-700">
                    Price
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => handleDelete(editingCrop.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
