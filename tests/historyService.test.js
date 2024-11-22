import * as historyService from '../backend/historyService';

describe('History Service', () => {
  test('should fetch all volunteer history', async () => {
    const result = await historyService.getVolunteerHistory();
    expect(result).toBeInstanceOf(Array);
  });

  test('should add a history record', async () => {
    const history = {
      volunteerId: 1,
      eventId: 1,
      participationStatus: 'confirmed',
    };

    const result = await historyService.addVolunteerHistory(history);
    expect(result).toHaveProperty('participationStatus', 'confirmed');
  });

  test('should throw error for invalid data', async () => {
    const history = { volunteerId: null }; // Missing required fields
    await expect(historyService.addVolunteerHistory(history)).rejects.toThrow(
      'Invalid data'
    );
  });
});
