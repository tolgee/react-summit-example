# Tolgee Voting App Development Guidelines

This document provides guidelines and information for developers working on the Tolgee Voting App project.

## Build and Configuration Instructions

### Prerequisites
- Node.js 16+ and npm
- A Tolgee account and project (for translation features)

### Development Setup

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

2. **Configure Environment Variables**
   - Copy `.env` to `.env.development.local`
   - Set `VITE_APP_TOLGEE_API_KEY` to your Tolgee API key
   - Set `VITE_APP_TOLGEE_PROJECT_ID` to your Tolgee project ID

   Server environment variables:
   - `PORT`: Port for the server (default: 3001)
   - `DATA_DIR`: Custom path for the data directory (default: './server/data')

3. **Start Development Servers**
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   npm run develop
   ```

4. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001/api](http://localhost:3001/api)

### Production Build

1. **Build the Application**
   ```bash
   # Build the frontend
   npm run build

   # Build the server
   cd server
   npm run build
   cd ..
   ```

2. **Run in Production Mode**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

Build and run the application using Docker:

```bash
docker build -t vote-app .
docker run -p 3000:3000 -p 3001:3001 -e DATA_DIR=/app/data vote-app
```

You can mount a volume to persist the data:

```bash
docker run -p 3000:3000 -p 3001:3001 -e DATA_DIR=/app/data -v $(pwd)/data:/app/data vote-app
```

### Kubernetes Deployment

1. Update the configuration in `kubernetes/configmap.yaml` and `kubernetes/secret.yaml`
2. Deploy to your Kubernetes cluster:
   ```bash
   kubectl apply -k kubernetes/
   ```

## Testing Information

### Testing Framework

The project uses Jest for testing, with the following setup:
- TypeScript support via ts-jest
- Supertest for API testing
- Jest mocking for isolating components

### Running Tests

```bash
# Run all tests
cd server
npm test

# Run specific test file
npm test -- src/path/to/test.ts
```

### Test File Structure

Test files should be placed in the same directory as the file they're testing, with a `.test.ts` or `.spec.ts` extension.

Example test file structure:
```typescript
import { functionToTest } from './file-being-tested';
import { foo } from './dependency'

// Mock dependencies
jest.mock('./dependency');
const mockedFoo = jest.mocked(foo, true)

describe('Module or Function Name', () => {
  beforeEach(() => {
    // Setup code, reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup code
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test input';
    mockedFoo.mockReturnValueOnce('something');

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe('expected output');
  });

  // More test cases...
});
```

### Writing New Tests

1. **Create a new test file** with the `.test.ts` extension
2. **Import the module** you want to test
3. **Mock dependencies** to isolate the code being tested
4. **Write test cases** using Jest's `describe` and `it` functions
5. **Run the tests** to verify they pass

## Code Style and Development Practices

### TypeScript

- The project uses TypeScript for both frontend and backend
- Strict type checking is enabled
- Use explicit type annotations for function parameters and return types
- Use interfaces for complex object types

### Backend (Node.js/Express)

- Use async/await for asynchronous operations
- Promisify callback-based APIs (like SQLite) for easier use with async/await
- Use proper error handling with try/catch blocks
- Log errors with appropriate context
- Use environment variables for configuration

### Database (SQLite)

- Database operations are promisified for use with async/await
- Use parameterized queries to prevent SQL injection
- Tables use STRICT mode for better type safety
- Foreign key constraints are enabled

### WebSockets

- WebSockets are used for real-time updates
- The server broadcasts updates to all connected clients when data changes
- Error handling is implemented for WebSocket operations

### Frontend (React)

- The frontend is built with React and Vite
- Tolgee is used for internationalization
- Components are organized by feature
- State management is handled through React hooks

### Error Handling

- Use try/catch blocks for error handling
- Log errors with appropriate context
- Return appropriate HTTP status codes for API errors
- Provide meaningful error messages to clients

### Testing

- Write tests for all new functionality
- Mock dependencies to isolate the code being tested
- Test both success and error paths
- Use descriptive test names that explain what is being tested
- Run tests with coverage reports to ensure adequate test coverage
- Verify that tests are actually testing the implementation, not just the mocks

#### Testing Best Practices and Common Pitfalls

1. **Don't mock the module under test**
   - ❌ **Incorrect**: Mocking the module you're trying to test
     ```typescript
     // This is wrong - you're not testing the actual implementation
     jest.mock('./db');
     ```
   - ✅ **Correct**: Only mock external dependencies
     ```typescript
     // This is correct - mock only external dependencies
     jest.mock('sqlite3');
     ```

2. **Test actual behavior, not just function calls**

3. **Include error handling tests**
   - Always test both success and error paths
   - Verify that errors are properly caught and handled

4. **Check coverage reports**
   - Read coverage reports to identify untested code
   - Aim for high coverage of critical functionality
