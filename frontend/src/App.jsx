import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { useAuth } from './context/AuthContext';
  import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import Navbar from './components/Navbar';
  import LandingPage from './pages/LandingPage';
  import Signup from './pages/Signup';
  import Login from './pages/Login';
  import OwnerDashboard from './pages/OwnerDashboard';
  import TrainerDashboard from './pages/TrainerDashboard';
  import CustomerDashboard from './pages/CustomerDashboard';
  import ErrorBoundary from './components/ErrorBoundary';

  function App() {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <LandingPage />} />
              <Route path="/signup" element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <Signup />} />
              <Route path="/login" element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <Login />} />
              <Route
                path="/dashboard"
                element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <Navigate to="/login" />}
              />
              <Route
                path="/dashboard/owner"
                element={user?.role === 'owner' ? <ErrorBoundary><OwnerDashboard /></ErrorBoundary> : <Navigate to="/login" />}
              />
              <Route
                path="/dashboard/trainer"
                element={user?.role === 'trainer' ? <ErrorBoundary><TrainerDashboard /></ErrorBoundary> : <Navigate to="/login" />}
              />
              <Route
                path="/dashboard/customer"
                element={user?.role === 'customer' ? <ErrorBoundary><CustomerDashboard /></ErrorBoundary> : <Navigate to="/login" />}
              />
            </Routes>
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    );
  }

  export default App;