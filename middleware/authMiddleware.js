import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token; // Read the token from cookies
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const user = await prisma.userCredentials.findUnique({ where: { email: decoded.email } });

    if (!user) {
      console.log('No user found for token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authMiddleware;
