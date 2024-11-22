import handler from '../../pages/api/notifications/index';

describe('Notification API', () => {
  it('should get all notifications', async () => {
    const req = { method: 'GET' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should create a new notification', async () => {
    const req = {
      method: 'POST',
      body: {
        volunteerId: 1,
        message: 'Event updated',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Event updated',
    }));
  });

  it('should return 400 for invalid notification data', async () => {
    const req = {
      method: 'POST',
      body: {
        volunteerId: 'invalid-id', // Invalid volunteer ID
        message: '',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      errors: expect.any(Array),
    }));
  });

  it('should get all notifications with increased timeout', async () => {
    const req = { method: 'GET' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  }, 10000); // Increased timeout to 10 seconds

  it('should create a new notification with increased timeout', async () => {
    const req = {
      method: 'POST',
      body: {
        volunteerId: 1,
        message: 'Event updated',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Event updated',
    }));
  }, 10000); // Increased timeout to 10 seconds
});