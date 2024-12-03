"use client";
import { useEffect, useState } from "react";
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

export default function FinancialWidget() {
  const [financialData, setFinancialData] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFinancialData = async () => {
      const { data } = await supabase
        .from("financial_records")
        .select("*")
        .order("date", { ascending: true });
      setFinancialData(data);
    };

    const channel = supabase
      .channel("financial_records")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financial_records" },
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
              .reduce((acc, curr) => acc + curr.amount, 0)
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
