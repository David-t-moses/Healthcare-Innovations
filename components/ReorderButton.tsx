"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";

interface StockItem {
  id: string;
  quantity: number;
  minimumQuantity: number;
  vendor: {
    id: string;
    name: string;
  };
  [key: string]: any;
}

interface ReorderButtonProps {
  selectedItems: string[];
  stockItems: StockItem[] | null | undefined;
  onReorder: (itemIds: string[]) => Promise<boolean>;
}

export const ReorderButton = ({
  selectedItems,
  stockItems,
  onReorder,
}: ReorderButtonProps) => {
  const [isReordering, setIsReordering] = useState(false);

  // Check if there are any low stock items at all
  const hasLowStockItems = stockItems?.some(
    (item) => item.quantity <= item.minimumQuantity
  );

  // Get selected stock items
  const selectedStockItems = selectedItems
    .map((id) => stockItems?.find((item) => item.id === id))
    .filter(Boolean) as StockItem[];

  // Check if all selected items are low stock items
  const allSelectedItemsAreLowStock =
    selectedItems.length > 0 &&
    selectedItems.every((id) => {
      const item = stockItems?.find((item) => item.id === id);
      return item && item.quantity <= item.minimumQuantity;
    });

  // Check if all selected items are from the same vendor
  const allSameVendor =
    selectedStockItems.length > 0 &&
    selectedStockItems.every(
      (item) => item.vendor.id === selectedStockItems[0].vendor.id
    );

  // Different vendors selected
  const hasDifferentVendors =
    selectedItems.length > 0 && allSelectedItemsAreLowStock && !allSameVendor;

  // Button should be enabled only if all items are low stock AND from same vendor
  const isButtonEnabled =
    allSelectedItemsAreLowStock && allSameVendor && !isReordering;

  const handleReorder = async () => {
    if (!isButtonEnabled) return;

    setIsReordering(true);
    try {
      // Wait for the reorder operation to complete fully
      const success = await onReorder(selectedItems);

      // Only show success toast if the operation was successful
      if (success) {
        toast.success(
          `${
            selectedItems.length > 1 ? "Items" : "Item"
          } reordered successfully`
        );
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(
        `Failed to reorder ${selectedItems.length > 1 ? "items" : "item"}`
      );
    } finally {
      // Ensure the button state is reset
      setIsReordering(false);
    }
  };

  // If there are no low stock items, don't render the button at all
  if (!hasLowStockItems) {
    return null;
  }

  return (
    <button
      className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm
        ${
          isReordering
            ? "bg-blue-600 text-white opacity-80 cursor-wait"
            : hasDifferentVendors
            ? "bg-orange-100 text-orange-700 border border-orange-300 cursor-not-allowed"
            : isButtonEnabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      disabled={!isButtonEnabled}
      onClick={handleReorder}
      title={hasDifferentVendors ? "Items must be from the same vendor" : ""}
      aria-label={
        hasDifferentVendors
          ? "Items must be from the same vendor"
          : "Reorder selected items"
      }
    >
      {isReordering ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Reordering...</span>
        </>
      ) : hasDifferentVendors ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Same Vendor Required</span>
          <span className="inline sm:hidden">Same Vendor</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Reorder</span>
        </>
      )}
    </button>
  );
};
