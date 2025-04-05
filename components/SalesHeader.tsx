"use client";

import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";

export default function SalesHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      className="flex py-4 flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        className="text-2xl md:text-3xl font-semibold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Sales & Finances
      </motion.h1>

      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <PlusCircle className="w-5 h-5" />
        <span className="font-medium max-sm:hidden">Add Transaction</span>
      </motion.button>

      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
