import prisma from '../../../lib/prisma';
import authMiddleware from '../../../middleware/authMiddleware';

export default async function handler(req, res) {
  await authMiddleware(req, res, async () => {
    const { user } = req; // user obtained from the auth middleware
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.method === 'PUT') {
      const { fullName, address1, address2, city, state, zipCode, skills, preferences, availability } = req.body;

      try {
        const updatedProfile = await prisma.userProfile.update({
          where: { userId: user.id },
          data: { fullName, address1, address2, city, state, zipCode, skills, preferences, availability },
        });

        return res.status(200).json(updatedProfile);
      } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
    } else {
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} not allowed`);
    }
  });
}
