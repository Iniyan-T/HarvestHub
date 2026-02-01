import { useState } from 'react';
import { Search, User, ChevronDown, X } from 'lucide-react';

interface Product {
  name: string;
  quantity: number;
  grade: string;
  price: number;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  transactionId: string;
  buyerName: string;
  sender: string;
  receiver: string;
  products: Product[];
}

const transactionsData: Transaction[] = [
  {
    id: '1',
    date: 'January 2086',
    amount: 25000,
    transactionId: 'TXN2086001',
    buyerName: 'Rajesh Kumar',
    sender: 'Farm Co-op',
    receiver: 'Rajesh Kumar',
    products: [
      { name: 'Wheat', quantity: 500, grade: 'A', price: 30 },
      { name: 'Rice', quantity: 250, grade: 'A+', price: 40 }
    ]
  },
  {
    id: '2',
    date: 'December 2025',
    amount: 20000,
    transactionId: 'TXN2025123',
    buyerName: 'Priya Sharma',
    sender: 'Green Harvest',
    receiver: 'Priya Sharma',
    products: [
      { name: 'Wheat', quantity: 400, grade: 'A', price: 30 },
      { name: 'Corn', quantity: 200, grade: 'B', price: 20 }
    ]
  },
  {
    id: '3',
    date: 'November 2025',
    amount: 30000,
    transactionId: 'TXN2025112',
    buyerName: 'Amit Patel',
    sender: 'Organic Farms',
    receiver: 'Amit Patel',
    products: [
      { name: 'Rice', quantity: 600, grade: 'A+', price: 45 },
      { name: 'Wheat', quantity: 150, grade: 'B', price: 20 }
    ]
  },
  {
    id: '4',
    date: 'October 2025',
    amount: 18500,
    transactionId: 'TXN2025101',
    buyerName: 'Sneha Reddy',
    sender: 'Valley Produce',
    receiver: 'Sneha Reddy',
    products: [
      { name: 'Wheat', quantity: 500, grade: 'A', price: 30 },
      { name: 'Paddy', quantity: 150, grade: 'B', price: 25 }
    ]
  }
];

export function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('Date');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactionsData.filter(transaction => 
    transaction.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Transactions</h1>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </button>
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
              <option value="Date">Date</option>
              <option value="January 2086">January 2086</option>
              <option value="December 2025">December 2025</option>
              <option value="November 2025">November 2025</option>
              <option value="October 2025">October 2025</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTransaction(transaction)}
            >
              {/* Date and Amount Header */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-700">{transaction.date}</h3>
                <span className="text-xl font-semibold text-emerald-600">₹{transaction.amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="text-gray-900 font-medium">{transaction.transactionId}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-600">Buyer Name:</span>
                  <span className="text-gray-900 font-medium">{transaction.buyerName}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No transactions found</p>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Transaction Details</h2>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sender:</p>
                    <p className="text-lg font-semibold text-emerald-600">{selectedTransaction.sender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Receiver:</p>
                    <p className="text-lg font-semibold text-emerald-600">{selectedTransaction.receiver}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Transaction ID:</p>
                    <p className="text-lg font-medium text-gray-800">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Amount:</p>
                    <p className="text-lg font-semibold text-emerald-600">₹{selectedTransaction.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Products Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Product</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Quantity (kg)</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Grade</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransaction.products.map((product, index) => (
                          <tr key={index} className="border-b border-gray-200 last:border-b-0">
                            <td className="px-6 py-4 text-gray-800">{product.name}</td>
                            <td className="px-6 py-4 text-gray-800">{product.quantity}</td>
                            <td className="px-6 py-4 text-gray-800">{product.grade}</td>
                            <td className="px-6 py-4 text-emerald-600 font-medium">₹{product.price}/kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
