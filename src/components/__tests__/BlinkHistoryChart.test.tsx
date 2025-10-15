import { render } from '@testing-library/react';
import BlinkHistoryChart from '../BlinkHistoryChart';

test('renders chart with blink data', () => {
  const { container } = render(<BlinkHistoryChart blinkTimestamps={[Date.now()]} />);
  expect(container.querySelector('canvas')).toBeInTheDocument();
});
