import { query } from '../lib/db.js';

export const getNotifications = async () => {
  try {
    const result = await query('SELECT * FROM "Notification" ORDER BY "createdAt" DESC');
    console.log('Fetched notifications:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
export const addNotification = async (notification) => {
  try {
    console.log('Adding notification:', notification);
    const result = await query(
      'INSERT INTO "Notification" ("volunteerId", "message", "createdAt") VALUES ($1, $2, DEFAULT) RETURNING *',
      [notification.volunteerId, notification.message]
    );
    console.log('Inserted notification:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};