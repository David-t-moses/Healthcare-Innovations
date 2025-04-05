"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  FileDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

// Stock Page Skeleton
export const StockPageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-3 sm:p-6">
    {/* Header with static text and skeleton button */}
    <div className="flex justify-between items-center mb-4 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Stock Management
      </h1>
      <Skeleton className="h-9 sm:h-10 w-28 sm:w-32" />
    </div>

    {/* Stats Grid with static titles and skeleton data */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-medium text-blue-600 mb-2 sm:mb-4">
          Total Stocks
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-2">Total:</span>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-medium text-green-600 mb-2 sm:mb-4">
          Completed Orders
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-2">Total:</span>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-medium text-orange-600 mb-2 sm:mb-4">
          Pending Orders
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-2">Total:</span>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>

    {/* Stock Items Card with static headers and skeleton content */}
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Stock Items
        </h2>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 hidden sm:block" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-24 flex-1 sm:flex-none" />
          <Skeleton className="h-9 w-24 flex-1 sm:flex-none" />
          <Skeleton className="h-9 w-24 flex-1 sm:flex-none" />
        </div>
      </div>

      {/* Tab Navigation with static text */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex justify-center space-x-4 sm:space-x-8">
          <button className="pb-3 px-3 sm:px-4 border-b-2 border-blue-600 text-blue-600">
            Stocks
          </button>
          <button className="pb-3 px-3 sm:px-4 text-gray-500 hover:text-gray-700">
            Vendors
          </button>
        </div>
      </div>

      {/* Table Skeleton with realistic structure */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                <Skeleton className="h-4 w-4 mx-auto rounded" />
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                S/N
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                Item Name
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Date
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                Quantity
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Level
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Unit
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Total
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Status</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="bg-white">
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-4 mx-auto rounded" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  {i + 1}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <Skeleton className="h-4 w-32 sm:w-40" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-24 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t mt-4">
        <div className="flex items-center gap-1 mb-3 sm:mb-0">
          <Skeleton className="h-8 w-8" />
          <div className="flex gap-1 mx-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  </div>
);

// Stock Item Card Skeleton
export const StockItemCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>

    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
      <div className="text-gray-500">Quantity:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>

      <div className="text-gray-500">Level:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-14 ml-auto" />
      </div>

      <div className="text-gray-500">Unit Price:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>

      <div className="text-gray-500">Total Value:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>

      <div className="text-gray-500">Vendor:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-24 ml-auto" />
      </div>

      <div className="text-gray-500">Date:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-28 ml-auto" />
      </div>
    </div>

    <div className="flex justify-end gap-2 mt-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

// Vendor Card Skeleton
export const VendorCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
    <Skeleton className="h-5 w-32 mb-3" />

    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
      <div className="text-gray-500">Email:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-28 ml-auto" />
      </div>

      <div className="text-gray-500">Phone:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-24 ml-auto" />
      </div>

      <div className="text-gray-500">Total Requested:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-8 ml-auto" />
      </div>

      <div className="text-gray-500">Processed:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-8 ml-auto" />
      </div>

      <div className="text-gray-500">Rejected:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-8 ml-auto" />
      </div>

      <div className="text-gray-500">Success Rate:</div>
      <div className="text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
    </div>
  </div>
);

// Vendor Page Skeleton
export const VendorPageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-3 sm:p-6">
    {/* Header with static text */}
    <div className="flex justify-between items-center mb-4 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Vendor Management
      </h1>
      <Skeleton className="h-9 sm:h-10 w-28 sm:w-32" />
    </div>

    {/* Vendors table */}
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Vendors
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-24 flex-1 sm:flex-none" />
          <Skeleton className="h-9 w-24 flex-1 sm:flex-none" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                S/N
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Name</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Email
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                Phone
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Total</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                Processed
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                Rejected
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Success</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="bg-white">
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  {i + 1}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <Skeleton className="h-4 w-32 sm:w-40" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-32 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                  <Skeleton className="h-4 w-24 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t mt-4">
        <div className="flex items-center gap-1 mb-3 sm:mb-0">
          <Skeleton className="h-8 w-8" />
          <div className="flex gap-1 mx-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm"
      >
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-3 sm:mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        </div>
      </div>
    ))}
  </div>
);

// Card Grid Skeleton
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end mt-6">
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Loading Cards for mobile view
export const StockItemCardSkeletons = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <StockItemCardSkeleton key={i} />
    ))}
  </div>
);

export const VendorCardSkeletons = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <VendorCardSkeleton key={i} />
    ))}
  </div>
);

export function SalesPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 h-32"></div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 h-80"></div>
        <div className="bg-gray-100 rounded-lg p-6 h-80"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    </div>
  );
}

export default function FinancesSkeleton() {
  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 space-y-6">
      {/* SalesHeader with static text */}
      <motion.div
        className="flex pb-4 flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
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
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium max-sm:hidden">Add Transaction</span>
        </motion.button>
      </motion.div>

      {/* SummaryCards Skeleton */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Card 1: Total Revenue */}
        <motion.div
          className="rounded-xl border shadow-sm bg-white overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex">
            <div className="w-1 bg-green-600"></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <Skeleton className="h-6 w-32 mt-1" />
                </div>
                <div className="p-2 rounded-full bg-green-50">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-16 mr-2" />
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Pending Payments */}
        <motion.div
          className="rounded-xl border shadow-sm bg-white overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex">
            <div className="w-1 bg-yellow-500"></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Pending Payments
                  </p>
                  <Skeleton className="h-6 w-32 mt-1" />
                </div>
                <div className="p-2 rounded-full bg-yellow-50">
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-16 mr-2" />
                <span className="text-xs text-gray-500">open invoices</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total Expenses */}
        <motion.div
          className="rounded-xl border shadow-sm bg-white overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex">
            <div className="w-1 bg-red-500"></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Expenses
                  </p>
                  <Skeleton className="h-6 w-32 mt-1" />
                </div>
                <div className="p-2 rounded-full bg-red-50">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-16 mr-2" />
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Net Profit */}
        <motion.div
          className="rounded-xl border shadow-sm bg-white overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex">
            <div className="w-1 bg-blue-600"></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Net Profit
                  </p>
                  <Skeleton className="h-6 w-32 mt-1" />
                </div>
                <div className="p-2 rounded-full bg-blue-50">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-16 mr-2" />
                <span className="text-xs text-gray-500">profit margin</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* SalesCharts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Expense Breakdown Chart with Payment Status Cards */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-800 mb-4">
            Expense Breakdown
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Pie Chart */}
            <div className="w-full md:w-1/2">
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            </div>

            {/* Payment Status Cards */}
            <div className="w-full md:w-1/2 flex flex-col gap-3">
              {/* Total Revenue Card */}
              <div className="rounded-xl border p-3 flex-1 bg-green-50 border-green-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <Skeleton className="h-6 w-28 mt-1 bg-green-100" />
                    <div className="flex items-center mt-1">
                      <div className="flex items-center text-green-600">
                        <svg
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <Skeleton className="h-3 w-12 bg-green-100" />
                      </div>
                      <span className="text-xs text-gray-500 ml-1.5">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="p-1.5 rounded-full bg-white shadow-sm">
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <Skeleton className="h-3 w-10 mt-1.5 bg-green-100" />
                  </div>
                </div>
              </div>

              {/* Average Revenue Card */}
              <div className="rounded-xl border p-3 flex-1 bg-amber-50 border-amber-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Average Revenue
                    </p>
                    <Skeleton className="h-6 w-28 mt-1 bg-amber-100" />
                    <div className="flex items-center mt-1">
                      <div className="flex items-center text-amber-600">
                        <svg
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <Skeleton className="h-3 w-12 bg-amber-100" />
                      </div>
                      <span className="text-xs text-gray-500 ml-1.5">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="p-1.5 rounded-full bg-white shadow-sm">
                      <svg
                        className="h-5 w-5 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <Skeleton className="h-3 w-10 mt-1.5 bg-amber-100" />
                  </div>
                </div>
              </div>

              {/* Total Expenses Card */}
              <div className="rounded-xl border p-3 flex-1 bg-red-50 border-red-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Total Expenses
                    </p>
                    <Skeleton className="h-6 w-28 mt-1 bg-red-100" />
                    <div className="flex items-center mt-1">
                      <div className="flex items-center text-red-600">
                        <svg
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                        <Skeleton className="h-3 w-12 bg-red-100" />
                      </div>
                      <span className="text-xs text-gray-500 ml-1.5">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="p-1.5 rounded-full bg-white shadow-sm">
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <Skeleton className="h-3 w-10 mt-1.5 bg-red-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-800 mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 w-full">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* TransactionsTable Skeleton */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Recent Transactions
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-300" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">All Types</span>
            </div>
            <div className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Date</span>
            </div>
            <div className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm">
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </div>
            <div className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full min-w-full table-auto">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[5%] text-center">
                  S/N
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[15%] text-center">
                  Invoice ID
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[20%] text-center">
                  Customer
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
                  Type
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[15%] text-center">
                  Amount
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[15%] text-center">
                  Date
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
                  Description
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[15%] text-center">
                  Status
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 w-[15%] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
                      <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t mt-4">
          <div className="flex items-center gap-1 mb-3 sm:mb-0">
            <button className="h-8 w-8 p-0 flex items-center justify-center border border-gray-200 rounded-md">
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>
            <div className="flex gap-1 mx-2">
              <button className="h-8 w-8 p-0 flex items-center justify-center bg-blue-600 text-white rounded-md">
                1
              </button>
              {[2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  className="h-8 w-8 p-0 flex items-center justify-center border border-gray-200 rounded-md text-gray-500"
                >
                  {i}
                </button>
              ))}
            </div>
            <button className="h-8 w-8 p-0 flex items-center justify-center border border-gray-200 rounded-md">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Showing <Skeleton className="inline-block h-3 w-8" /> to{" "}
            <Skeleton className="inline-block h-3 w-8" /> of{" "}
            <Skeleton className="inline-block h-3 w-12" /> entries
          </div>
        </div>
      </div>
    </div>
  );
}
