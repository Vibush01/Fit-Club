import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useAuth } from '../context/AuthContext';

  const CustomerDashboard = () => {
    const { user, token } = useAuth();
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [dietPlan, setDietPlan] = useState(null);
    const [macroLog, setMacroLog] = useState({ date: '', food: '', protein: '', carbs: '', fats: '', calories: '' });
    const [bodyProgress, setBodyProgress] = useState({ date: '', weight: '', bodyFat: '', muscleMass: '', images: '' });
    const [macroLogs, setMacroLogs] = useState([]);
    const [bodyProgressHistory, setBodyProgressHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMacro, setEditingMacro] = useState(null);
    const [editingProgress, setEditingProgress] = useState(null);

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [workoutRes, dietRes, macroRes, bodyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/customer/workout-plan', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/customer/diet-plan', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/customer/macro-logs', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/customer/body-progress', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setWorkoutPlan(workoutRes.data || {});
        setDietPlan(dietRes.data || {});
        setMacroLogs(Array.isArray(macroRes.data) ? macroRes.data : []);
        setBodyProgressHistory(Array.isArray(bodyRes.data) ? bodyRes.data : []);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    const handleMacroLogChange = (e) => {
      const { name, value } = e.target;
      console.log(`Input changed: ${name} = ${value}`);
      setMacroLog(prev => ({ ...prev, [name]: value }));
    };

    const handleMacroLogSubmit = async (e) => {
      e.preventDefault();
      console.log('Submitting macro log:', JSON.stringify(macroLog, null, 2));
      if (!macroLog.food || !macroLog.food.trim()) {
        toast.error('Food name is required');
        return;
      }
      try {
        const payload = {
          date: macroLog.date,
          food: macroLog.food.trim(),
          protein: Number(macroLog.protein),
          carbs: Number(macroLog.carbs),
          fats: Number(macroLog.fats),
          calories: Number(macroLog.calories),
        };
        console.log('Sending payload:', JSON.stringify(payload, null, 2));
        const res = await axios.post(
          'http://localhost:5000/api/customer/macro-log',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMacroLogs([res.data, ...macroLogs]);
        setMacroLog({ date: '', food: '', protein: '', carbs: '', fats: '', calories: '' });
        toast.success('Macro log saved!');
      } catch (err) {
        console.error('Macro log submission error:', err.response?.data || err.message);
        toast.error(err.response?.data?.error || 'Failed to save macro log');
      }
    };

    const handleMacroLogUpdate = async (e) => {
      e.preventDefault();
      if (!editingMacro.food || !editingMacro.food.trim()) {
        toast.error('Food name is required');
        return;
      }
      try {
        const payload = {
          date: editingMacro.date,
          food: editingMacro.food.trim(),
          protein: Number(editingMacro.protein),
          carbs: Number(editingMacro.carbs),
          fats: Number(editingMacro.fats),
          calories: Number(editingMacro.calories),
        };
        const res = await axios.put(
          `http://localhost:5000/api/customer/macro-log/${editingMacro._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMacroLogs(macroLogs.map(log => (log._id === editingMacro._id ? res.data : log)));
        setEditingMacro(null);
        toast.success('Macro log updated!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update macro log');
      }
    };

    const handleMacroLogDelete = async (id) => {
      try {
        await axios.delete(
          `http://localhost:5000/api/customer/macro-log/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMacroLogs(macroLogs.filter(log => log._id !== id));
        toast.success('Macro log deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete macro log');
      }
    };

    const handleBodyProgressSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          date: bodyProgress.date,
          weight: Number(bodyProgress.weight),
          bodyFat: Number(bodyProgress.bodyFat),
          muscleMass: Number(bodyProgress.muscleMass),
          images: bodyProgress.images.split(',').map(url => url.trim()).filter(Boolean),
        };
        const res = await axios.post(
          'http://localhost:5000/api/customer/body-progress',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBodyProgressHistory([res.data, ...bodyProgressHistory]);
        setBodyProgress({ date: '', weight: '', bodyFat: '', muscleMass: '', images: '' });
        toast.success('Body progress saved!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to save body progress');
      }
    };

    const handleBodyProgressUpdate = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          date: editingProgress.date,
          weight: Number(editingProgress.weight),
          bodyFat: Number(editingProgress.bodyFat),
          muscleMass: Number(editingProgress.muscleMass),
          images: editingProgress.images.split(',').map(url => url.trim()).filter(Boolean),
        };
        const res = await axios.put(
          `http://localhost:5000/api/customer/body-progress/${editingProgress._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBodyProgressHistory(bodyProgressHistory.map(progress => (progress._id === editingProgress._id ? res.data : progress)));
        setEditingProgress(null);
        toast.success('Body progress updated!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update body progress');
      }
    };

    const handleBodyProgressDelete = async (id) => {
      try {
        await axios.delete(
          `http://localhost:5000/api/customer/body-progress/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBodyProgressHistory(bodyProgressHistory.filter(progress => progress._id !== id));
        toast.success('Body progress deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete body progress');
      }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>
        <p className="mb-4">Welcome, {user.name}!</p>

        {/* Workout Plan */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Workout Plan</h2>
          {workoutPlan && workoutPlan.exercises && Array.isArray(workoutPlan.exercises) && workoutPlan.exercises.length > 0 ? (
            workoutPlan.exercises.map((exercise, index) => (
              <div key={index} className="mb-2">
                <p><strong>{exercise.name}</strong>: {exercise.sets} sets, {exercise.reps} reps, {exercise.rest} rest, {exercise.day}</p>
              </div>
            ))
          ) : (
            <p>No workout plan available. Contact your trainer.</p>
          )}
        </div>

        {/* Diet Plan */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Diet Plan</h2>
          {dietPlan && dietPlan.meals && Array.isArray(dietPlan.meals) && dietPlan.meals.length > 0 ? (
            dietPlan.meals.map((meal, index) => (
              <div key={index} className="mb-2">
                <p><strong>{meal.mealName}</strong>: {meal.calories} cal, Protein: {meal.macros.protein}g, Carbs: {meal.macros.carbs}g, Fats: {meal.macros.fats}g, Time: {meal.time}</p>
              </div>
            ))
          ) : (
            <p>No diet plan available. Contact your trainer.</p>
          )}
        </div>

        {/* Macro Logging */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Log Daily Macros</h2>
          <form onSubmit={handleMacroLogSubmit} className="space-y-4">
            <input
              type="date"
              name="date"
              value={macroLog.date}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="food"
              placeholder="Food Name"
              value={macroLog.food}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="protein"
              placeholder="Protein (g)"
              value={macroLog.protein}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="carbs"
              placeholder="Carbs (g)"
              value={macroLog.carbs}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="fats"
              placeholder="Fats (g)"
              value={macroLog.fats}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="calories"
              placeholder="Calories"
              value={macroLog.calories}
              onChange={handleMacroLogChange}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Save Macro Log
            </button>
          </form>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Macro History</h3>
            {Array.isArray(macroLogs) && macroLogs.length > 0 ? (
              macroLogs.map((log, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  {editingMacro && editingMacro._id === log._id ? (
                    <form onSubmit={handleMacroLogUpdate} className="space-y-2">
                      <input
                        type="date"
                        name="date"
                        value={editingMacro.date.split('T')[0]}
                        onChange={(e) => setEditingMacro({ ...editingMacro, date: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="food"
                        value={editingMacro.food}
                        onChange={(e) => setEditingMacro({ ...editingMacro, food: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        name="protein"
                        value={editingMacro.protein}
                        onChange={(e) => setEditingMacro({ ...editingMacro, protein: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        name="carbs"
                        value={editingMacro.carbs}
                        onChange={(e) => setEditingMacro({ ...editingMacro, carbs: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        name="fats"
                        value={editingMacro.fats}
                        onChange={(e) => setEditingMacro({ ...editingMacro, fats: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        name="calories"
                        value={editingMacro.calories}
                        onChange={(e) => setEditingMacro({ ...editingMacro, calories: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMacro(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>Date: {new Date(log.date).toLocaleDateString()}</p>
                      <p>Food: {log.food}, Protein: {log.protein}g, Carbs: {log.carbs}g, Fats: {log.fats}g, Calories: {log.calories}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => setEditingMacro(log)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleMacroLogDelete(log._id)}
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
              <p>No macro logs yet.</p>
            )}
          </div>
        </div>

        {/* Body Progress */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Track Body Progress</h2>
          <form onSubmit={handleBodyProgressSubmit} className="space-y-4">
            <input
              type="date"
              value={bodyProgress.date}
              onChange={(e) => setBodyProgress({ ...bodyProgress, date: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={bodyProgress.weight}
              onChange={(e) => setBodyProgress({ ...bodyProgress, weight: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Body Fat (%)"
              value={bodyProgress.bodyFat}
              onChange={(e) => setBodyProgress({ ...bodyProgress, bodyFat: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Muscle Mass (kg)"
              value={bodyProgress.muscleMass}
              onChange={(e) => setBodyProgress({ ...bodyProgress, muscleMass: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URLs (comma-separated)"
              value={bodyProgress.images}
              onChange={(e) => setBodyProgress({ ...bodyProgress, images: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Save Body Progress
            </button>
          </form>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Progress History</h3>
            {Array.isArray(bodyProgressHistory) && bodyProgressHistory.length > 0 ? (
              bodyProgressHistory.map((progress, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  {editingProgress && editingProgress._id === progress._id ? (
                    <form onSubmit={handleBodyProgressUpdate} className="space-y-2">
                      <input
                        type="date"
                        value={editingProgress.date.split('T')[0]}
                        onChange={(e) => setEditingProgress({ ...editingProgress, date: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        value={editingProgress.weight}
                        onChange={(e) => setEditingProgress({ ...editingProgress, weight: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        value={editingProgress.bodyFat}
                        onChange={(e) => setEditingProgress({ ...editingProgress, bodyFat: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        value={editingProgress.muscleMass}
                        onChange={(e) => setEditingProgress({ ...editingProgress, muscleMass: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        value={editingProgress.images}
                        onChange={(e) => setEditingProgress({ ...editingProgress, images: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProgress(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>Date: {new Date(progress.date).toLocaleDateString()}</p>
                      <p>Weight: {progress.weight}kg, Body Fat: {progress.bodyFat}%, Muscle Mass: {progress.muscleMass}kg</p>
                      {progress.images && Array.isArray(progress.images) && progress.images.length > 0 && (
                        <p>Images: {progress.images.join(', ')}</p>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => setEditingProgress({ ...progress, images: progress.images.join(',') })}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleBodyProgressDelete(progress._id)}
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
              <p>No body progress entries yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default CustomerDashboard;