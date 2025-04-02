import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../../Logo';
import '@testing-library/jest-dom';

describe('Logo Component', () => {
  test('renders with correct text', () => {
    render(<Logo />);
    expect(screen.getByText('MernChat')).toBeInTheDocument();
  });

  test('contains SVG icon', () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
