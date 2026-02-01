import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface CropCardProps {
  name: string;
  image?: string;
  status?: string;
  quantity?: number;
}

export function CropCard({ name, image, status, quantity }: CropCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-square bg-gradient-to-br from-emerald-50 to-green-100 relative overflow-hidden">
        {image ? (
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">🌾</div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-gray-800 mb-1">{name}</h3>
        {status && (
          <p className="text-sm text-gray-500">{status}</p>
        )}
        {quantity !== undefined && (
          <p className="text-sm text-emerald-600 mt-1">{quantity} kg</p>
        )}
      </div>
    </div>
  );
}
