import prisma from '../../../lib/prisma';
import authMiddleware from '../../../middleware/authMiddleware';

const handler = async (req, res) => {
  try {
    // Ensure Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization header missing');
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Token missing in Authorization header');
      return res.status(401).json({ error: 'Token missing in Authorization header' });
    }

    // Run authentication middleware to validate the token
    await authMiddleware(req, res, async () => {
      if (req.method === 'POST') {
        const { eventName, eventDescription, location, requiredSkills, urgency, eventDate } = req.body;

        // Validate required fields
        if (!eventName || !eventDescription || !location || !requiredSkills || !eventDate) {
          console.error('Missing required fields for event creation');
          return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
          // Create a new event
          const event = await prisma.eventDetails.create({
            data: {
              eventName,
              eventDescription,
              location,
              requiredSkills,
              urgency,
              eventDate: new Date(eventDate),
            },
          });

          console.log('Event created:', event);
          return res.status(201).json(event);
        } catch (error) {
          console.error('Error creating event:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else if (req.method === 'GET') {
        try {
          // Fetch all events
          const events = await prisma.eventDetails.findMany();
          console.log('Fetched events:', events);
          return res.status(200).json(events);
        } catch (error) {
          console.error('Error fetching events:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        // Handle unsupported HTTP methods
        console.error(`Unsupported HTTP method: ${req.method}`);
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ error: 'Method not allowed' });
      }
    });
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default handler;