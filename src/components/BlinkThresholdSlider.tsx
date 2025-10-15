import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface BlinkThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const BlinkThresholdSlider: React.FC<BlinkThresholdSliderProps> = ({ value, onChange }) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Low Blink Alert Threshold (blinks/minute)
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={handleChange}
          aria-label="Blink threshold"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={5}
          max={20}
          sx={{
            '& .MuiSlider-valueLabel': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </Box>
      <Typography variant="caption" color="textSecondary">
        Alert when blinks/min is above 0 and below {value}. Normal rate: 15-20 blinks/min.
      </Typography>
    </Box>
  );
};

export default BlinkThresholdSlider;
