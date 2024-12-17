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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("PaymentHistory")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw new Error(error.message);
        setFinancialData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    const channel = supabase
      .channel("payment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "PaymentHistory" },
        (payload) => {
          fetchFinancialData();
        }
      )
      .subscribe();

    fetchFinancialData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return <div>Loading financial data...</div>;
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
