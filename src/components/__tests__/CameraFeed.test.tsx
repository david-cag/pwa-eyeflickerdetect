import { render } from '@testing-library/react';
import CameraFeed from '../CameraFeed';

test('renders video element', () => {
  const { container } = render(<CameraFeed />);
  expect(container.querySelector('video')).toBeInTheDocument();
});
