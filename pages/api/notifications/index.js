import prisma from '@/lib/prisma';
import authMiddleware from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  await authMiddleware(req, res, async () => {
    const { id: volunteerId } = req.user; // Extract logged-in user's ID from token

    if (req.method === 'GET') {
      try {
        const notifications = await prisma.notification.findMany({
          where: { volunteerId },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
}