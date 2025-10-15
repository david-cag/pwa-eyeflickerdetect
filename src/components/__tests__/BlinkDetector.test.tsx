import { render } from '@testing-library/react';
import BlinkDetector from '../BlinkDetector';

test('renders BlinkDetector UI', () => {
  const { getByText } = render(<BlinkDetector />);
  expect(getByText('Blink Statistics')).toBeInTheDocument();
});
