import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useAuth } from '../context/AuthContext';
  import { Bar } from 'react-chartjs-2';
  import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

  // Register Chart.js components
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  const OwnerDashboard = () => {
    const { user, token } = useAuth();
    const [gyms, setGyms] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [members, setMembers] = useState([]);
    const [gymActivity, setGymActivity] = useState({ members: 0, trainers: 0 });
    const [newGym, setNewGym] = useState({ name: '', location: '', images: '' });
    const [editingGym, setEditingGym] = useState(null);
    const [newTrainerEmail, setNewTrainerEmail] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchGyms();
    }, []);

    useEffect(() => {
      if (gyms.length > 0) {
        fetchTrainersAndMembers();
        fetchGymActivity();
      } else {
        setTrainers([]);
        setMembers([]);
        setGymActivity({ members: 0, trainers: 0 });
      }
    }, [gyms]);

    const fetchGyms = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/owner/gyms', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGyms(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch gyms');
      } finally {
        setLoading(false);
      }
    };

    const fetchTrainersAndMembers = async () => {
      try {
        const [trainersRes, membersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/owner/gyms/trainers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/owner/gyms/members', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTrainers(trainersRes.data);
        setMembers(membersRes.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch trainers and members');
      }
    };

    const fetchGymActivity = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/owner/analytics/gym-activity', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGymActivity(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch gym activity analytics');
      }
    };

    const handleGymSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          name: newGym.name,
          location: newGym.location,
          images: newGym.images.split(',').map(url => url.trim()).filter(Boolean),
        };
        await axios.post('http://localhost:5000/api/owner/gyms', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewGym({ name: '', location: '', images: '' });
        fetchGyms();
        toast.success('Gym created!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to create gym');
      }
    };

    const handleGymUpdate = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          name: editingGym.name,
          location: editingGym.location,
          images: editingGym.images.split(',').map(url => url.trim()).filter(Boolean),
        };
        await axios.put(`http://localhost:5000/api/owner/gyms/${editingGym._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingGym(null);
        fetchGyms();
        toast.success('Gym updated!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update gym');
      }
    };

    const handleGymDelete = async (gymId) => {
      try {
        await axios.delete(`http://localhost:5000/api/owner/gyms/${gymId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchGyms();
        fetchTrainersAndMembers();
        fetchGymActivity();
        toast.success('Gym deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete gym');
      }
    };

    const handleAddTrainer = async (e) => {
      e.preventDefault();
      try {
        await axios.post('http://localhost:5000/api/owner/gyms/trainers', { trainerEmail: newTrainerEmail }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewTrainerEmail('');
        fetchTrainersAndMembers();
        fetchGymActivity();
        toast.success('Trainer added to gym!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to add trainer');
      }
    };

    const handleRemoveTrainer = async (trainerId) => {
      try {
        await axios.delete(`http://localhost:5000/api/owner/gyms/trainers/${trainerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTrainersAndMembers();
        fetchGymActivity();
        toast.success('Trainer removed from gym!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to remove trainer');
      }
    };

    const handleAddMember = async (e) => {
      e.preventDefault();
      try {
        await axios.post('http://localhost:5000/api/owner/gyms/members', { memberEmail: newMemberEmail }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewMemberEmail('');
        fetchTrainersAndMembers();
        fetchGymActivity();
        toast.success('Member added to gym!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to add member');
      }
    };

    const handleRemoveMember = async (memberId) => {
      try {
        await axios.delete(`http://localhost:5000/api/owner/gyms/members/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTrainersAndMembers();
        fetchGymActivity();
        toast.success('Member removed from gym!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to remove member');
      }
    };

    // Data for the bar chart
    const gymActivityData = {
      labels: ['Members', 'Trainers'],
      datasets: [
        {
          label: 'Gym Activity',
          data: [gymActivity.members, gymActivity.trainers],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
          borderWidth: 1,
        },
      ],
    };

    const gymActivityOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Gym Activity Overview',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count',
          },
        },
      },
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
        <p className="mb-4">Welcome, {user.name}!</p>

        {/* Gym Activity Analytics */}
        {gyms.length > 0 && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Gym Activity Analytics</h2>
            <div className="w-full max-w-md mx-auto">
              <Bar data={gymActivityData} options={gymActivityOptions} />
            </div>
          </div>
        )}

        {/* Manage Gyms */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Gyms</h2>
          <form onSubmit={handleGymSubmit} className="space-y-4 mb-4">
            <input
              type="text"
              placeholder="Gym Name"
              value={newGym.name}
              onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newGym.location}
              onChange={(e) => setNewGym({ ...newGym, location: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URLs (comma-separated)"
              value={newGym.images}
              onChange={(e) => setNewGym({ ...newGym, images: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Gym
            </button>
          </form>
          <div className="space-y-4">
            {gyms.length > 0 ? (
              gyms.map(gym => (
                <div key={gym._id} className="p-4 bg-gray-50 rounded-lg">
                  {editingGym && editingGym._id === gym._id ? (
                    <form onSubmit={handleGymUpdate} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Gym Name"
                        value={editingGym.name}
                        onChange={(e) => setEditingGym({ ...editingGym, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={editingGym.location}
                        onChange={(e) => setEditingGym({ ...editingGym, location: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Image URLs (comma-separated)"
                        value={editingGym.images}
                        onChange={(e) => setEditingGym({ ...editingGym, images: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingGym(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p><strong>Name:</strong> {gym.name}</p>
                      <p><strong>Location:</strong> {gym.location}</p>
                      <p><strong>Images:</strong> {gym.images.length > 0 ? gym.images.join(', ') : 'None'}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => setEditingGym({ ...gym, images: gym.images.join(',') })}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleGymDelete(gym._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No gyms found. Create one above to manage trainers and members.</p>
            )}
          </div>
        </div>

        {/* Manage Trainers */}
        {gyms.length > 0 && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Manage Trainers</h2>
            <form onSubmit={handleAddTrainer} className="space-y-4 mb-4">
              <input
                type="email"
                placeholder="Trainer Email"
                value={newTrainerEmail}
                onChange={(e) => setNewTrainerEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Trainer
              </button>
            </form>
            <div className="space-y-4">
              {trainers.length > 0 ? (
                trainers.map(trainer => (
                  <div key={trainer._id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <p>{trainer.name} ({trainer.email})</p>
                    <button
                      onClick={() => handleRemoveTrainer(trainer._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No trainers found in your gym.</p>
              )}
            </div>
          </div>
        )}

        {/* Manage Members */}
        {gyms.length > 0 && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Manage Members</h2>
            <form onSubmit={handleAddMember} className="space-y-4 mb-4">
              <input
                type="email"
                placeholder="Member Email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Member
              </button>
            </form>
            <div className="space-y-4">
              {members.length > 0 ? (
                members.map(member => (
                  <div key={member._id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <p>{member.name} ({member.email})</p>
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No members found in your gym.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  export default OwnerDashboard;