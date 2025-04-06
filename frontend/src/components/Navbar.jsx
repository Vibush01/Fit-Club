import { Link, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import Notifications from './Notifications';

  const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">
            FitClub
          </Link>
          <div className="flex space-x-4 items-center">
            {user ? (
              <>
                <Notifications />
                <span className="text-white">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:underline">
                  Login
                </Link>
                <Link to="/signup" className="text-white hover:underline">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  };

  export default Navbar;