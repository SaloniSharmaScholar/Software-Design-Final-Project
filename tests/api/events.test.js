import handler from '../../pages/api/events/index';
import prisma from '../../lib/prisma';
import authMiddleware from '../../middleware/authMiddleware';

jest.mock('../../lib/prisma', () => ({
  eventDetails: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

jest.mock('../../middleware/authMiddleware', () =>
  jest.fn((req, res, next) => next())
);

describe('Event API', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer mockToken', // Mock the Authorization header
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should fetch all events', async () => {
      const mockEvents = [
        {
          id: 1,
          eventName: 'Event 1',
          eventDescription: 'Description 1',
          location: 'Location 1',
          requiredSkills: ['skill1', 'skill2'],
          urgency: 'High',
          eventDate: new Date('2024-11-16'),
        },
      ];
      prisma.eventDetails.findMany.mockResolvedValue(mockEvents);

      req.method = 'GET';

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(prisma.eventDetails.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return a 500 error if fetching events fails', async () => {
      prisma.eventDetails.findMany.mockRejectedValue(new Error('Database error'));

      req.method = 'GET';

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(prisma.eventDetails.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'New Event',
        eventDescription: 'A fun event',
        location: 'Test Location',
        requiredSkills: ['fun', 'teamwork'],
        urgency: 'Medium',
        eventDate: new Date('2024-12-25'),
      };
      prisma.eventDetails.create.mockResolvedValue(mockEvent);

      req.method = 'POST';
      req.body = {
        eventName: 'New Event',
        eventDescription: 'A fun event',
        location: 'Test Location',
        requiredSkills: ['fun', 'teamwork'],
        urgency: 'Medium',
        eventDate: '2024-12-25',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(prisma.eventDetails.create).toHaveBeenCalledWith({
        data: {
          eventName: 'New Event',
          eventDescription: 'A fun event',
          location: 'Test Location',
          requiredSkills: ['fun', 'teamwork'],
          urgency: 'Medium',
          eventDate: new Date('2024-12-25'),
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 400 if required fields are missing', async () => {
      req.method = 'POST';
      req.body = {
        eventName: '',
        eventDescription: 'Description',
        location: 'Location',
        requiredSkills: ['skill1'],
        urgency: 'High',
        eventDate: '',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 500 if event creation fails', async () => {
      prisma.eventDetails.create.mockRejectedValue(new Error('Database error'));

      req.method = 'POST';
      req.body = {
        eventName: 'New Event',
        eventDescription: 'A fun event',
        location: 'Test Location',
        requiredSkills: ['fun', 'teamwork'],
        urgency: 'Medium',
        eventDate: '2024-12-25',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(prisma.eventDetails.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    req.method = 'PUT';

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST', 'GET']);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
