import { render } from '@testing-library/react';
import AlertDialog from '../AlertDialog';

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine'
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    }
  }),
  destination: {},
  currentTime: 0
}));

// Mock Notification API
global.Notification = { permission: 'denied' } as any;

test('renders alert dialog when open', () => {
  const { getByRole } = render(
    <AlertDialog open={true} onClose={() => {}} severity="warning" message="Test alert" />
  );
  expect(getByRole('alert')).toBeInTheDocument();
});
