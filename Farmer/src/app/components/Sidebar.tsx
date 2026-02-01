import { 
  BarChart3, 
  Package, 
  FileText, 
  Warehouse, 
  Receipt, 
  MessageSquare, 
  Truck, 
  TrendingUp,
  Sparkles,
  Leaf
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: BarChart3, path: '/' },
  { label: 'Stock Update', icon: Package, path: '/stock-update' },
  { label: 'Stock request', icon: FileText, path: '/stock-request' },
  { label: 'Storage', icon: Warehouse, path: '/storage' },
  { label: 'Transactions', icon: Receipt, path: '/transactions' },
  { label: 'AI assistant', icon: Sparkles, path: '/ai-assistant' },
  { label: 'Price graph', icon: TrendingUp, path: '/price-graph' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Transport', icon: Truck, path: '/transport' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Leaf className="w-6 h-6 text-emerald-600" />
        <h1 className="text-xl text-emerald-700">Harvest Hub</h1>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
