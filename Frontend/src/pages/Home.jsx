import { useSelector, useDispatch } from 'react-redux';
import { Button } from "@/components/ui/button";
import { logoutUser } from '../store/authActions';

export default function Home() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to StackIt</h1>
          <p className="text-gray-600 mb-8">Please login or signup to continue</p>
          <div className="space-x-4">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/signup">Sign Up</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">StackIt</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.username}!</span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">User Information</h3>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Username:</strong> {user?.username}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Role:</strong> {user?.role}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">Quick Actions</h3>
              <div className="mt-2 space-y-2">
                <Button className="w-full" variant="outline">
                  Ask a Question
                </Button>
                <Button className="w-full" variant="outline">
                  Browse Questions
                </Button>
                <Button className="w-full" variant="outline">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
