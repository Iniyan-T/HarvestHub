import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { getValidatedUserId } from '../../utils/validation';

interface TransactionData {
  _id: string;
  transactionId: string;
  requestId?: string;
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

export function Transactions() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const { userId: farmerId } = getValidatedUserId(urlUserId);

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);

  useEffect(() => {
    if (farmerId) {
      fetchTransactions();
    }
  }, [farmerId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/transactions/user/${farmerId}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Group transactions by month
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
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
        t.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.buyerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Transactions</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <div className="inline-block relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none px-6 py-2 pr-10 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Date</option>
              {Object.keys(groupedTransactions).map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {/* Transactions List */}
        <div className="space-y-6">
          {Object.entries(
            selectedDate === 'all'
              ? filteredGroupedTransactions
              : Object.fromEntries(
                  Object.entries(filteredGroupedTransactions).filter(([month]) => month === selectedDate)
                )
          ).map(([month, txns]) => (
            <div key={month}>
              {/* Month Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
                <h3 className="text-lg font-medium text-gray-700">{month}</h3>
                <span className="text-xl font-semibold text-emerald-600">
                  ₹{calculateMonthTotal(txns).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Transaction Cards */}
              <div className="space-y-4">
                {txns.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="text-gray-900 font-medium">
                          {transaction.transactionId || transaction._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-600">Buyer Name:</span>
                        <span className="text-gray-900 font-medium">{transaction.buyerId?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Amount:</span>
                        <span className="text-xl font-semibold text-emerald-600">
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(filteredGroupedTransactions).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No transactions found</p>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-emerald-600 p-6 flex justify-between items-center rounded-t-xl">
                <h2 className="text-2xl font-semibold text-white">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Buyer</p>
                    <p className="text-lg font-semibold text-emerald-600">{selectedTransaction.buyerId?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Farmer</p>
                    <p className="text-lg font-semibold text-emerald-600">{selectedTransaction.farmerId?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-lg font-medium text-gray-800">
                      {selectedTransaction.transactionId || selectedTransaction._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-emerald-600">₹{selectedTransaction.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Crop</p>
                    <p className="text-lg font-medium text-gray-800">{selectedTransaction.cropName || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="text-lg font-medium text-gray-800">{selectedTransaction.quantity || 0} kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                    <p className="text-lg font-medium text-gray-800 capitalize">{selectedTransaction.paymentMethod || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className={`text-lg font-semibold ${
                      selectedTransaction.status === 'completed' ? 'text-emerald-600' :
                      selectedTransaction.status === 'pending' ? 'text-yellow-600' :
                      'text-gray-800'
                    }`}>{selectedTransaction.status}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedTransaction.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedTransaction.description}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
