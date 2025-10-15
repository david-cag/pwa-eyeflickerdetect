import { render, screen, fireEvent } from '@testing-library/react';
import BlinkThresholdSlider from '../BlinkThresholdSlider';

test('renders slider and changes value', () => {
  const handleChange = vi.fn();
  render(<BlinkThresholdSlider value={10} onChange={handleChange} />);
  expect(screen.getByText(/Low Blink Alert Threshold/)).toBeInTheDocument();
  fireEvent.change(screen.getByRole('slider'), { target: { value: 15 } });
  expect(handleChange).toHaveBeenCalled();
});
