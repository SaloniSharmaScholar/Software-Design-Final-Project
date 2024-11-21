import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const findMatchingEventsForVolunteer = async (volunteerId) => {
  const parsedVolunteerId = parseInt(volunteerId, 10);
  if (isNaN(parsedVolunteerId)) {
    throw new Error(`Invalid volunteer ID: ${volunteerId}`);
  }

  // Fetch the volunteer’s skills
  const volunteer = await prisma.userProfile.findUnique({
    where: { userId: parsedVolunteerId },
    select: { skills: true },
  });

  if (!volunteer || !volunteer.skills) {
    console.log(`Volunteer with id ${volunteerId} has no skills or does not exist`);
    return [];
  }

  const normalizedSkills = Array.isArray(volunteer.skills)
    ? volunteer.skills.map((skill) => skill.toLowerCase().trim())
    : [volunteer.skills.toLowerCase().trim()];

  console.log('Normalized skills for volunteer:', normalizedSkills);

  // Fetch all events for debugging purposes
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

  // Filter events where requiredSkills case-insensitively match the volunteer’s skills
  const matchingEvents = allEvents.filter((event) =>
    event.requiredSkills.some((skill) =>
      normalizedSkills.includes(skill.toLowerCase())
    )
  );

  console.log('Matching events:', matchingEvents);
  return matchingEvents;
};


