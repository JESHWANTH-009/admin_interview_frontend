import { render, screen } from '@testing-library/react';
import App from './App';

test('renders interview admin sidebar', () => {
  render(<App />);
  const sidebarElement = screen.getByText(/Interview Admin/i);
  expect(sidebarElement).toBeInTheDocument();
});
