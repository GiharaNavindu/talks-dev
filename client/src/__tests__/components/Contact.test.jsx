import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Contact from '../../Contact';
import '@testing-library/jest-dom';

jest.mock('../../Avatar.jsx', () => {
  return function MockAvatar({ username, online }) {
    return <div data-testid="avatar" data-username={username} data-online={online.toString()} />;
  };
});

describe('Contact Component', () => {
  const mockProps = {
    id: 'user123',
    username: 'testUser',
    online: true,
    onClick: jest.fn(),
    selected: false
  };

  test('renders contact with username', () => {
    render(<Contact {...mockProps} />);
    expect(screen.getByText('testUser')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    render(<Contact {...mockProps} />);
    fireEvent.click(screen.getByText('testUser'));
    expect(mockProps.onClick).toHaveBeenCalledWith('user123');
  });

  test('shows selection indicator when selected', () => {
    const { container } = render(<Contact {...mockProps} selected={true} />);
    const selectionIndicator = container.querySelector('.bg-blue-50');
    expect(selectionIndicator).toBeInTheDocument();
  });

  test('passes correct props to Avatar component', () => {
    render(<Contact {...mockProps} />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-username', 'testUser');
    expect(avatar).toHaveAttribute('data-online', 'true');
  });
});