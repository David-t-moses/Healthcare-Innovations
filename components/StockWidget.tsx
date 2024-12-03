"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function StockWidget() {
  const [stock, setStock] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStock = async () => {
      const { data } = await supabase.from("stock_items").select("*");
      setStock(data);
    };

    const channel = supabase
      .channel("stock_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_items" },
        (payload) => {
          fetchStock();
        }
      )
      .subscribe();

    fetchStock();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
