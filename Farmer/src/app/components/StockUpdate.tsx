import { useState } from 'react';
import { User } from 'lucide-react';
import { AddCrop } from '@/app/components/AddCrop';
import { UpdateCrop } from '@/app/components/UpdateCrop';

export function StockUpdate() {
  const [activeTab, setActiveTab] = useState<'add' | 'update'>('add');

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl text-gray-800">Stock Update</h1>
        <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors">
          <User className="w-5 h-5 text-emerald-700" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'add'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Add Crop
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'update'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Update Crop
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'add' ? <AddCrop /> : <UpdateCrop />}
        </div>
      </main>
    </div>
  );
}
