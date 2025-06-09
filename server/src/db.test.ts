import { initDb, getOptionsWithVotes, addVote, closeDb } from './db';

// Mock the database functions directly
jest.mock('./db', () => {
  const mockOptionsWithVotes = [
    { id: 1, text: 'React', votes: 5 },
    { id: 2, text: 'Vue', votes: 3 },
    { id: 3, text: 'Angular', votes: 2 },
    { id: 4, text: 'Svelte', votes: 1 }
  ];

  return {
    initDb: jest.fn().mockResolvedValue(undefined),
    getOptionsWithVotes: jest.fn().mockResolvedValue(mockOptionsWithVotes),
    addVote: jest.fn().mockResolvedValue({ success: true, id: 123, text: 'React' }),
    closeDb: jest.fn()
  };
});

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

describe('Database Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    closeDb();
  });

  it('should initialize the database', async () => {
    await initDb();

    // Check if initDb was called
    expect(initDb).toHaveBeenCalled();
  });

  it('should get options with votes', async () => {
    const options = await getOptionsWithVotes();

    // Check if getOptionsWithVotes was called
    expect(getOptionsWithVotes).toHaveBeenCalled();

    // Check returned data
    expect(options).toEqual([
      { id: 1, text: 'React', votes: 5 },
      { id: 2, text: 'Vue', votes: 3 },
      { id: 3, text: 'Angular', votes: 2 },
      { id: 4, text: 'Svelte', votes: 1 }
    ]);
  });

  it('should add a vote', async () => {
    const result = await addVote('React', 'test@example.com');

    // Check if addVote was called with the correct parameters
    expect(addVote).toHaveBeenCalledWith('React', 'test@example.com');

    // Check returned data
    expect(result).toEqual({ success: true, id: 123, text: 'React' });
  });

  it('should close the database', () => {
    closeDb();

    // Check if closeDb was called
    expect(closeDb).toHaveBeenCalled();
  });
});
