import { BrowserRouter, Routes, Route, useParams, Navigate, Outlet } from 'react-router-dom';
import { useEffect, createContext, useContext } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { Dashboard } from '@/app/components/Dashboard';
import { StockUpdate } from '@/app/components/StockUpdate';
import { StockRequest } from '@/app/components/StockRequest';
import { Transactions } from '@/app/components/Transactions';
import { Storage } from '@/app/components/Storage';
import { AIAssistant } from '@/app/components/AIAssistant';
import { Messages } from '@/app/components/Messages';
import { MarketInsights } from '@/app/components/MarketInsights';

// Create a context for userId
export const UserContext = createContext<string>('');

// Hook to get userId from context
export function useUserId() {
  return useContext(UserContext);
}

// UserLayout component that handles user-specific routes
function UserLayout() {
  const { userId } = useParams<{ userId: string }>();
  
  // Validate that userId is a valid MongoDB ObjectId (24 hex characters)
  const isValidObjectId = (id: string | null | undefined): boolean => {
    return !!id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  const validUrlUserId = isValidObjectId(userId) ? userId : null;
  const storedUserId = localStorage.getItem('userId');
  const validStoredUserId = isValidObjectId(storedUserId) ? storedUserId : null;

  // Capture auth data from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userName = params.get('userName');
    const userEmail = params.get('userEmail');

    if (token && validUrlUserId) {
      // Store auth data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', validUrlUserId);
      localStorage.setItem('userName', userName || '');
      localStorage.setItem('userEmail', userEmail || '');
      
      // Clean up URL - keep the userId path
      window.history.replaceState({}, '', `/${validUrlUserId}`);
    } else if (validUrlUserId && !validStoredUserId) {
      // Store userId from URL if not already in localStorage
      localStorage.setItem('userId', validUrlUserId);
    }
  }, [userId, validUrlUserId, validStoredUserId]);

  // Use valid userId from URL or localStorage
  const currentUserId = validUrlUserId || validStoredUserId || '';

  // If no valid userId, redirect to root
  if (!currentUserId) {
    return <Navigate to="/" replace />;
  }

  return (
    <UserContext.Provider value={currentUserId}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userId={currentUserId} />
        <Outlet />
      </div>
    </UserContext.Provider>
  );
}

// Root redirect component
function RootRedirect() {
  const storedUserId = localStorage.getItem('userId');
  // Validate that userId is a valid MongoDB ObjectId (24 hex characters)
  const isValidObjectId = (id: string | null | undefined): boolean => {
    return !!id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  const validUserId = isValidObjectId(storedUserId) ? storedUserId : null;
  
  if (validUserId) {
    return <Navigate to={`/${validUserId}`} replace />;
  }
  
  // No valid userId - show login prompt
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to HarvestHub</h1>
        <p className="text-gray-600 mb-6">Please login from the main portal to access your farmer dashboard.</p>
        <a 
          href="http://localhost:3000/login" 
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Go to Login →
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:userId" element={<UserLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stock-update" element={<StockUpdate />} />
          <Route path="stock-request" element={<StockRequest />} />
          <Route path="storage" element={<Storage />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="ai-assistant" element={
            <div className="flex-1 p-8 h-screen">
              <AIAssistant userId={localStorage.getItem('userId') || ''} userType="farmer" />
            </div>
          } />
          <Route path="price-graph" element={<MarketInsights />} />
          <Route path="messages" element={<Messages />} />
          <Route path="transport" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
