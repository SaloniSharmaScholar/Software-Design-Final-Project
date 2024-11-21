import prisma from '@/lib/prisma';
import authMiddleware from '@/middleware/authMiddleware';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    await authMiddleware(req, res, async () => {
      const { volunteerId, eventId, participationStatus } = req.body;

      if (!volunteerId || !eventId || !participationStatus) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        // Create the VolunteerHistory record
        const record = await prisma.volunteerHistory.create({
          data: {
            volunteerId: parseInt(volunteerId, 10),
            eventId: parseInt(eventId, 10),
            participationStatus,
          },
        });

        // Fetch event details for notification message
        const event = await prisma.eventDetails.findUnique({
          where: { id: parseInt(eventId, 10) },
        });

        // Create a notification for the volunteer
        await prisma.notification.create({
          data: {
            volunteerId: parseInt(volunteerId, 10),
            message: `You have been assigned to the event: ${event.eventName}`,
          },
        });

        return res.status(201).json(record);
      } catch (error) {
        console.error('Error assigning volunteer to event:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
