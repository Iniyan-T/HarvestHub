import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  quantity: string;
  grade: string;
  price: string;
}

interface Transaction {
  id: string;
  buyerName: string;
  amount: number;
  date: string;
  sender: string;
  receiver: string;
  products: Product[];
}

// Mock transaction data
const transactionsData: Transaction[] = [
  {
    id: "TXNB10",
    buyerName: "ABCD",
    amount: 15000,
    date: "2026-01-15",
    sender: "ABCD",
    receiver: "XYZL",
    products: [
      { id: 1, name: "Wheat", quantity: "500", grade: "A", price: "₹2,100/kg" },
      { id: 2, name: "Paddy", quantity: "150", grade: "B", price: "₹250/kg" },
    ],
  },
  {
    id: "TXNB09",
    buyerName: "Ramesh Kumar",
    amount: 12000,
    date: "2026-01-10",
    sender: "Ramesh Kumar",
    receiver: "Suresh Patel",
    products: [
      { id: 1, name: "Rice", quantity: "300", grade: "A", price: "₹3,200/kg" },
    ],
  },
  {
    id: "TXNB08",
    buyerName: "Dinesh Singh",
    amount: 8500,
    date: "2026-01-05",
    sender: "Dinesh Singh",
    receiver: "Mahesh Yadav",
    products: [
      { id: 1, name: "Carrot", quantity: "100", grade: "A", price: "₹1,200/kg" },
      { id: 2, name: "Potato", quantity: "200", grade: "B", price: "₹800/kg" },
    ],
  },
  {
    id: "TXNB07",
    buyerName: "Rajesh Sharma",
    amount: 20000,
    date: "2025-12-28",
    sender: "Rajesh Sharma",
    receiver: "Ganesh Verma",
    products: [
      { id: 1, name: "Wheat", quantity: "600", grade: "A", price: "₹2,500/kg" },
      { id: 2, name: "Onion", quantity: "150", grade: "B", price: "₹1,500/kg" },
    ],
  },
  {
    id: "TXNB06",
    buyerName: "Mahesh Yadav",
    amount: 18000,
    date: "2025-12-20",
    sender: "Mahesh Yadav",
    receiver: "Ramesh Kumar",
    products: [
      { id: 1, name: "Rice", quantity: "400", grade: "A", price: "₹3,150/kg" },
    ],
  },
  {
    id: "TXNB05",
    buyerName: "Suresh Patel",
    amount: 30000,
    date: "2025-12-15",
    sender: "Suresh Patel",
    receiver: "Dinesh Singh",
    products: [
      { id: 1, name: "Paddy", quantity: "500", grade: "A", price: "₹1,800/kg" },
      { id: 2, name: "Wheat", quantity: "400", grade: "B", price: "₹2,400/kg" },
    ],
  },
];

export function Transaction() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Group transactions by month
  const groupedTransactions = transactionsData.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Filter transactions based on search query
  const filteredGroupedTransactions = Object.entries(groupedTransactions).reduce((acc, [month, transactions]) => {
    const filtered = transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[month] = filtered;
    }
    return acc;
  }, {} as Record<string, Transaction[]>);

  const calculateMonthTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-800 mb-6">Transactions</h2>

        {/* Search and Filter */}
        <div className="flex gap-4 max-w-2xl">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 pr-10 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
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
      <div className="max-w-3xl space-y-6">
        {Object.entries(filteredGroupedTransactions).map(([month, transactions]) => (
          <div key={month}>
            {/* Month Header */}
            <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 mb-4">
              <h3 className="text-xl text-gray-700">{month}</h3>
              <span className="text-xl text-gray-700">₹ {calculateMonthTotal(transactions).toLocaleString()}</span>
            </div>

            {/* Transaction Cards */}
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-800">{transaction.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Buyer Name:</span>
                      <span className="text-gray-800">{transaction.buyerName}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-lg font-medium text-gray-800">₹ {transaction.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(filteredGroupedTransactions).length === 0 && (
          <p className="text-gray-500 text-center mt-8">No transactions found.</p>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-medium text-gray-800">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Sender:</span>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedTransaction.sender}</p>
                </div>
                <div>
                  <span className="text-gray-600">Receiver:</span>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedTransaction.receiver}</p>
                </div>
                <div>
                  <span className="text-gray-600">Transaction ID:</span>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedTransaction.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <p className="text-lg font-medium text-green-600 mt-1">₹ {selectedTransaction.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">Products</h4>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Quantity (kg)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-200 last:border-b-0">
                          <td className="px-4 py-3 text-gray-800">{product.name}</td>
                          <td className="px-4 py-3 text-gray-800">{product.quantity}</td>
                          <td className="px-4 py-3 text-gray-800">{product.grade}</td>
                          <td className="px-4 py-3 text-gray-800">{product.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
