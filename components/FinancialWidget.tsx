"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
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

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: string;
  patientId: string;
  userId: string;
}

export default function FinancialWidget() {
  const [financialData, setFinancialData] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        // Mock data for now
        const mockData: PaymentRecord[] = [
          { id: '1', amount: 1000, date: '2024-01-01', status: 'completed', patientId: '1', userId: '1' },
          { id: '2', amount: 1500, date: '2024-02-01', status: 'completed', patientId: '2', userId: '1' },
          { id: '3', amount: 2000, date: '2024-03-01', status: 'completed', patientId: '3', userId: '1' },
        ];
        setFinancialData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!financialData.length) {
    return <div>No financial data available</div>;
  }

  const data = {
    labels: financialData.map((record) => format(new Date(record.date), "MMM")),
    datasets: [
      {
        label: "Revenue",
        data: financialData.map((record) => record.amount),
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
          <p className="text-3xl font-bold text-blue-600">
            $
            {financialData
              .reduce((acc, curr) => acc + Number(curr.amount), 0)
              .toLocaleString()}
          </p>
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
