"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmOrder } from "@/lib/actions/stock.actions";

export default function ConfirmOrderPage() {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderIds = searchParams?.get("ids")?.split(",") || [];

  useEffect(() => {
    let mounted = true;

    const handleBulkConfirmation = async () => {
      try {
        const results = await Promise.allSettled(
          orderIds.map(async (id) => {
            const result = await confirmOrder(id.trim());
            if (mounted) {
              setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
            }
            return result;
          })
        );

        if (!mounted) return;

        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          throw new Error(`Failed to confirm ${failures.length} orders`);
        }

        setStatus("success");
        setTimeout(() => window.close(), 2000);
      } catch (error) {
        if (mounted) {
          setStatus("error");
          setErrorMessage(error.message);
        }
      }
    };

    handleBulkConfirmation();
    return () => {
      mounted = false;
    };
  }, [orderIds]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-blue-600 mb-4">
              Processing Order Confirmation
            </h1>
            <p className="text-gray-600">
              Confirming orders... ({progress.current} of {progress.total})
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Orders Confirmed Successfully!
            </h1>
            <p className="text-gray-600">
              All {orderIds.length} orders have been confirmed. This window will
              close automatically in 2 seconds...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Confirmation Failed
            </h1>
            <p className="text-gray-600">
              {errorMessage || "There was an error confirming your orders."}
            </p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
