import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface EARThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const EARThresholdSlider: React.FC<EARThresholdSliderProps> = ({ value, onChange }) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Eye Closure Sensitivity (EAR Threshold) 💾
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={handleChange}
          aria-label="EAR threshold"
          valueLabelDisplay="auto"
          step={0.01}
          marks={[
            { value: 0.15, label: '0.15' },
            { value: 0.20, label: '0.20' },
            { value: 0.25, label: '0.25' },
            { value: 0.30, label: '0.30' },
            { value: 0.35, label: '0.35' },
            { value: 0.40, label: '0.40' },
            { value: 0.45, label: '0.45' }
          ]}
          min={0.15}
          max={0.45}
          sx={{
            '& .MuiSlider-valueLabel': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            },
            '& .MuiSlider-markLabel': {
              fontSize: { xs: '0.65rem', sm: '0.75rem' }
            }
          }}
        />
      </Box>
      <Typography variant="caption" color="textSecondary">
        <strong>Lower values (0.15-0.25)</strong>: Less sensitive, requires eyes to close more. 
        <strong>Higher values (0.30-0.45)</strong>: More sensitive, detects blinks when eyes partially close or when looking sideways.
        <br /><em>Settings are automatically saved.</em>
      </Typography>
    </Box>
  );
};

export default EARThresholdSlider;
