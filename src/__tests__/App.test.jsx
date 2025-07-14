import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

test('renders navbar and home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/Sage AI/i)).toBeInTheDocument();
  expect(screen.getByText(/Chat with/i)).toBeInTheDocument();
});