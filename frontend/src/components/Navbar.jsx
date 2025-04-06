import { Link, useNavigate } from 'react-router-dom';
     import { useAuth } from '../context/AuthContext';

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
             <Link to="/" className="text-white text-2xl font-bold">
               FitClub
             </Link>
             <div className="space-x-4">
               {user ? (
                 <>
                   <span className="text-white">Welcome, {user.name}</span>
                   <button
                     onClick={handleLogout}
                     className="text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                   >
                     Logout
                   </button>
                 </>
               ) : (
                 <>
                   <Link to="/login" className="text-white hover:text-gray-300">
                     Login
                   </Link>
                   <Link to="/signup" className="text-white hover:text-gray-300">
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