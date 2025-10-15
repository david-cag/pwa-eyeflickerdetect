import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Box, Typography } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BlinkHistoryChartProps {
  blinkTimestamps: number[];
}

const BlinkHistoryChart: React.FC<BlinkHistoryChartProps> = ({ blinkTimestamps }) => {
  const chartData = useMemo(() => {
    if (blinkTimestamps.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group blinks into 30-second intervals for the chart
    const now = Date.now();
    const timeWindow = 600000; // Show last 10 minutes (600 seconds)
    const intervalSize = 30000; // 30-second intervals
    const numIntervals = 20; // 600 seconds / 30 seconds
    
    // Create intervals
    const intervals: { start: number; end: number; count: number; label: string }[] = [];
    for (let i = numIntervals - 1; i >= 0; i--) {
      const end = now - (i * intervalSize);
      const start = end - intervalSize;
      const minutesAgo = Math.floor((now - end) / 60000);
      const secondsAgo = Math.floor(((now - end) % 60000) / 1000);
      
      let label: string;
      if (minutesAgo === 0 && secondsAgo === 0) {
        label = 'Now';
      } else if (minutesAgo === 0) {
        label = `-${secondsAgo}s`;
      } else if (secondsAgo === 0) {
        label = `-${minutesAgo}m`;
      } else {
        label = `-${minutesAgo}m${secondsAgo}s`;
      }
      
      intervals.push({
        start,
        end,
        count: 0,
        label
      });
    }
    
    // Count blinks in each interval
    blinkTimestamps.forEach(timestamp => {
      if (timestamp > now - timeWindow) {
        const interval = intervals.find(int => timestamp >= int.start && timestamp < int.end);
        if (interval) {
          interval.count++;
        }
      }
    });
    
    // Convert to blinks per minute (multiply by 2 since we have 30-second intervals)
    const blinksPerMinute = intervals.map(int => int.count * 2);
    
    return {
      labels: intervals.map(int => int.label),
      datasets: [
        {
          label: 'Blinks/Minute',
          data: blinksPerMinute,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [blinkTimestamps]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Blink Rate History (Last 10 Minutes)',
        font: {
          size: 13
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} blinks/min`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Blinks/Min',
          font: {
            size: 10
          }
        },
        ticks: {
          stepSize: 5,
          font: {
            size: 9
          }
        }
      },
      x: {
        title: {
          display: false
        },
        ticks: {
          font: {
            size: 9
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  if (blinkTimestamps.length === 0) {
    return (
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Start blinking to see the history...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default BlinkHistoryChart;
