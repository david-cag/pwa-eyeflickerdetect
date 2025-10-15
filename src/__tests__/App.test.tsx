import { render } from '@testing-library/react';
import App from '../App';

test('renders main app title', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Eye Flicker Detect/)).toBeInTheDocument();
});
