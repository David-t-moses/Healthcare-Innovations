"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialWidget() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "rgb(59, 130, 246)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold">Total Revenue</h4>
          <p className="text-3xl font-bold text-blue-600">$123,456</p>
        </div>
        <select className="border rounded-lg px-2">
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </div>
      <Line data={data} options={{ responsive: true }} />
    </div>
  );
}
