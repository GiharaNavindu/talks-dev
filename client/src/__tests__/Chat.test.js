import { render, screen } from '@testing-library/react';
import Chat from '../Chat';

test('renders chat component', () => {
  render(<Chat />);
  expect(screen.getByText(/Select a person/i)).toBeInTheDocument();
});