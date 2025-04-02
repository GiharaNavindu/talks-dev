import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserContextProvider, UserContext } from '../../UserContext';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches user profile on mount', async () => {
    // Setup mock axios response
    axios.get.mockResolvedValue({
      data: {
        userId: 'user123',
        username: 'testUser'
      }
    });

    const TestComponent = () => {
      const context = React.useContext(UserContext);
      return (
        <div>
          <div data-testid="username">{context.username || ''}</div>
          <div data-testid="userId">{context.id || ''}</div>
        </div>
      );
    };

    render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>
    );

    // Initially the values should be null
    expect(screen.getByTestId('username').textContent).toBe('');
    expect(screen.getByTestId('userId').textContent).toBe('');

    // Wait for the axios call to resolve and context to update
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/profile');
      expect(screen.getByTestId('username').textContent).toBe('testUser');
      expect(screen.getByTestId('userId').textContent).toBe('user123');
    });
  });

  test('provides setter functions', async () => {
    // Setup mock axios response to prevent warnings
    axios.get.mockResolvedValue({
      data: {
        userId: 'user123',
        username: 'testUser'
      }
    });
    
    const TestComponent = () => {
      const { username, id, setUsername, setId } = React.useContext(UserContext);
      return (
        <div>
          <div data-testid="username">{username || ''}</div>
          <div data-testid="userId">{id || ''}</div>
          <button 
            data-testid="set-username" 
            onClick={() => setUsername('newUser')}
          >
            Set Username
          </button>
          <button 
            data-testid="set-id" 
            onClick={() => setId('newId')}
          >
            Set ID
          </button>
        </div>
      );
    };

    render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>
    );

    // Verify that setter functions are available by using them
    const setUsernameButton = screen.getByTestId('set-username');
    const setIdButton = screen.getByTestId('set-id');
    
    // Check if buttons exist
    expect(setUsernameButton).toBeTruthy();
    expect(setIdButton).toBeTruthy();
    
    // Wait for initial context load
    await waitFor(() => {
      expect(screen.getByTestId('username').textContent).toBe('testUser');
    });
    
    // Test setters
    userEvent.click(setUsernameButton);
    userEvent.click(setIdButton);
    
    // Verify state updates
    await waitFor(() => {
      expect(screen.getByTestId('username').textContent).toBe('newUser');
      expect(screen.getByTestId('userId').textContent).toBe('newId');
    });
  });
});