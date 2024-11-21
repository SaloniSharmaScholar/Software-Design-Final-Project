
import React, { useEffect, useState } from 'react';
import VolunteerHistoryTable from '../components/VolunteerHistoryTable';
import axios from 'axios';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div>
      <h1>Volunteer History</h1>
      {error ? <p>{error}</p> : <VolunteerHistoryTable history={history} fetchHistory={fetchHistory} />}
    </div>
  );
};

export default HistoryPage;
