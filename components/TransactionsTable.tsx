"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  FileDown,
  FileSpreadsheet,
  Calendar,
  Pencil,
  Trash,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { getSalesData, deletePayment } from "@/lib/actions/sales.actions";
import { useRouter } from "next/navigation";
import { exportData } from "@/lib/export";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EditTransactionModal from "./EditTransactionModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface Transaction {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  status: string;
  customerName?: string;
  beneficiary?: string;
  serviceDescription?: string;
  paymentMethod?: string;
  paymentType: string;
}

interface TransactionsTableProps {
  initialTransactions: Transaction[];
  initialLoading?: boolean;
}

// Mobile card view for transactions
const TransactionCard = ({
  transaction,
  index,
  isLoading,
}: {
  transaction?: Transaction;
  index: number;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
          <div className="text-gray-500">Customer:</div>
          <div className="font-medium text-right">
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>

          <div className="text-gray-500">Amount:</div>
          <div className="font-medium text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>

          <div className="text-gray-500">Date:</div>
          <div className="text-xs text-right">
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>

          <div className="text-gray-500">Description:</div>
          <div className="text-xs text-right">
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{transaction.invoiceId}</h3>
        </div>
        {transaction.status === "paid" ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Paid
          </span>
        ) : transaction.status === "pending" ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
        <div className="text-gray-500">
          {transaction.paymentType === "incoming"
            ? "Customer:"
            : "Beneficiary:"}
        </div>
        <div className="font-medium text-right">
          {transaction.paymentType === "incoming"
            ? transaction.customerName
            : transaction.beneficiary}
        </div>

        <div className="text-gray-500">Amount:</div>
        <div className="font-medium text-right">
          {formatCurrency(transaction.amount)}
        </div>

        <div className="text-gray-500">Date:</div>
        <div className="text-xs text-right">
          {formatDate(new Date(transaction.date))}
        </div>

        {(transaction.serviceDescription ||
          transaction.paymentType === "outgoing") && (
          <>
            <div className="text-gray-500">
              {transaction.paymentType === "incoming"
                ? "Description:"
                : "Category:"}
            </div>
            <div className="text-xs text-right">
              {transaction.serviceDescription}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert(`View details for ${transaction.id}`)}
          className="h-8 px-2"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

// Table row skeleton component
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <Skeleton className="h-3 w-8 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <Skeleton className="h-3 w-16 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <Skeleton className="h-3 w-24 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <Skeleton className="h-3 w-20 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <Skeleton className="h-3 w-16 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
      <Skeleton className="h-3 w-32 mx-auto" />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <div className="flex justify-center">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
      <div className="flex items-center justify-center">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </td>
  </tr>
);

export default function TransactionsTable({
  initialTransactions,
  initialLoading = false,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filteredTransactions, setFilteredTransactions] =
    useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialTransactions.length / 10)
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({
    isOpen: false,
    transaction: null,
  });
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string | null>(
    null
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const itemsPerPage = viewMode === "cards" ? 5 : 10;

  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("cards");
      } else {
        setViewMode("table");
      }
    };

    // Set initial view mode
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let result = [...transactions];

    // Apply search filter
    if (search) {
      result = result.filter(
        (transaction) =>
          (transaction.customerName || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
          (transaction.serviceDescription || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filter) {
      result = result.filter((transaction) => transaction.status === filter);
    }

    // Apply payment type filter
    if (paymentTypeFilter) {
      result = result.filter(
        (transaction) => transaction.paymentType === paymentTypeFilter
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      result = result.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        if (dateFilter === "today") {
          return transactionDate >= today;
        } else if (dateFilter === "week") {
          return transactionDate >= weekStart;
        } else if (dateFilter === "month") {
          return transactionDate >= monthStart;
        }
        return true;
      });
    }

    setFilteredTransactions(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    search,
    filter,
    paymentTypeFilter,
    dateFilter,
    transactions,
    itemsPerPage,
  ]);

  useEffect(() => {
    if (!initialLoading) {
      fetchTransactions();
    }
  }, []);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  const fetchTransactions = useCallback(
    async (
      page = 1,
      status = filter,
      searchTerm = search,
      paymentType = paymentTypeFilter
    ) => {
      setIsRefreshing(true);
      try {
        const response = await getSalesData({
          page,
          limit: 10,
          status,
          search: searchTerm,
          paymentType,
        });

        if (response.success) {
          setTransactions(response.data.payments);
          setTotalPages(
            Math.ceil(response.data.pagination.total / itemsPerPage)
          );
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to fetch transactions");
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [filter, search, paymentTypeFilter, itemsPerPage]
  );

  const handlePaymentTypeFilter = (type: string | null) => {
    setPaymentTypeFilter(type);
    setIsLoading(true);
    fetchTransactions(1, filter, search, type);
  };

  const handleFilterChange = (status: string | null) => {
    setFilter(status);
    setIsLoading(true);
    fetchTransactions(1, status, search, paymentTypeFilter);
  };

  const handleDateFilter = (period: string) => {
    setDateFilter(period);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchTransactions(1, filter, search, paymentTypeFilter);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchTransactions();
    router.refresh();
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteModalState({
      isOpen: true,
      transaction: transaction,
    });
  };

  const handleExport = async (exportFormat: string) => {
    try {
      // Format transactions for export
      const formattedData = filteredTransactions.map((transaction) => ({
        "Invoice ID": transaction.invoiceId,
        Customer: transaction.customerName,
        Amount: formatCurrency(transaction.amount),
        Date: formatDate(new Date(transaction.date)),
        Status:
          transaction.status.charAt(0).toUpperCase() +
          transaction.status.slice(1),
        Description: transaction.serviceDescription,
        "Payment Method": transaction.paymentMethod,
      }));

      // Add table class for PNG export
      const tableElement = document.querySelector("table");
      if (tableElement) {
        tableElement.classList.add("transaction-table");
      }

      // Use the export utility from your codebase
      await exportData(formattedData, "transactions", exportFormat);

      toast.success(
        `Transactions exported successfully as ${exportFormat.toUpperCase()}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(currentPage, filter, search, paymentTypeFilter);
  };

  const getStatusBadge = (status: string, paymentType: string) => {
    // For expenses (outgoing payments)
    if (paymentType === "outgoing") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ArrowDownRight className="w-3 h-3 mr-1" />
          Expense
        </span>
      );
    }

    // For revenue (incoming payments)
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const PaginationControls = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    // For small screens, show fewer page buttons
    const getPageButtons = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      if (currentPage <= 3) {
        return [1, 2, 3, 4, "...", totalPages];
      }

      if (currentPage >= totalPages - 2) {
        return [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      }

      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    };

    const pageButtons = getPageButtons();

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-1 mb-3 sm:mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1 mx-2 overflow-x-auto">
            {pageButtons.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 flex items-center">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  disabled={isLoading}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs sm:text-sm text-gray-500">
          {isLoading ? (
            <span>Loading transactions...</span>
          ) : (
            <span>
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Recent Transactions
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or invoice..."
            className="w-full px-4 py-2 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-400 text-sm"
            disabled={isLoading}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Payment Type Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
                disabled={isLoading}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {paymentTypeFilter === "incoming"
                    ? "Revenue"
                    : paymentTypeFilter === "outgoing"
                    ? "Expenses"
                    : "All Types"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handlePaymentTypeFilter(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePaymentTypeFilter("incoming")}
              >
                Revenue (Incoming)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePaymentTypeFilter("outgoing")}
              >
                Expenses (Outgoing)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
                disabled={isLoading}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {filter ? `Status: ${filter}` : "All Statuses"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("paid")}>
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("overdue")}>
                Overdue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
                disabled={isLoading}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Date</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDateFilter("all")}>
                All Dates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilter("today")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilter("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilter("month")}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                disabled={isLoading}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conditional Table/Cards Rendering */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full min-w-full table-auto transaction-table">
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
              {isLoading || isRefreshing ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, index) => <TableRowSkeleton key={index} />)
              ) : getPaginatedData().length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No transactions found matching your criteria
                  </td>
                </tr>
              ) : (
                getPaginatedData().map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="bg-white hover:bg-gray-50"
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                      <span className="font-medium text-gray-900">
                        {transaction.invoiceId}
                      </span>
                    </td>
                    {/* Changed to text-left for customer/beneficiary name */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                      <span className="text-gray-600">
                        {transaction.paymentType === "incoming"
                          ? transaction.customerName
                          : transaction.beneficiary}
                      </span>
                    </td>

                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          transaction.paymentType === "incoming"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.paymentType === "incoming"
                          ? "Revenue"
                          : "Expense"}
                      </span>
                    </td>
                    {/* Changed to text-left for amount */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 flex ml-8 text-xs sm:text-sm text-left">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                      <span className="text-gray-600">
                        {formatDate(new Date(transaction.date))}
                      </span>
                    </td>
                    {/* Changed to text-left for description */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden md:table-cell text-left">
                      <span className="text-gray-600">
                        {transaction.serviceDescription}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 hover:bg-gray-50 rounded-full"
                              disabled={isProcessing}
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTransaction(transaction)}
                              className="cursor-pointer"
                              disabled={isProcessing}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteTransaction(transaction)
                              }
                              className="cursor-pointer text-red-600"
                              disabled={isProcessing}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Card view for mobile
        <div className="space-y-3">
          {isLoading || isRefreshing ? (
            // Loading skeleton for cards
            Array(5)
              .fill(0)
              .map((_, index) => (
                <TransactionCard key={index} index={index} isLoading={true} />
              ))
          ) : getPaginatedData().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching your criteria
            </div>
          ) : (
            getPaginatedData().map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                index={index + 1 + (currentPage - 1) * itemsPerPage}
                isLoading={false}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <PaginationControls totalItems={filteredTransactions.length} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, transaction: null })
        }
        onConfirm={async () => {
          if (!deleteModalState.transaction) return;
          setIsProcessing(true);
          try {
            await deletePayment(
              deleteModalState.transaction.id,
              deleteModalState.transaction.paymentType
            );
            return true;
          } catch (error) {
            console.error("Error deleting transaction:", error);
            return false;
          } finally {
            setIsProcessing(false);
          }
        }}
        title={`Delete ${
          deleteModalState.transaction?.paymentType === "incoming"
            ? "Revenue"
            : "Expense"
        }`}
        description="This will permanently remove this transaction from the system."
        itemToDelete={deleteModalState.transaction?.invoiceId}
        onSuccess={() => {
          toast.success("Transaction deleted successfully");
          fetchTransactions();
          router.refresh();
        }}
        onError={(error) => {
          toast.error(`Failed to delete transaction: ${error.message}`);
        }}
        isDangerous={true}
        isProcessing={isProcessing}
      />

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          transaction={selectedTransaction}
          onSuccess={handleEditSuccess}
        />
      )}
    </motion.div>
  );
}
