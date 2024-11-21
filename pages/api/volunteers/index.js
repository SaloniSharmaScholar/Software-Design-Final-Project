
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const volunteers = await prisma.userProfile.findMany();
      res.status(200).json(volunteers);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}



