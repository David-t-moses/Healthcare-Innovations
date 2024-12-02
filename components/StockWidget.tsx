"use client";

export default function StockWidget() {
  const stock = [
    { id: 1, name: "Paracetamol", quantity: 500, status: "good" },
    { id: 2, name: "Antibiotics", quantity: 100, status: "low" },
    { id: 3, name: "Bandages", quantity: 200, status: "good" },
  ];

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
