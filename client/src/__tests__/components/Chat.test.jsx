import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Chat from '../../Chat';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import '@testing-library/jest-dom';

jest.mock('axios');
jest.mock('../../Logo.jsx', () => {
  return function MockLogo() {
    return <div data-testid="logo">MernChat</div>;
  };
});
jest.mock('../../Contact.jsx', () => {
  return function MockContact({ id, username, online, onClick, selected }) {
    return (
      <div 
        data-testid={`contact-${id}`} 
        data-online={online.toString()}
        data-selected={selected.toString()}
        onClick={onClick}
      >
        {username}
      </div>
    );
  };
});

describe('Chat Component', () => {
  const mockContextValue = {
    username: 'currentUser',
    id: 'current123',
    setId: jest.fn(),
    setUsername: jest.fn()
  };
  
  let mockWs;
  
  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    mockWs = {
      addEventListener: jest.fn(),
      send: jest.fn(),
      close: jest.fn()
    };
    
    global.WebSocket = jest.fn().mockImplementation(() => mockWs);
    
    axios.get.mockImplementation((url) => {
      if (url === '/people') {
        return Promise.resolve({ 
          data: [
            { _id: 'user1', username: 'User One' },
            { _id: 'user2', username: 'User Two' }
          ]
        });
      }
      if (url.startsWith('/messages/')) {
        return Promise.resolve({
          data: [
            { _id: 'msg1', text: 'Hello', sender: 'user1', recipient: 'current123' },
            { _id: 'msg2', text: 'Hi there', sender: 'current123', recipient: 'user1' }
          ]
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    axios.post.mockResolvedValue({});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    delete window.HTMLElement.prototype.scrollIntoView;
  });

  test('initializes WebSocket connection', () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <Chat />
      </UserContext.Provider>
    );
    
    expect(WebSocket).toHaveBeenCalledWith('ws://localhost:4040');
    expect(mockWs.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockWs.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
  });

  test('displays online people message when no user selected', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <Chat />
      </UserContext.Provider>
    );
    
    // Simulate WebSocket message for online people
    const handleMessage = mockWs.addEventListener.mock.calls.find(call => call[0] === 'message')[1];
    
    await act(async () => {
      handleMessage({ 
        data: JSON.stringify({
          online: [
            { userId: 'user1', username: 'User One' },
            { userId: 'user2', username: 'User Two' }
          ]
        })
      });
    });
    
    expect(screen.getByText('← Select a person from the sidebar')).toBeInTheDocument();
  });

  test('logs out user', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <Chat />
      </UserContext.Provider>
    );
    
    await act(async () => {
      fireEvent.click(screen.getByText('logout'));
    });
    
    expect(axios.post).toHaveBeenCalledWith('/logout');
    expect(mockContextValue.setId).toHaveBeenCalledWith(null);
    expect(mockContextValue.setUsername).toHaveBeenCalledWith(null);
  });

  test('selects a user and loads messages', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <Chat />
      </UserContext.Provider>
    );
    
    // Simulate WebSocket message for online people
    const handleMessage = mockWs.addEventListener.mock.calls.find(call => call[0] === 'message')[1];
    
    await act(async () => {
      handleMessage({ 
        data: JSON.stringify({
          online: [
            { userId: 'user1', username: 'User One' },
            { userId: 'user2', username: 'User Two' }
          ]
        })
      });
    });
    
    expect(screen.getByTestId('contact-user1')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('contact-user1'));
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/messages/user1');
    });
    
    // Wait for messages to be rendered
    await waitFor(() => {
      const messages = screen.getAllByText(/Hello|Hi there/i);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  test('sends a message', async () => {
    render(
      <UserContext.Provider value={mockContextValue}>
        <Chat />
      </UserContext.Provider>
    );
    
    // Setup online people and select a user
    const handleMessage = mockWs.addEventListener.mock.calls.find(call => call[0] === 'message')[1];
    
    await act(async () => {
      handleMessage({ 
        data: JSON.stringify({
          online: [{ userId: 'user1', username: 'User One' }]
        })
      });
    });
    
    expect(screen.getByTestId('contact-user1')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('contact-user1'));
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/messages/user1');
    });
    
    // Ensure the form is visible
    const inputField = await waitFor(() => {
      return screen.getByPlaceholderText('Type your message here');
    });
    
    // Type and send a message
    await act(async () => {
      fireEvent.change(inputField, {
        target: { value: 'New test message' }
      });
    });
    
    await act(async () => {
      fireEvent.submit(inputField.closest('form'));
    });
    
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
      recipient: 'user1',
      text: 'New test message',
      file: null
    }));
    
    // Check if message is added to the UI
    await waitFor(() => {
      expect(screen.getByText('New test message')).toBeInTheDocument();
    });
  });
});