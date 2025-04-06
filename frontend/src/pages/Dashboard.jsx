import { useAuth } from '../context/AuthContext';
     import CustomerDashboard from './CustomerDashboard';
     import TrainerDashboard from './TrainerDashboard';
     import OwnerDashboard from './OwnerDashboard';

     const Dashboard = () => {
       const { user } = useAuth();

       if (!user) {
         return <div className="min-h-screen bg-gray-100 p-6">Please log in to view your dashboard.</div>;
       }

       return (
         <div>
           {user.role === 'customer' && <CustomerDashboard />}
           {user.role === 'trainer' && <TrainerDashboard />}
           {user.role === 'owner' && <OwnerDashboard />}
         </div>
       );
     };

     export default Dashboard;