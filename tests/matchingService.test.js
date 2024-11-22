import { findMatchingEventsForVolunteer } from '../backend/matchingService';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  userProfile: {
    findUnique: jest.fn(),
  },
  eventDetails: {
    findMany: jest.fn(),
  },
}));

describe('Matching Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if volunteer ID is NaN', async () => {
    await expect(findMatchingEventsForVolunteer('not-a-number')).rejects.toThrow(
      'Invalid volunteer ID: not-a-number'
    );
  });

  it('should throw an error if volunteer ID is undefined', async () => {
    await expect(findMatchingEventsForVolunteer(undefined)).rejects.toThrow(
      'Invalid volunteer ID: undefined'
    );
  });

  it('should return an empty array if the volunteer is not found', async () => {
    prisma.userProfile.findUnique.mockResolvedValueOnce(null);

    const result = await findMatchingEventsForVolunteer(1);

    expect(result).toEqual([]);
  });

  it('should return an empty array if the volunteer has no skills', async () => {
    prisma.userProfile.findUnique.mockResolvedValueOnce({ skills: null });

    const result = await findMatchingEventsForVolunteer(1);

    expect(result).toEqual([]);
  });

  it('should return matching events for a volunteer with specific skills', async () => {
    prisma.userProfile.findUnique.mockResolvedValueOnce({
      skills: ['harvesting', 'teamwork'],
    });

    prisma.eventDetails.findMany.mockResolvedValueOnce([
      {
        id: 1,
        eventName: 'Harvest Event',
        eventDescription: 'Harvesting crops on the farm',
        location: 'Farm',
        requiredSkills: ['harvesting', 'teamwork'],
        eventDate: new Date('2024-08-01'),
      },
      {
        id: 2,
        eventName: 'Team Event',
        eventDescription: 'Team-building activities',
        location: 'Park',
        requiredSkills: ['teamwork'],
        eventDate: new Date('2024-09-01'),
      },
      {
        id: 3,
        eventName: 'Cooking Class',
        eventDescription: 'Cooking for the community',
        location: 'Community Center',
        requiredSkills: ['cooking'],
        eventDate: new Date('2024-10-01'),
      },
    ]);

    const result = await findMatchingEventsForVolunteer(1);

    expect(result).toEqual([
      {
        id: 1,
        eventName: 'Harvest Event',
        eventDescription: 'Harvesting crops on the farm',
        location: 'Farm',
        requiredSkills: ['harvesting', 'teamwork'],
        eventDate: new Date('2024-08-01'),
      },
      {
        id: 2,
        eventName: 'Team Event',
        eventDescription: 'Team-building activities',
        location: 'Park',
        requiredSkills: ['teamwork'],
        eventDate: new Date('2024-09-01'),
      },
    ]);
  });

  it('should return an empty array if no events match the volunteer’s skills', async () => {
    prisma.userProfile.findUnique.mockResolvedValueOnce({
      skills: ['dancing'], // Skill that doesn't match any event
    });
  
    prisma.eventDetails.findMany.mockResolvedValueOnce([
      {
        id: 1,
        eventName: 'Cooking Contest',
        eventDescription: 'Cook OFF',
        location: 'Houston',
        requiredSkills: ['Cooking'], // Doesn't match 'dancing'
        eventDate: new Date('2024-11-16'),
      },
      {
        id: 2,
        eventName: 'Harvest Festival',
        eventDescription: 'Harvesting crops',
        location: 'Farm',
        requiredSkills: ['Harvesting'],
        eventDate: new Date('2024-12-01'),
      },
    ]);
  
    const result = await findMatchingEventsForVolunteer(1);
  
    expect(result).toEqual([]); // Expect no matches
  });
  
});
