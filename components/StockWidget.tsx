"use client";
import { useEffect, useState } from "react";
import { getRecentStock } from "@/lib/actions/stock.actions";

export default function StockWidget() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      const stockData = await getRecentStock();
      setStock(stockData);
      setLoading(false);
    };

    fetchStock();

    const interval = setInterval(fetchStock, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stock.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              item.status === "good"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
