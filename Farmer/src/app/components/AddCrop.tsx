import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AIGrade {
  grade: string;
  confidence: number;
  qualityScore: number;
  defects: string[];
  freshness: string;
  analysis: string;
}

export function AddCrop() {
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    price: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiGrade, setAiGrade] = useState<AIGrade | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAiGrade(null);
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!image) {
      setError('Please upload a crop image');
      return;
    }

    if (!formData.cropType || !formData.quantity || !formData.price) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', image);
      formDataToSend.append('cropType', formData.cropType);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('price', formData.price);

      const response = await fetch('http://localhost:5000/api/crops/analyze', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setAiGrade(data.data.aiGrade);
        setSuccess(true);
        console.log('Crop data:', data.data);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({ cropType: '', quantity: '', price: '' });
          setImage(null);
          setImagePreview('');
          setAiGrade(null);
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.message || 'Failed to analyze crop');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server. Please make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'text-green-600 bg-green-50 border-green-200',
      'B': 'text-blue-600 bg-blue-50 border-blue-200',
      'C': 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getFreshnessColor = (freshness: string) => {
    const colors: Record<string, string> = {
      'Excellent': 'text-green-600',
      'Good': 'text-blue-600',
      'Fair': 'text-yellow-600',
      'Poor': 'text-red-600',
    };
    return colors[freshness] || 'text-gray-600';
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Image */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Upload Crop Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer relative overflow-hidden">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview('');
                    setAiGrade(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Crop Type */}
        <div>
          <label htmlFor="cropType" className="block text-sm font-medium mb-2 text-gray-700">
            Crop Type *
          </label>
          <input
            type="text"
            id="cropType"
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g., Wheat, Rice, Tomato"
          />
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-2 text-gray-700">
            Quantity (kg) *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g., 500"
            min="0"
            step="0.01"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-700">
            Price per kg (₹) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g., 2500"
            min="0"
            step="0.01"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Crop analyzed and saved successfully!</span>
          </div>
        )}

        {/* AI Grade Display */}
        {aiGrade && (
          <div className="bg-white border-2 border-emerald-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              🤖 AI Quality Assessment
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Grade</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-bold text-2xl border-2 ${getGradeColor(aiGrade.grade)}`}>
                  {aiGrade.grade}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${aiGrade.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{aiGrade.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quality Score</p>
                <p className="text-2xl font-bold text-emerald-600">{aiGrade.qualityScore}/100</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Freshness</p>
                <p className={`text-lg font-semibold ${getFreshnessColor(aiGrade.freshness)}`}>
                  {aiGrade.freshness}
                </p>
              </div>
            </div>

            {aiGrade.defects.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Defects Detected:</p>
                <div className="flex flex-wrap gap-2">
                  {aiGrade.defects.map((defect, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                    >
                      {defect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Analysis:</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                {aiGrade.analysis}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <span>Analyze & Add Crop</span>
          )}
        </button>
      </form>
    </div>
  );
}
