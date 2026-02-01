import { User } from 'lucide-react';
import { CropCard } from '@/app/components/CropCard';

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

        {/* My Crops Section */}
        <section>
          <h3 className="text-lg text-gray-800 mb-6">My Crops</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                name={crop.name}
                image={crop.image}
                status={crop.status}
                quantity={crop.quantity}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
