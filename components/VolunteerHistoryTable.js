import React from 'react';
import axios from 'axios';
import styles from '../styles/VolunteerHistoryTable.module.css';

const VolunteerHistoryTable = ({ history, fetchHistory }) => {
  const handleUnassign = async (volunteerId, eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to perform this action.');
        return;
      }

      // Call the unassign API
      await axios.post(
        '/api/volunteer-history/unassign',
        { volunteerId, eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Volunteer successfully unassigned from the event.');
      fetchHistory(); // Refresh the history table
    } catch (error) {
      console.error('Error unassigning volunteer:', error);
      alert('Failed to unassign the volunteer. Please try again.');
    }
  };

  return (
    <table className={styles.historyTable}>
      <thead>
        <tr>
          <th>Volunteer Name</th>
          <th>Event Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry) => (
          <tr key={entry.id}>
            <td>{entry.user.fullName}</td>
            <td>{entry.event.eventName}</td>
            <td>{entry.participationStatus}</td>
            <td>
              <button
                onClick={() => handleUnassign(entry.volunteerId, entry.eventId)}
                className={styles.unassignButton}
              >
                Unassign
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VolunteerHistoryTable;
