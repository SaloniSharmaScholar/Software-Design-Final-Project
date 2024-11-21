import { getVolunteerHistory, addVolunteerHistory } from '../../../backend/historyService';
import authMiddleware from '../../../middleware/authMiddleware';

const handler = async (req, res) => {
  if (req.method === 'GET') {
    // Fetch volunteer history
    await authMiddleware(req, res, async () => {
      try {
        const history = await getVolunteerHistory();
        return res.status(200).json(history);
      } catch (error) {
        console.error('Error fetching volunteer history:', error);
        return res.status(500).json({ error: 'Failed to fetch history' });
      }
    });
  } else if (req.method === 'POST') {
    // Add a new record to the volunteer history
    await authMiddleware(req, res, async () => {
      const { volunteerId, eventId, participationStatus } = req.body;

      if (!volunteerId || !eventId || !participationStatus) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const newRecord = await addVolunteerHistory(volunteerId, eventId, participationStatus);
        return res.status(201).json(newRecord);
      } catch (error) {
        console.error('Error adding volunteer history:', error);
        return res.status(500).json({ error: 'Failed to add history record' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;

