import { render, screen, fireEvent } from '@testing-library/react';
import EARThresholdSlider from '../EARThresholdSlider';

test('renders EAR threshold slider and changes value', () => {
  const handleChange = vi.fn();
  render(<EARThresholdSlider value={0.20} onChange={handleChange} />);
  expect(screen.getByText(/Eye Closure Sensitivity/)).toBeInTheDocument();
  fireEvent.change(screen.getByRole('slider'), { target: { value: 0.25 } });
  expect(handleChange).toHaveBeenCalled();
});

test('displays helpful descriptions', () => {
  render(<EARThresholdSlider value={0.20} onChange={() => {}} />);
  expect(screen.getByText(/Lower values/)).toBeInTheDocument();
  expect(screen.getByText(/Higher values/)).toBeInTheDocument();
  expect(screen.getByText(/Default: 0.20/)).toBeInTheDocument();
});
