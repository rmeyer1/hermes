// src/components/OddsTrendChart.tsx
import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

interface OddsTrendChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  bookmakerFilter?: string;
  marketType: 'h2h' | 'spreads' | 'totals';
}

const OddsTrendChart: React.FC<OddsTrendChartProps> = ({ data, bookmakerFilter, marketType }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create a new chart instance
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: data.datasets,
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Time',
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: marketType === 'h2h' ? 'Odds' : 'Points',
                },
              },
            },
          },
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, marketType]); // Re-render chart when data or marketType changes

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <canvas ref={chartRef} className="w-full h-64" />
    </div>
  );
};

export default OddsTrendChart;