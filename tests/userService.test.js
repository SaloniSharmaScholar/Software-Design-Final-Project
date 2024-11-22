import userService from '../backend/userService';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  userCredentials: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should retrieve all users', async () => {
      const mockUsers = [
        { id: 1, email: 'test1@example.com', password: 'hashedpassword1' },
        { id: 2, email: 'test2@example.com', password: 'hashedpassword2' },
      ];
      prisma.userCredentials.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getUsers();

      expect(prisma.userCredentials.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('addUser', () => {
    it('should add a new user', async () => {
      const mockUser = { email: 'test3@example.com', password: 'hashedpassword3' };
      const createdUser = { id: 3, ...mockUser };
      prisma.userCredentials.create.mockResolvedValue(createdUser);

      const result = await userService.addUser(mockUser);

      expect(prisma.userCredentials.create).toHaveBeenCalledTimes(1);
      expect(prisma.userCredentials.create).toHaveBeenCalledWith({
        data: mockUser,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if prisma throws an error', async () => {
      const mockUser = { email: 'error@example.com', password: 'errorpassword' };
      prisma.userCredentials.create.mockRejectedValue(new Error('Prisma Error'));

      await expect(userService.addUser(mockUser)).rejects.toThrow('Prisma Error');
      expect(prisma.userCredentials.create).toHaveBeenCalledTimes(1);
    });
  });
});

