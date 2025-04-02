import React from 'react';
import { render } from '@testing-library/react';
import Routes from '../Routes';
import { UserContext } from '../UserContext';
import '@testing-library/jest-dom';

jest.mock('../RegisterAndLoginForm.jsx', () => {
  return function MockRegisterAndLoginForm() {
    return <div data-testid="register-login-form">RegisterAndLoginForm</div>;
  };
});

jest.mock('../Chat', () => {
  return function MockChat() {
    return <div data-testid="chat">Chat</div>;
  };
});

describe('Routes Component', () => {
  test('renders RegisterAndLoginForm when user is not logged in', () => {
    const mockContextValue = {
      username: null,
      id: null
    };

    const { getByTestId } = render(
      <UserContext.Provider value={mockContextValue}>
        <Routes />
      </UserContext.Provider>
    );

    expect(getByTestId('register-login-form')).toBeInTheDocument();
  });

  test('renders Chat when user is logged in', () => {
    const mockContextValue = {
      username: 'testUser',
      id: 'user123'
    };

    const { getByTestId } = render(
      <UserContext.Provider value={mockContextValue}>
        <Routes />
      </UserContext.Provider>
    );

    expect(getByTestId('chat')).toBeInTheDocument();
  });
});