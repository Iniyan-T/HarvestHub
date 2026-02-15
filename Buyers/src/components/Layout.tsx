import { Outlet, Link, useLocation, useParams, Navigate } from "react-router";
import { Home, Users, ArrowLeftRight, MessageSquare, Bot, Globe, Truck } from "lucide-react";
import { useEffect } from "react";
import { isValidObjectId } from "../utils/validation";

export function Layout() {
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();
  
  // Check if userId from URL is a valid ObjectId
  const isValidUrlUserId = isValidObjectId(userId);
  const storedUserId = localStorage.getItem('userId');
  const isValidStoredUserId = isValidObjectId(storedUserId);

  // Capture auth data from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userName = params.get('userName');
    const userEmail = params.get('userEmail');

    if (token && isValidUrlUserId && userId) {
      // Store auth data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName || '');
      localStorage.setItem('userEmail', userEmail || '');
      
      // Clean up URL - keep the userId path
      window.history.replaceState({}, '', `/${userId}`);
    } else if (isValidUrlUserId && userId && !localStorage.getItem('userId')) {
      // Store userId from URL if not already in localStorage
      localStorage.setItem('userId', userId);
    }
  }, [userId, isValidUrlUserId]);

  // Redirect to root if no valid userId found
  if (!isValidUrlUserId && !isValidStoredUserId) {
    return <Navigate to="/" replace />;
  }

  const currentUserId = isValidUrlUserId ? userId! : storedUserId!;
  const basePath = `/${currentUserId}`;

  const navItems = [
    { path: "", label: "Dashboard", icon: Home },
    { path: "/nearby-farmers", label: "Nearby Farmers", icon: Users },
    { path: "/transaction", label: "Transaction", icon: ArrowLeftRight },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/ai-assistant", label: "AI Assistant", icon: Bot },
    { path: "/market-insights", label: "Market Insights", icon: Globe },
    { path: "/transport", label: "Transport", icon: Truck },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <Link to={basePath} className="p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-colors">
          <h1 className="text-2xl font-bold text-white">Harvest Hub</h1>
          <p className="text-green-50 text-sm mt-1">Buyer Portal</p>
        </Link>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const fullPath = `${basePath}${item.path}`;
            const isActive = location.pathname === fullPath || 
                           (item.path === "" && location.pathname === basePath);
            
            return (
              <Link
                key={item.path}
                to={fullPath}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm border-l-4 border-l-green-600"
                    : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
