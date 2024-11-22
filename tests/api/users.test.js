import handler from '../../pages/api/users/index';
import prisma from '../../lib/prisma';
import authMiddleware from '../../middleware/authMiddleware';

jest.mock('../../lib/prisma', () => ({
  userProfile: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../middleware/authMiddleware', () =>
  jest.fn((req, res, next) => {
    req.user = { id: 1 }; // Mock authenticated user
    next();
  })
);

describe('Users API', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'GET',
      headers: {
        authorization: 'Bearer mockToken',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return the user profile when authenticated', async () => {
    const mockUserProfile = {
      userId: 1,
      fullName: 'John Doe',
      skills: ['Programming', 'Teamwork'],
      user: { email: 'johndoe@example.com' },
    };

    prisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: { user: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUserProfile);
  });

  it('should return 404 if the user profile is not found', async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: { user: true },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User profile not found' });
  });

  it('should return 401 if the user is not authenticated', async () => {
    authMiddleware.mockImplementationOnce((req, res, next) => {
      req.user = null; // Simulate unauthenticated user
      next();
    });

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.userProfile.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
  });

  it('should return 500 if there is an internal server error', async () => {
    prisma.userProfile.findUnique.mockRejectedValue(new Error('Database error'));

    await handler(req, res);

    expect(authMiddleware).toHaveBeenCalled();
    expect(prisma.userProfile.findUnique).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

