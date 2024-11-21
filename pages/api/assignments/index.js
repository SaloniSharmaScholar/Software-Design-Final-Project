import prisma from '../../../lib/prisma';
import authMiddleware from '../../../middleware/authMiddleware';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    await authMiddleware(req, res, async () => {
      const { volunteerId, eventId } = req.body;

      console.log('Assigning volunteer:', { volunteerId, eventId });

      // Validate required fields
      if (!volunteerId || !eventId) {
        return res.status(400).json({ error: 'Volunteer ID and Event ID are required' });
      }

      try {
        // Check if the volunteer is already assigned to the event
        const existingAssignment = await prisma.volunteerHistory.findFirst({
          where: {
            volunteerId,
            eventId,
          },
        });

        if (existingAssignment) {
          return res.status(400).json({ error: 'Volunteer is already assigned to this event' });
        }

        // Create a new assignment
        const assignment = await prisma.volunteerHistory.create({
          data: {
            volunteerId,
            eventId,
            participationStatus: 'Assigned',
          },
        });

        console.log('Assignment created:', assignment);

        // Send a notification to the volunteer
        const notification = await prisma.notification.create({
          data: {
            volunteerId,
            message: `You have been assigned to the event: ${eventId}`,
          },
        });

        console.log('Notification sent:', notification);

        return res.status(201).json({ assignment, notification });
      } catch (error) {
        console.error('Error assigning volunteer:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;
