import request from 'supertest';
import server from './index';
import { getOptionsWithVotes, addVote } from './db';
import { broadcastOptions } from './websocket';

// Mock db module
jest.mock('./db', () => ({
  initDb: jest.fn().mockResolvedValue(undefined),
  getOptionsWithVotes: jest.fn(),
  addVote: jest.fn(),
  closeDb: jest.fn()
}));

// Mock websocket module
jest.mock('./websocket', () => ({
  initWebSocket: jest.fn(),
  broadcastOptions: jest.fn().mockResolvedValue(undefined)
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/options', () => {
    it('should return options with vote counts', async () => {
      const mockOptions = [
        { id: 1, text: 'React', votes: 5 },
        { id: 2, text: 'Vue', votes: 3 }
      ];

      (getOptionsWithVotes as jest.Mock).mockResolvedValue(mockOptions);

      const response = await request(server).get('/api/options');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOptions);
      expect(getOptionsWithVotes).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (getOptionsWithVotes as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(server).get('/api/options');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to get options' });
    });
  });

  describe('POST /api/vote', () => {
    it('should add a vote and broadcast updates', async () => {
      const mockResult = { success: true, id: 123 };
      (addVote as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(server)
        .post('/api/vote')
        .send({ option: 'React', email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(addVote).toHaveBeenCalledWith('React', 'test@example.com');
      expect(broadcastOptions).toHaveBeenCalled();
    });

    it('should handle missing option', async () => {
      const response = await request(server)
        .post('/api/vote')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Option is required' });
      expect(addVote).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (addVote as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(server)
        .post('/api/vote')
        .send({ option: 'React' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to add vote' });
    });

    it('should accept vote without email', async () => {
      const mockResult = { success: true, id: 124 };
      (addVote as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(server)
        .post('/api/vote')
        .send({ option: 'Vue' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(addVote).toHaveBeenCalledWith('Vue', undefined);
    });
  });
});
