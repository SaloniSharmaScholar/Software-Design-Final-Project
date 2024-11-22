import { getEvents, addEvent } from '../backend/eventService';
import { query } from '../lib/db';

jest.mock('../lib/db', () => ({
  query: jest.fn(),
}));

describe('Event Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch all events', async () => {
      const mockEvents = [{ id: 1, event_name: 'Test Event' }];
      query.mockResolvedValueOnce({ rows: mockEvents });

      const result = await getEvents();

      expect(query).toHaveBeenCalledWith('SELECT * FROM events');
      expect(result).toEqual(mockEvents);
    });

    it('should throw an error if fetching events fails', async () => {
      query.mockRejectedValueOnce(new Error('Database error'));

      await expect(getEvents()).rejects.toThrow('Failed to fetch events');
    });
  });

  describe('addEvent', () => {
    it('should add a new event and return it', async () => {
      const mockEvent = {
        event_name: 'Test Event',
        event_description: 'Description',
        location: 'Test Location',
        required_skills: ['skill1', 'skill2'],
        urgency: 'High',
        event_date: '2024-12-01',
      };
      const dbResponse = { rows: [mockEvent] };
      query.mockResolvedValueOnce(dbResponse);

      const result = await addEvent(mockEvent);

      expect(query).toHaveBeenCalledWith(
        'INSERT INTO events (event_name, event_description, location, required_skills, urgency, event_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          mockEvent.event_name,
          mockEvent.event_description,
          mockEvent.location,
          JSON.stringify(mockEvent.required_skills),
          mockEvent.urgency,
          mockEvent.event_date,
        ]
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error for invalid event data', async () => {
      const invalidEvent = { event_name: 'Test Event' }; // Missing required fields

      await expect(addEvent(invalidEvent)).rejects.toThrow('Invalid event data');
    });

    it('should throw an error if adding an event fails', async () => {
      const mockEvent = {
        event_name: 'Test Event',
        event_description: 'Description',
        location: 'Test Location',
        required_skills: ['skill1', 'skill2'],
        urgency: 'High',
        event_date: '2024-12-01',
      };
      query.mockRejectedValueOnce(new Error('Database error'));

      await expect(addEvent(mockEvent)).rejects.toThrow('Failed to add event');
    });
  });
});
