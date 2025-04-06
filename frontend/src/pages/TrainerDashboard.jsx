import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useAuth } from '../context/AuthContext';
  import { Line } from 'react-chartjs-2';
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

  // Register Chart.js components
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

  const TrainerDashboard = () => {
    const { user, token } = useAuth();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [dietPlan, setDietPlan] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [weeklyWorkout, setWeeklyWorkout] = useState({
      Monday: [{ name: '', sets: '', reps: '', rest: '' }],
      Tuesday: [{ name: '', sets: '', reps: '', rest: '' }],
      Wednesday: [{ name: '', sets: '', reps: '', rest: '' }],
      Thursday: [{ name: '', sets: '', reps: '', rest: '' }],
      Friday: [{ name: '', sets: '', reps: '', rest: '' }],
      Saturday: [{ name: '', sets: '', reps: '', rest: '' }],
      Sunday: [{ name: '', sets: '', reps: '', rest: '' }],
    });
    const [newDiet, setNewDiet] = useState({ meals: [{ mealName: '', calories: '', macros: { protein: '', carbs: '', fats: '' }, time: '' }] });
    const [editingWorkout, setEditingWorkout] = useState(false);
    const [editingDiet, setEditingDiet] = useState(false);
    const [loading, setLoading] = useState(true);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
      fetchMembers();
    }, []);

    useEffect(() => {
      if (selectedMember) {
        fetchProgressData(selectedMember._id);
      } else {
        setProgressData([]);
      }
    }, [selectedMember]);

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/trainer/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    const fetchPlans = async (userId) => {
      try {
        const [workoutRes, dietRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trainer/workout-plans/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/trainer/diet-plans/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setWorkoutPlan(workoutRes.data || null);
        setDietPlan(dietRes.data || null);
        if (workoutRes.data) {
          const updatedWeeklyWorkout = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
          };
          workoutRes.data.exercises.forEach(exercise => {
            updatedWeeklyWorkout[exercise.day] = updatedWeeklyWorkout[exercise.day] || [];
            updatedWeeklyWorkout[exercise.day].push({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
            });
          });
          // Ensure each day has at least one empty exercise if none exist
          daysOfWeek.forEach(day => {
            if (updatedWeeklyWorkout[day].length === 0) {
              updatedWeeklyWorkout[day] = [{ name: '', sets: '', reps: '', rest: '' }];
            }
          });
          setWeeklyWorkout(updatedWeeklyWorkout);
        } else {
          setWeeklyWorkout({
            Monday: [{ name: '', sets: '', reps: '', rest: '' }],
            Tuesday: [{ name: '', sets: '', reps: '', rest: '' }],
            Wednesday: [{ name: '', sets: '', reps: '', rest: '' }],
            Thursday: [{ name: '', sets: '', reps: '', rest: '' }],
            Friday: [{ name: '', sets: '', reps: '', rest: '' }],
            Saturday: [{ name: '', sets: '', reps: '', rest: '' }],
            Sunday: [{ name: '', sets: '', reps: '', rest: '' }],
          });
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error(err.response?.data?.error || 'Failed to fetch plans');
        }
        setWorkoutPlan(null);
        setDietPlan(null);
      }
    };

    const fetchProgressData = async (userId) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trainer/analytics/customer-progress/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgressData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch customer progress data');
      }
    };

    const handleMemberSelect = (member) => {
      setSelectedMember(member);
      setNewDiet({ meals: [{ mealName: '', calories: '', macros: { protein: '', carbs: '', fats: '' }, time: '' }] });
      setEditingWorkout(false);
      setEditingDiet(false);
      fetchPlans(member._id);
    };

    const handleWorkoutChange = (day, index, field, value) => {
      const updatedExercises = [...weeklyWorkout[day]];
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };
      setWeeklyWorkout({ ...weeklyWorkout, [day]: updatedExercises });
    };

    const handleDietChange = (index, field, value, subField) => {
      const updatedMeals = [...newDiet.meals];
      if (subField) {
        updatedMeals[index] = {
          ...updatedMeals[index],
          macros: { ...updatedMeals[index].macros, [subField]: value },
        };
      } else {
        updatedMeals[index] = { ...updatedMeals[index], [field]: value };
      }
      setNewDiet({ meals: updatedMeals });
    };

    const addExercise = (day) => {
      setWeeklyWorkout({
        ...weeklyWorkout,
        [day]: [...weeklyWorkout[day], { name: '', sets: '', reps: '', rest: '' }],
      });
    };

    const removeExercise = (day, index) => {
      setWeeklyWorkout({
        ...weeklyWorkout,
        [day]: weeklyWorkout[day].filter((_, i) => i !== index),
      });
    };

    const addMeal = () => {
      setNewDiet({
        meals: [...newDiet.meals, { mealName: '', calories: '', macros: { protein: '', carbs: '', fats: '' }, time: '' }],
      });
    };

    const removeMeal = (index) => {
      setNewDiet({
        meals: newDiet.meals.filter((_, i) => i !== index),
      });
    };

    const handleWorkoutSubmit = async (e) => {
      e.preventDefault();
      try {
        const exercises = [];
        daysOfWeek.forEach(day => {
          weeklyWorkout[day].forEach(exercise => {
            if (exercise.name && exercise.sets && exercise.reps && exercise.rest) {
              exercises.push({
                name: exercise.name,
                sets: Number(exercise.sets),
                reps: exercise.reps,
                rest: exercise.rest,
                day,
              });
            }
          });
        });
        if (exercises.length === 0) {
          toast.error('Please add at least one valid exercise');
          return;
        }
        const payload = {
          userId: selectedMember._id,
          exercises,
        };
        if (editingWorkout) {
          await axios.put(
            `http://localhost:5000/api/trainer/workout-plans/${selectedMember._id}`,
            { exercises },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Workout plan updated!');
        } else {
          await axios.post(
            'http://localhost:5000/api/trainer/workout-plans',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Workout plan created!');
        }
        fetchPlans(selectedMember._id);
        setEditingWorkout(false);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to save workout plan');
      }
    };

    const handleDietSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          userId: selectedMember._id,
          meals: newDiet.meals,
        };
        if (editingDiet) {
          await axios.put(
            `http://localhost:5000/api/trainer/diet-plans/${selectedMember._id}`,
            { meals: newDiet.meals },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Diet plan updated!');
        } else {
          await axios.post(
            'http://localhost:5000/api/trainer/diet-plans',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Diet plan created!');
        }
        fetchPlans(selectedMember._id);
        setEditingDiet(false);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to save diet plan');
      }
    };

    const handleWorkoutDelete = async () => {
      try {
        await axios.delete(
          `http://localhost:5000/api/trainer/workout-plans/${selectedMember._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkoutPlan(null);
        setWeeklyWorkout({
          Monday: [{ name: '', sets: '', reps: '', rest: '' }],
          Tuesday: [{ name: '', sets: '', reps: '', rest: '' }],
          Wednesday: [{ name: '', sets: '', reps: '', rest: '' }],
          Thursday: [{ name: '', sets: '', reps: '', rest: '' }],
          Friday: [{ name: '', sets: '', reps: '', rest: '' }],
          Saturday: [{ name: '', sets: '', reps: '', rest: '' }],
          Sunday: [{ name: '', sets: '', reps: '', rest: '' }],
        });
        toast.success('Workout plan deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete workout plan');
      }
    };

    const handleDietDelete = async () => {
      try {
        await axios.delete(
          `http://localhost:5000/api/trainer/diet-plans/${selectedMember._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDietPlan(null);
        toast.success('Diet plan deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete diet plan');
      }
    };

    // Data for the line chart (Customer Progress)
    const progressChartData = {
      labels: progressData.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Weight (kg)',
          data: progressData.map(entry => entry.weight),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        },
        {
          label: 'Body Fat (%)',
          data: progressData.map(entry => entry.bodyFat),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
        },
        {
          label: 'Muscle Mass (kg)',
          data: progressData.map(entry => entry.muscleMass),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
        },
      ],
    };

    const progressChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: selectedMember ? `Progress for ${selectedMember.name}` : 'Customer Progress',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Trainer Dashboard</h1>
        <p className="mb-4">Welcome, {user.name}!</p>

        {/* Members List */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Gym Members</h2>
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map(member => (
                <button
                  key={member._id}
                  onClick={() => handleMemberSelect(member)}
                  className={`w-full p-2 rounded text-left ${selectedMember?._id === member._id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {member.name} ({member.email})
                </button>
              ))}
            </div>
          ) : (
            <p>No members found in your gym.</p>
          )}
        </div>

        {/* Manage Plans */}
        {selectedMember && (
          <div className="space-y-8">
            {/* Customer Progress Analytics */}
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Customer Progress Analytics</h2>
              {progressData.length > 0 ? (
                <div className="w-full max-w-4xl mx-auto">
                  <Line data={progressChartData} options={progressChartOptions} />
                </div>
              ) : (
                <p>No progress data available for this customer.</p>
              )}
            </div>

            {/* Workout Plan */}
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Workout Plan for {selectedMember.name}</h2>
              {workoutPlan ? (
                <div className="mb-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="mb-4">
                      <h3 className="text-lg font-semibold">{day}</h3>
                      {workoutPlan.exercises && workoutPlan.exercises.filter(exercise => exercise.day === day).length > 0 ? (
                        workoutPlan.exercises
                          .filter(exercise => exercise.day === day)
                          .map((exercise, index) => (
                            <div key={index} className="mb-2">
                              <p><strong>{exercise.name}</strong>: {exercise.sets} sets, {exercise.reps} reps, {exercise.rest} rest</p>
                            </div>
                          ))
                      ) : (
                        <p>No exercises for this day.</p>
                      )}
                    </div>
                  ))}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingWorkout(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Update Plan
                    </button>
                    <button
                      onClick={handleWorkoutDelete}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete Plan
                    </button>
                  </div>
                </div>
              ) : (
                <p>No workout plan found. Create one below.</p>
              )}
              <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="space-y-2">
                    <h3 className="text-lg font-semibold">{day}</h3>
                    {weeklyWorkout[day].map((exercise, index) => (
                      <div key={index} className="space-y-2 p-2 border rounded">
                        <input
                          type="text"
                          placeholder="Exercise Name"
                          value={exercise.name}
                          onChange={(e) => handleWorkoutChange(day, index, 'name', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Sets"
                          value={exercise.sets}
                          onChange={(e) => handleWorkoutChange(day, index, 'sets', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Reps (e.g., 12-15)"
                          value={exercise.reps}
                          onChange={(e) => handleWorkoutChange(day, index, 'reps', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Rest (e.g., 60s)"
                          value={exercise.rest}
                          onChange={(e) => handleWorkoutChange(day, index, 'rest', e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(day, index)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Remove Exercise
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExercise(day)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Add Exercise
                    </button>
                  </div>
                ))}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingWorkout ? 'Update Workout Plan' : 'Create Workout Plan'}
                </button>
              </form>
            </div>

            {/* Diet Plan */}
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Diet Plan for {selectedMember.name}</h2>
              {dietPlan ? (
                <div className="mb-4">
                  {dietPlan.meals && dietPlan.meals.length > 0 ? (
                    dietPlan.meals.map((meal, index) => (
                      <div key={index} className="mb-2">
                        <p><strong>{meal.mealName}</strong>: {meal.calories} cal, Protein: {meal.macros.protein}g, Carbs: {meal.macros.carbs}g, Fats: {meal.macros.fats}g, Time: {meal.time}</p>
                      </div>
                    ))
                  ) : (
                    <p>No meals in this plan.</p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setNewDiet({ meals: dietPlan.meals });
                        setEditingDiet(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Update Plan
                    </button>
                    <button
                      onClick={handleDietDelete}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete Plan
                    </button>
                  </div>
                </div>
              ) : (
                <p>No diet plan found. Create one below.</p>
              )}
              <form onSubmit={handleDietSubmit} className="space-y-4">
                {newDiet.meals.map((meal, index) => (
                  <div key={index} className="space-y-2 p-2 border rounded">
                    <input
                      type="text"
                      placeholder="Meal Name"
                      value={meal.mealName}
                      onChange={(e) => handleDietChange(index, 'mealName', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Calories"
                      value={meal.calories}
                      onChange={(e) => handleDietChange(index, 'calories', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={meal.macros.protein}
                      onChange={(e) => handleDietChange(index, 'macros', e.target.value, 'protein')}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={meal.macros.carbs}
                      onChange={(e) => handleDietChange(index, 'macros', e.target.value, 'carbs')}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Fats (g)"
                      value={meal.macros.fats}
                      onChange={(e) => handleDietChange(index, 'macros', e.target.value, 'fats')}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Time (e.g., 08:00)"
                      value={meal.time}
                      onChange={(e) => handleDietChange(index, 'time', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeMeal(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove Meal
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMeal}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Add Meal
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingDiet ? 'Update Diet Plan' : 'Create Diet Plan'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default TrainerDashboard;