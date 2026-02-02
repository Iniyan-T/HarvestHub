import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/app/components/Sidebar';
import { Dashboard } from '@/app/components/Dashboard';
import { StockUpdate } from '@/app/components/StockUpdate';
import { StockRequest } from '@/app/components/StockRequest';
import { Transactions } from '@/app/components/Transactions';
import { Storage } from '@/app/components/Storage';
import { AIAssistant } from '@/app/components/AIAssistant';

export default function App() {
  // TODO: Replace with actual user ID from auth context
  const userId = 'farmer_001';

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock-update" element={<StockUpdate />} />
          <Route path="/stock-request" element={<StockRequest />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/ai-assistant" element={
            <div className="flex-1 p-8 h-screen">
              <AIAssistant userId={userId} userType="farmer" />
            </div>
          } />
          <Route path="/price-graph" element={<Dashboard />} />
          <Route path="/messages" element={<Dashboard />} />
          <Route path="/transport" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
