import { Upload } from 'lucide-react';
import { useState } from 'react';

export function AddCrop() {
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding crop:', formData);
    // Reset form
    setFormData({
      cropType: '',
      quantity: '',
      amount: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Image */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upload Crop Image</p>
          <input type="file" className="hidden" accept="image/*" />
        </div>

        {/* Crop Type */}
        <div>
          <label htmlFor="cropType" className="block text-sm mb-2 text-gray-700">
            Crop Type
          </label>
          <input
            type="text"
            id="cropType"
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter crop type"
          />
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm mb-2 text-gray-700">
            Quantity
          </label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter quantity"
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm mb-2 text-gray-700">
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter amount"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
