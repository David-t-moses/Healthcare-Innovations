"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createStockItem, getStockItems } from "@/lib/actions/stock.actions";
import { getVendors } from "@/lib/actions/vendor.actions";

export default function AddStockItemModal({ isOpen, onClose }) {
  const [vendors, setVendors] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await createStockItem({
      name: formData.get("name") as string,
      quantity: Number(formData.get("quantity")),
      minimumQuantity: Number(formData.get("minimumQuantity")),
      reorderQuantity: Number(formData.get("reorderQuantity")),
      vendorId: formData.get("vendorId") as string,
      status: "IN_STOCK",
    });
    onClose();
    fetchData();
  };

  const fetchData = async () => {
    try {
      const vendorsData = await getVendors();
      const stockData = await getStockItems();
      setVendors(vendorsData);
      setStockItems(stockData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Stock Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Quantity
                </label>
                <input
                  name="minimumQuantity"
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reorder Quantity
                </label>
                <input
                  name="reorderQuantity"
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <select
                  name="vendorId"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    fetchData();
                    onClose();
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Item
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
