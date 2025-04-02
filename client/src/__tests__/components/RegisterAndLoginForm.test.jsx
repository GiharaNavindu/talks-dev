import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterAndLoginForm from '../../RegisterAndLoginForm';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import '@testing-library/jest-dom';

// Make sure axios is properly mocked
jest.mock('axios');

describe('RegisterAndLoginForm Component', () => {
  const mockContextValue = {
    setUsername: jest.fn(),
    setId: jest.fn()
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  // Mock implementation for axios.post to return proper data structure
  beforeAll(() => {
    axios.post = jest.fn().mockImplementation((url, data) => {
      if (url === 'login') {
        return Promise.resolve({ data: { id: 'user123' } });
      } else if (url === 'register') {
        return Promise.resolve({ data: { id: 'newuser123' } });
      }
      return Promise.resolve({ data: { id: 'default' } });
    });
  });

  test('renders login form by default', () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <RegisterAndLoginForm />
      </UserContext.Provider>
    );
    
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Dont have an account?')).toBeInTheDocument();
  });

  test('switches to register form when clicking register button', () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <RegisterAndLoginForm />
      </UserContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Already a member?')).toBeInTheDocument();
  });

  test('switches back to login form from register', () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <RegisterAndLoginForm />
      </UserContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Register'));
    fireEvent.click(screen.getByText('Login here'));
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Dont have an account?')).toBeInTheDocument();
  });

  test('submits login form with correct credentials', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <RegisterAndLoginForm />
      </UserContext.Provider>
    );
    
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('login', { username: 'testuser', password: 'password123' });
      expect(mockContextValue.setUsername).toHaveBeenCalledWith('testuser');
      expect(mockContextValue.setId).toHaveBeenCalledWith('user123');
    });
  });

  test('submits register form with correct credentials', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <RegisterAndLoginForm />
      </UserContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Register'));
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('register', { username: 'newuser', password: 'newpassword123' });
      expect(mockContextValue.setUsername).toHaveBeenCalledWith('newuser');
      expect(mockContextValue.setId).toHaveBeenCalledWith('newuser123');
    });
  });
});