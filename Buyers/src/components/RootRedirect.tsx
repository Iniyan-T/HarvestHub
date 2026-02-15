import { Navigate } from "react-router";
import { isValidObjectId } from "../utils/validation";

export function RootRedirect() {
  const storedUserId = localStorage.getItem('userId');
  const validUserId = isValidObjectId(storedUserId) ? storedUserId : null;
  
  if (validUserId) {
    return <Navigate to={`/${validUserId}`} replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to HarvestHub</h1>
        <p className="text-gray-600 mb-6">Please login from the main portal to access your buyer dashboard.</p>
        <a 
          href="http://localhost:3000/login" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Go to Login →
        </a>
      </div>
    </div>
  );
}
