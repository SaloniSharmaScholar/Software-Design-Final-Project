import { findMatchingEventsForVolunteer } from '../../../backend/matchingService';
import authMiddleware from '../../../middleware/authMiddleware';
import prisma from '../../../lib/prisma'; // Import Prisma if needed

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const { volunteerId } = req.body;

      if (!volunteerId) {
        console.error('Volunteer ID is missing in the request body');
        return res.status(400).json({ error: 'Volunteer ID is required' });
      }

      if (isNaN(parseInt(volunteerId, 10))) {
        console.error('Volunteer ID must be a number');
        return res.status(400).json({ error: 'Volunteer ID must be a valid number' });
      }

      console.log(`Processing matching events for volunteer ID: ${volunteerId}`);

      // Log all events for debugging
      const allEvents = await prisma.eventDetails.findMany({
        select: {
          id: true,
          eventName: true,
          eventDescription: true,
          location: true,
          requiredSkills: true,
          eventDate: true,
        },
      });

      console.log('All events in the database:', allEvents);

      // Fetch matching events
      const matchingEvents = await findMatchingEventsForVolunteer(volunteerId);

      if (matchingEvents.length > 0) {
        console.log(`Found ${matchingEvents.length} matching events for volunteer ID: ${volunteerId}`);
        return res.status(200).json(matchingEvents);
      } else {
        console.log(`No matching events found for volunteer ID: ${volunteerId}`);
        return res.status(200).json({ message: 'No matching events found for this volunteer' });
      }
    } catch (error) {
      console.error('Error finding matching events:', error.message);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    console.error(`Unsupported HTTP method: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}


