"use client";

import { useNotifications } from "@/components/NotificationContext";
import { reorderStock } from "@/lib/actions/stock.actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ReorderStockButton({
  itemId,
  reorderQuantity,
  onReorderComplete,
}: {
  itemId: string;
  reorderQuantity: number;
  onReorderComplete: () => void;
}) {
  const { refreshNotifications } = useNotifications();
  const [isReordering, setIsReordering] = useState(false);

  const handleReorder = async () => {
    setIsReordering(true);
    const result = await reorderStock(itemId);

    if (result.success) {
      await refreshNotifications();
      toast.success("Stock reordered successfully");
      onReorderComplete();
    } else {
      toast.error("Reorder Failed, Try again later");
    }
    setIsReordering(false);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleReorder}
      disabled={isReordering}
      className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
    >
      {isReordering ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <span>Reorder Stock</span>
          <span className="text-sm">({reorderQuantity} units)</span>
        </>
      )}
    </motion.button>
  );
}
