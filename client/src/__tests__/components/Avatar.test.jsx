import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from '../../Avatar';
import '@testing-library/jest-dom';

describe('Avatar Component', () => {
  const userId = '1234567890abcdef';
  const username = 'testUser';

  test('renders with correct username initial', () => {
    render(<Avatar userId={userId} username={username} online={true} />);
    expect(screen.getByText('t')).toBeInTheDocument();
  });

  test('displays online status correctly', () => {
    const { container } = render(<Avatar userId={userId} username={username} online={true} />);
    const onlineIndicator = container.querySelector('.bg-green-400');
    expect(onlineIndicator).toBeInTheDocument();
  });

  test('displays offline status correctly', () => {
    const { container } = render(<Avatar userId={userId} username={username} online={false} />);
    const offlineIndicator = container.querySelector('.bg-gray-400');
    expect(offlineIndicator).toBeInTheDocument();
  });

  test('assigns consistent color based on userId', () => {
    const { container: container1 } = render(<Avatar userId={userId} username={username} online={true} />);
    const { container: container2 } = render(<Avatar userId={userId} username="differentUser" online={true} />);
    
    const avatarDiv1 = container1.querySelector('div').className;
    const avatarDiv2 = container2.querySelector('div').className;
    
    expect(avatarDiv1).toEqual(avatarDiv2);
  });
});