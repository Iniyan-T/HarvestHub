import { Globe, ExternalLink, TrendingUp, Info } from "lucide-react";

export function MarketInsights() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Market Insights</h1>
          <p className="text-gray-600 mt-1">Real-time international wheat prices from TradingEconomics</p>
        </div>
        <a
          href="https://tradingeconomics.com/commodity/wheat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Full Page
        </a>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Why Global Prices Matter</h3>
          <p className="text-sm text-blue-800 mt-1">
            International commodity prices influence local market rates. Understanding global wheat trends helps you make informed purchasing decisions and negotiate better deals with farmers.
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Source</p>
              <p className="text-lg font-semibold text-gray-900">TradingEconomics</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Coverage</p>
              <p className="text-lg font-semibold text-gray-900">Global</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ExternalLink className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Update Frequency</p>
              <p className="text-lg font-semibold text-gray-900">Real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Embed */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Live Wheat Prices</h2>
          <p className="text-sm text-gray-600 mt-1">Interactive charts and market analysis</p>
        </div>
        <div className="relative">
          <iframe
            src="https://tradingeconomics.com/commodity/wheat"
            width="100%"
            height="800"
            style={{ border: "none" }}
            title="TradingEconomics Wheat Prices"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Understanding Prices */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Wheat Prices</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>USD/Bushel:</strong> International standard unit. 1 bushel ≈ 27.2 kg (60 pounds)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Conversion:</strong> Divide USD/bushel by 27.2 to get approximate USD/kg rate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Local Impact:</strong> Global prices affect domestic rates with 2-4 week lag time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Seasonal Trends:</strong> Prices typically drop during harvest season (April-June in India)</span>
            </li>
          </ul>
        </div>

        {/* Strategic Tips */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Buying Tips</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Monitor Trends:</strong> Watch for sustained price drops - best time to purchase in bulk</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Compare Local:</strong> If global prices spike, negotiate with farmers before they adjust rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Contracts:</strong> Consider locking in prices during low cycles for future delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Quality Premium:</strong> High-quality wheat trades 10-15% above commodity benchmark</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
