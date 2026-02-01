import { Outlet, Link, useLocation } from "react-router";
import { Home, Users, ArrowLeftRight, MessageSquare, Bot, TrendingUp, Truck } from "lucide-react";

export function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/nearby-farmers", label: "Nearby Farmers", icon: Users },
    { path: "/transaction", label: "Transaction", icon: ArrowLeftRight },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/ai-assistant", label: "AI Assistant", icon: Bot },
    { path: "/price-graph", label: "Price Graph", icon: TrendingUp },
    { path: "/transport", label: "Transport", icon: Truck },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-green-700">Harvest Hub</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
