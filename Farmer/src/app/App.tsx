import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/app/components/Sidebar';
import { Dashboard } from '@/app/components/Dashboard';
import { StockUpdate } from '@/app/components/StockUpdate';
import { StockRequest } from '@/app/components/StockRequest';
import { Transactions } from '@/app/components/Transactions';
import { Storage } from '@/app/components/Storage';

export default function App() {
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
          <Route path="/ai-assistant" element={<Dashboard />} />
          <Route path="/price-graph" element={<Dashboard />} />
          <Route path="/messages" element={<Dashboard />} />
          <Route path="/transport" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
