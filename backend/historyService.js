import prisma from '../lib/prisma';

export const getVolunteerHistory = async () => {
  return await prisma.volunteerHistory.findMany({
    include: {
      event: true, // Include event details
      user: {      // Include user profile for the volunteer's name
        select: {
          fullName: true, // Fetch only the volunteer's name
        },
      },
    },
  });
};

export const addVolunteerHistory = async (volunteerId, eventId, status) => {
  return await prisma.volunteerHistory.create({
    data: {
      volunteerId: parseInt(volunteerId, 10), // Ensure the volunteerId is an integer
      eventId: parseInt(eventId, 10),         // Ensure the eventId is an integer
      participationStatus: status,
    },
  });
};
