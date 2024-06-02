'use client';

import {
  Chart as ChartJS,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { FC } from 'react';
import { Bar } from 'react-chartjs-2';

import { Booking } from '@/models/booking';

ChartJS.register(Tooltip, CategoryScale, LinearScale, BarElement);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

const Chart: FC<{ userBookings: Booking[] }> = ({ userBookings }) => {
  const labels = userBookings.map(booking => booking.facility.name);

  return (
    <Bar
      options={options}
      data={{
        labels,
        datasets: [
          {
            label: 'Amount spent',
            data: "nothing",
            borderWidth: 1,
            backgroundColor: '#F27405',
            hoverBackgroundColor: '#F2C641',
          },
        ],
      }}
    />
  );
};

export default Chart;
