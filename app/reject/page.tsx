"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { rejectOrder } from "@/lib/actions/stock.actions";

export default function RejectOrderPage() {
  const searchParams = useSearchParams();
  const orderIds = searchParams?.get("ids")?.split(",") || [];
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<
    "input" | "processing" | "success" | "error"
  >("input");
  const [progress, setProgress] = useState({
    current: 0,
    total: orderIds.length,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIds.length && reason) {
      setStatus("processing");
      setProgress({ current: 0, total: orderIds.length });

      try {
        const results = await Promise.allSettled(
          orderIds.map(async (id, index) => {
            const result = await rejectOrder(id.trim(), reason);
            setProgress((prev) => ({ ...prev, current: index + 1 }));
            return result;
          })
        );

        const failures = results.filter(
          (r) => r.status === "rejected"
        ) as PromiseRejectedResult[];

        if (failures.length > 0) {
          const errorMessages = failures
            .map((f) => f.reason?.message || "Unknown error")
            .join(", ");
          throw new Error(
            `Failed to reject ${failures.length} ${
              failures.length === 1 ? "order" : "orders"
            }: ${errorMessages}`
          );
        }

        setStatus("success");
        setTimeout(() => window.close(), 3000);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "An unknown error occurred");
      }
    }
  };

  const handleCancel = () => {
    window.close();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {status === "input" && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Reject {orderIds.length > 1 ? "Orders" : "Order"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Rejection
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder="Please provide a reason for rejecting this order..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject {orderIds.length > 1 ? "Orders" : "Order"}
                </button>
              </div>
            </form>
          </>
        )}

        {status === "processing" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-orange-600 mb-4">
              Processing Rejection...
            </h1>
            <p className="text-gray-600">
              Rejecting {orderIds.length > 1 ? "orders" : "order"}... (
              {progress.current} of {progress.total})
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              {orderIds.length > 1 ? "Orders" : "Order"} Rejected Successfully!
            </h1>
            <p className="text-gray-600">
              This window will close automatically in a few seconds...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Rejection Failed
            </h1>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setStatus("input")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
