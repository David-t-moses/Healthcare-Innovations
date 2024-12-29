"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import AddVendorModal from "@/components/AddVendorModal";
import AddStockItemModal from "@/components/AddStockItemModal";
import EditStockItemModal from "@/components/EditStockItemModal";
import EditVendorModal from "@/components/EditVendorModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getVendors } from "@/lib/actions/vendor.actions";
import {
  getStockItems,
  deleteStockItem,
  reorderStock,
} from "@/lib/actions/stock.actions";
import { deleteVendor } from "@/lib/actions/vendor.actions";
import { toast } from "sonner";

export default function StockPage() {
  const [activeTab, setActiveTab] = useState("items");
  const [isVendorModalOpen, setVendorModalOpen] = useState(false);
  const [isStockModalOpen, setStockModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [stockItems]);

  const handleDelete = async (id: string) => {
    if (activeTab === "items") {
      await deleteStockItem(id);
    } else {
      await deleteVendor(id);
    }
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

  const handleAddClick = () => {
    if (activeTab === "items") {
      setStockModalOpen(true);
    } else {
      setVendorModalOpen(true);
    }
  };

  const handleReorder = async (itemId: string) => {
    setIsReordering(itemId);
    const result = await reorderStock(itemId);
    if (result.success) {
      toast.success("Stock reordered successfully");
    } else {
      toast.error("Reorder Failed, Try again later");
    }
    setIsReordering(null);
    fetchData();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading stock management..." />;
  }

  const renderItems = () => {
    const items = activeTab === "items" ? stockItems : vendors;

    return items.map((item) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {activeTab === "items" ? (
              <p className="text-gray-600">Quantity: {item.quantity}</p>
            ) : (
              <p className="text-gray-600">{item.email}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-gray-100 rounded-full"
              onClick={() => {
                setEditItem(item);
                setEditModalOpen(true);
              }}
            >
              <AiOutlineEdit className="w-5 h-5 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-gray-100 rounded-full"
              onClick={() => handleDelete(item.id)}
            >
              <AiOutlineDelete className="w-5 h-5 text-blue-600" />
            </motion.button>
          </div>
        </div>

        {activeTab === "items" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Stock Level</span>
              <span>
                {Math.min(
                  (item.quantity / item.minimumQuantity) * 100,
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    (item.quantity / item.minimumQuantity) * 100,
                    100
                  )}%`,
                }}
                className={`h-2 rounded-full ${
                  item.quantity <= item.minimumQuantity
                    ? "bg-red-500"
                    : "bg-blue-600"
                }`}
              />
            </div>
            {item.quantity <= item.minimumQuantity && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReorder(item.id)}
                disabled={isReordering === item.id}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isReordering === item.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reorder Stock</span>
                    <span className="text-sm">
                      ({item.reorderQuantity} units)
                    </span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        )}

        {activeTab === "items" ? (
          <EditStockItemModal
            key={`stock-${editItem?.id}`}
            isOpen={isEditModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditItem(null);
              fetchData();
            }}
            item={editItem}
            vendors={vendors}
          />
        ) : (
          <EditVendorModal
            key={`vendor-${editItem?.id}`}
            isOpen={isEditModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditItem(null);
              fetchData();
            }}
            vendor={editItem}
          />
        )}
      </motion.div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-gray-600 mt-2">Manage your inventory and vendors</p>
      </motion.div>

      <div className="flex space-x-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("items")}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "items"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          Stock Items
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("vendors")}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "vendors"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          Vendors
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Add New {activeTab === "items" ? "Stock Item" : "Vendor"}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-blue-600 text-white rounded-full"
              onClick={handleAddClick}
            >
              <AiOutlinePlus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {renderItems()}
      </div>

      <AddVendorModal
        isOpen={isVendorModalOpen}
        onClose={() => {
          setVendorModalOpen(false);
          fetchData();
        }}
      />

      <AddStockItemModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
        }}
      />
    </div>
  );
}
