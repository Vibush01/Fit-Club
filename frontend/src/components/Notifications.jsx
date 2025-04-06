import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useAuth } from '../context/AuthContext';

  const Notifications = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch notifications');
      }
    };

    const markAsRead = async (id) => {
      try {
        await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifications.filter(notif => notif._id !== id));
        toast.success('Notification marked as read!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to mark notification as read');
      }
    };

    const markAllAsRead = async () => {
      try {
        await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications([]);
        toast.success('All notifications marked as read!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to mark all notifications as read');
      }
    };

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Notifications
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div
                    key={notif._id}
                    className="p-2 mb-2 bg-gray-100 rounded flex justify-between items-center"
                  >
                    <p>{notif.message}</p>
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Mark as Read
                    </button>
                  </div>
                ))
              ) : (
                <p>No unread notifications.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Notifications;