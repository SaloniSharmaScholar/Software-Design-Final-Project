import * as notificationService from '../backend/notificationService';

describe('Notification Service', () => {
  test('should fetch notifications', async () => {
    const result = await notificationService.getNotifications();
    expect(result).toBeInstanceOf(Array);
  });

  test('should add a notification', async () => {
    const notification = {
      volunteerId: 1,
      message: 'Test notification',
    };

    const result = await notificationService.addNotification(notification);
    expect(result).toHaveProperty('message', 'Test notification');
  });

  test('should throw error for missing data', async () => {
    const notification = { volunteerId: null }; // Missing required fields
    await expect(notificationService.addNotification(notification)).rejects.toThrow(
      'Invalid data'
    );
  });
});
