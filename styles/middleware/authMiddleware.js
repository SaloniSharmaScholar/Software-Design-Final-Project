// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('No Authorization header provided');
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Token is missing in Authorization header');
    return res.status(401).json({ error: 'Token missing in Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await prisma.userCredentials.findUnique({ where: { email: decoded.email } });
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authMiddleware;
