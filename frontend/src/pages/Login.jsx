import { useState } from 'react';
       import { useNavigate } from 'react-router-dom';
       import axios from 'axios';
       import { toast } from 'react-toastify';
       import { useAuth } from '../context/AuthContext';

       const Login = () => {
         const [formData, setFormData] = useState({
           email: '',
           password: '',
         });
         const navigate = useNavigate();
         const { login } = useAuth();

         const handleChange = (e) => {
           setFormData({ ...formData, [e.target.name]: e.target.value });
         };

         const handleSubmit = async (e) => {
           e.preventDefault();
           try {
             const res = await axios.post('http://localhost:5000/api/auth/login', formData);
             login(res.data.token, res.data.user);
             toast.success('Login successful!');
             navigate('/dashboard');
           } catch (err) {
             toast.error(err.response?.data?.error || 'Login failed');
           }
         };

         return (
           <div className="min-h-screen bg-gray-100 flex items-center justify-center">
             <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
               <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
               <div>
                 <div className="mb-4">
                   <label className="block text-gray-700 mb-2" htmlFor="email">
                     Email
                   </label>
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                     required
                   />
                 </div>
                 <div className="mb-6">
                   <label className="block text-gray-700 mb-2" htmlFor="password">
                     Password
                   </label>
                   <input
                     type="password"
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                     required
                   />
                 </div>
                 <button
                   type="submit"
                   onClick={handleSubmit}
                   className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                 >
                   Login
                 </button>
               </div>
               <p className="mt-4 text-center">
                 Don't have an account?{' '}
                 <a href="/signup" className="text-blue-600 hover:underline">
                   Signup
                 </a>
               </p>
             </div>
           </div>
         );
       };

       export default Login;