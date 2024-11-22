import handler from '../../pages/api/matching/index';
import { findMatchingEventsForVolunteer } from '../../backend/matchingService';
import authMiddleware from '../../middleware/authMiddleware';
import prisma from '../../lib/prisma';

jest.mock('../../backend/matchingService', () => ({
  findMatchingEventsForVolunteer: jest.fn(),
}));

jest.mock('../../middleware/authMiddleware', () =>
  jest.fn((req, res, next) => next())
);

jest.mock('../../lib/prisma', () => ({
  eventDetails: {
    findMany: jest.fn(),
  },
}));

describe('Matching API', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'POST',
      headers: {
        authorization: 'Bearer mockToken',
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return matching events for a volunteer', async () => {
    req.body = { volunteerId: 1 };

    prisma.eventDetails.findMany.mockResolvedValue([
      {
        id: 1,
        eventName: 'Cooking Contest',
        eventDescription: 'Cook off event',
        location: 'Houston',
        requiredSkills: ['Cooking'],
        eventDate: '2024-12-25',
      },
    ]);

    const mockMatchingEvents = [
      {
        id: 1,
        eventName: 'Cooking Contest',
        eventDescription: 'Cook off event',
        location: 'Houston',
        requiredSkills: ['Cooking'],
        eventDate: '2024-12-25',
      },
    ];

    findMatchingEventsForVolunteer.mockResolvedValue(mockMatchingEvents);

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.eventDetails.findMany).toHaveBeenCalled();
    expect(findMatchingEventsForVolunteer).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMatchingEvents);
  });

  it('should return a message if no matching events are found', async () => {
    req.body = { volunteerId: 1 };

    prisma.eventDetails.findMany.mockResolvedValue([
      {
        id: 2,
        eventName: 'Gardening Workshop',
        eventDescription: 'Learn gardening',
        location: 'Austin',
        requiredSkills: ['Gardening'],
        eventDate: '2024-12-31',
      },
    ]);

    findMatchingEventsForVolunteer.mockResolvedValue([]);

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.eventDetails.findMany).toHaveBeenCalled();
    expect(findMatchingEventsForVolunteer).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'No matching events found for this volunteer' });
  });

  it('should return 400 if volunteer ID is missing', async () => {
    req.body = {};

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(findMatchingEventsForVolunteer).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Volunteer ID is required' });
  });

  it('should return 400 if volunteer ID is not a number', async () => {
    req.body = { volunteerId: 'abc' };

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(findMatchingEventsForVolunteer).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Volunteer ID must be a valid number' });
  });

  it('should return 500 if there is an internal server error', async () => {
    req.body = { volunteerId: 1 };

    prisma.eventDetails.findMany.mockRejectedValue(new Error('Database error'));

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.eventDetails.findMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      details: 'Database error',
    });
  });

  it('should return 405 for unsupported methods', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method Not Allowed' });
  });
});
