import handler from '../../pages/api/history/index';
import { getVolunteerHistory, addVolunteerHistory } from '../../backend/historyService';
import authMiddleware from '../../middleware/authMiddleware';

jest.mock('../../backend/historyService', () => ({
  getVolunteerHistory: jest.fn(),
  addVolunteerHistory: jest.fn(),
}));

jest.mock('../../middleware/authMiddleware', () =>
  jest.fn((req, res, next) => next())
);

describe('History API', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer mockToken', // Mock the Authorization header
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

  describe('GET /api/history', () => {
    it('should fetch volunteer history successfully', async () => {
      const mockHistory = [
        { id: 1, volunteerId: 1, eventId: 2, participationStatus: 'completed' },
      ];
      getVolunteerHistory.mockResolvedValue(mockHistory);

      req.method = 'GET';

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(getVolunteerHistory).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });

    it('should return a 500 error if fetching history fails', async () => {
      getVolunteerHistory.mockRejectedValue(new Error('Database error'));

      req.method = 'GET';

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(getVolunteerHistory).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch history' });
    });
  });

  describe('POST /api/history', () => {
    it('should add a new volunteer history record', async () => {
      const mockRecord = {
        id: 1,
        volunteerId: 1,
        eventId: 2,
        participationStatus: 'completed',
      };
      addVolunteerHistory.mockResolvedValue(mockRecord);

      req.method = 'POST';
      req.body = {
        volunteerId: 1,
        eventId: 2,
        participationStatus: 'completed',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(addVolunteerHistory).toHaveBeenCalledWith(1, 2, 'completed');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should return 400 if required fields are missing', async () => {
      req.method = 'POST';
      req.body = {
        volunteerId: null,
        eventId: 2,
        participationStatus: 'completed',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(addVolunteerHistory).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return a 500 error if adding history fails', async () => {
      addVolunteerHistory.mockRejectedValue(new Error('Database error'));

      req.method = 'POST';
      req.body = {
        volunteerId: 1,
        eventId: 2,
        participationStatus: 'completed',
      };

      await handler(req, res);

      expect(authMiddleware).toHaveBeenCalled();
      expect(addVolunteerHistory).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add history record' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    req.method = 'PUT';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
