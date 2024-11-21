import prisma from '@/lib/prisma';
import authMiddleware from '@/middleware/authMiddleware';
import { addNotification } from '@/backend/notificationService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await authMiddleware(req, res, async () => {
      const { volunteerId, eventId } = req.body;

      if (!volunteerId || !eventId) {
        return res.status(400).json({ error: 'Volunteer ID and Event ID are required' });
      }

      try {
        // Find the event details
        const event = await prisma.eventDetails.findUnique({
          where: { id: parseInt(eventId) },
        });

        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Remove the volunteer from the event
        const deletedHistory = await prisma.volunteerHistory.deleteMany({
          where: {
            volunteerId: parseInt(volunteerId),
            eventId: parseInt(eventId),
          },
        });

        if (deletedHistory.count === 0) {
          return res.status(404).json({ error: 'No matching record found to delete' });
        }

        // Create a notification for the volunteer
        await addNotification({
          volunteerId: parseInt(volunteerId),
          message: `You have been unassigned from the event: ${event.eventName}.`,
        });

        console.log('Volunteer unassigned and notification created.');
        return res.status(200).json({ message: 'Volunteer unassigned successfully' });
      } catch (error) {
        console.error('Error unassigning volunteer:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
