import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/NotificationList.module.css';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You must be logged in to view notifications.');
        }

        const response = await axios.get('/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      }
    };

    fetchNotifications();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!notifications.length) {
    return <p>No notifications found.</p>;
  }

  return (
    <ul className={styles.notificationList}>
      {notifications.map((notification) => (
        <li key={notification.id}>{notification.message}</li>
      ))}
    </ul>
  );
};

export default NotificationList;
