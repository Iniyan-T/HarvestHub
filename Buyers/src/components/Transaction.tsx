import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";
import { getValidatedUserId } from "../utils/validation";

interface TransactionData {
  _id: string;
  transactionId?: string;
  orderId?: {
    orderNumber: string;
    totalAmount: number;
  };
  buyerId: {
    _id: string;
    name: string;
    email: string;
  };
  farmerId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  status: string;
  description: string;
  cropName?: string;
  quantity?: number;
  transportNeeded?: boolean;
  createdAt: string;
}

export function Transaction() {
  const { userId } = useParams<{ userId: string }>();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);

  const { userId: currentUserId } = getValidatedUserId(userId);

  useEffect(() => {
    if (currentUserId) {
      fetchTransactions();
    }
  }, [currentUserId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/transactions/user/${currentUserId}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Group transactions by month
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt);
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, TransactionData[]>);

  // Filter transactions based on search query
  const filteredGroupedTransactions = Object.entries(groupedTransactions).reduce((acc, [month, txns]) => {
    const filtered = txns.filter(
      (t) =>
        t._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.farmerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[month] = filtered;
    }
    return acc;
  }, {} as Record<string, TransactionData[]>);

  const calculateMonthTotal = (txns: TransactionData[]) => {
    return txns.reduce((sum, t) => sum + t.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Transactions</h2>

        {/* Search and Filter */}
        <div className="flex gap-4 max-w-2xl">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-5 py-3 pr-12 border-2 border-gray-300 rounded-xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer font-medium transition-all"
            >
              <option value="all">Date</option>
              <option value="january">January 2026</option>
              <option value="december">December 2025</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {Object.entries(filteredGroupedTransactions).map(([month, transactions]) => (
          <div key={month} className="bg-white rounded-2xl shadow-lg p-6">
            {/* Month Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-gradient-to-r from-green-500 to-green-600">
              <h3 className="text-xl font-bold text-gray-800">{month}</h3>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                ₹ {calculateMonthTotal(transactions).toLocaleString()}
              </span>
            </div>

            {/* Transaction Cards */}
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-semibold text-gray-800">
                        {transaction.transactionId || transaction._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-600">Farmer Name:</span>
                      <span className="text-gray-800 font-medium">{transaction.farmerId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-xl font-semibold text-green-600">₹{transaction.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(filteredGroupedTransactions).length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-gray-600 font-medium">No transactions found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500 to-green-600">
              <h3 className="text-2xl font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Buyer:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedTransaction.buyerId?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Farmer:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedTransaction.farmerId?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Transaction ID:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {selectedTransaction.transactionId || selectedTransaction._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <p className="text-lg font-bold text-green-600 mt-1">₹{selectedTransaction.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Crop:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedTransaction.cropName || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedTransaction.quantity || 0} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <p className={`text-lg font-semibold mt-1 ${
                    selectedTransaction.status === 'completed' ? 'text-green-600' : 
                    selectedTransaction.status === 'pending' ? 'text-yellow-600' : 
                    'text-gray-800'
                  }`}>{selectedTransaction.status}</p>
                </div>
              </div>

              {/* Description */}
              {selectedTransaction.description && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700">{selectedTransaction.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t-2 border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
