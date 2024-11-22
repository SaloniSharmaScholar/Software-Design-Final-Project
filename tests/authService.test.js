import * as authService from '../backend/authService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../lib/prisma', () => ({
  userCredentials: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return user and token', async () => {
      const mockUser = { email: 'test@example.com', password: 'hashedpassword' };
      prisma.userCredentials.create.mockResolvedValueOnce(mockUser);
      bcrypt.hash.mockResolvedValueOnce('hashedpassword');
      jwt.sign.mockReturnValueOnce('mockToken');

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        profile: { fullName: 'John Doe' },
      });

      expect(prisma.userCredentials.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          profile: {
            create: { fullName: 'John Doe' },
          },
        },
      });
      expect(result).toEqual({
        user: mockUser,
        token: 'mockToken',
      });
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Hashing error'));

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          profile: { fullName: 'John Doe' },
        })
      ).rejects.toThrow('Hashing error');
    });
  });

  describe('login', () => {
    it('should login a user and return user and token', async () => {
      const mockUser = { email: 'test@example.com', password: 'hashedpassword' };
      prisma.userCredentials.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mockToken');

      const result = await authService.login('test@example.com', 'password123');

      expect(prisma.userCredentials.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toEqual({
        user: mockUser,
        token: 'mockToken',
      });
    });

    it('should throw an error if user is not found', async () => {
      prisma.userCredentials.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if password is invalid', async () => {
      const mockUser = { email: 'test@example.com', password: 'hashedpassword' };
      prisma.userCredentials.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});


