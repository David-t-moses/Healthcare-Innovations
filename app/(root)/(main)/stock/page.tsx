"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getTotalStocks,
  getCompletedOrders,
  getInProgressOrders,
  getStockItems,
  deleteStockItem,
  bulkReorderStock,
} from "@/lib/actions/stock.actions";
import {
  StockPageSkeleton,
  StockItemCardSkeletons,
  VendorCardSkeletons,
} from "@/components/Skeletons";
import { useFilteredData } from "@/lib/hooks/useFilteredData";
import { getVendorMetrics } from "@/lib/helpers";
import {
  deleteVendor,
  getVendors,
  getVendorMetricsData,
} from "@/lib/actions/vendor.actions";
import { toast } from "sonner";
import AddStockItemModal from "@/components/AddStockItemModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import AddVendorModal from "@/components/AddVendorModal";
import EditVendorModal from "@/components/EditVendorModal";
import { ReorderButton } from "@/components/ReorderButton";
import { formatDistanceToNow, format } from "date-fns";
import { exportData } from "@/lib/export";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  FileSpreadsheet,
  FileDown,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import EditStockItemModal from "@/components/EditStockItemModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Type definitions
interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
  pricePerUnit: number;
  status: string;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
  };
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

const formatDateTime = (date: Date) => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today at ${format(date, "h:mm a")}`;
  }

  return `${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
};

// Simplified stock level indicator that just shows percentage
const StockLevelIndicator = ({
  quantity,
  minimumQuantity,
}: {
  quantity: number;
  minimumQuantity: number;
}) => {
  const percentage = Math.min((quantity / minimumQuantity) * 100, 100);
  const isLow = quantity <= minimumQuantity;

  return (
    <span
      className={`font-medium ${isLow ? "text-red-600" : "text-green-600"}`}
    >
      {percentage.toFixed(0)}%
    </span>
  );
};

export const isStockLow = (
  quantity: number,
  minimumQuantity: number
): boolean => {
  return quantity <= minimumQuantity;
};

const isItemLowOnStock = (item: StockItem) => {
  return item.quantity <= item.minimumQuantity;
};

// Status badge component for better visualization
const StatusBadge = ({ status }: { status: string }) => {
  let color = "";
  let label = "";

  switch (status) {
    case "COMPLETED":
      color = "bg-green-100 text-green-800 border-green-300";
      label = "Completed";
      break;
    case "REJECTED":
      color = "bg-red-100 text-red-800 border-red-300";
      label = "Rejected";
      break;
    default:
      color = "bg-yellow-100 text-yellow-800 border-yellow-300";
      label = "Pending";
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Mobile card view for stock items
const StockItemCard = ({
  item,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  item: StockItem;
  index: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isLow = isItemLowOnStock(item);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300"
          />
          <h3 className="font-medium text-gray-900">{item.name}</h3>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
        <div className="text-gray-500">Quantity:</div>
        <div className="font-medium text-right">{item.quantity}</div>

        <div className="text-gray-500">Level:</div>
        <div className="text-right">
          <StockLevelIndicator
            quantity={item.quantity}
            minimumQuantity={item.minimumQuantity}
          />
        </div>

        <div className="text-gray-500">Unit Price:</div>
        <div className="font-medium text-right">
          ${Number(item.pricePerUnit).toFixed(2)}
        </div>

        <div className="text-gray-500">Total Value:</div>
        <div className="font-medium text-right">
          ${(item.quantity * Number(item.pricePerUnit)).toFixed(2)}
        </div>

        <div className="text-gray-500">Vendor:</div>
        <div className="font-medium text-right">{item.vendor.name}</div>

        <div className="text-gray-500">Date:</div>
        <div className="text-xs text-right">
          {formatDateTime(new Date(item.createdAt))}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2"
        >
          <Trash className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

// Mobile card view for vendors
const VendorCard = ({
  vendor,
  index,
  metrics,
}: {
  vendor: any;
  index: number;
  metrics: any;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <h3 className="font-medium text-gray-900 mb-3">{vendor.name}</h3>

      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
        <div className="text-gray-500">Email:</div>
        <div className="font-medium text-right flex flex-wrap">
          {vendor.email}
        </div>

        <div className="text-gray-500">Phone:</div>
        <div className="font-medium text-right">{vendor.phone}</div>

        <div className="text-gray-500">Total Requested:</div>
        <div className="font-medium text-right">{metrics.totalRequested}</div>

        <div className="text-gray-500">Processed:</div>
        <div className="font-medium text-green-600 text-right">
          {metrics.processed}
        </div>

        <div className="text-gray-500">Rejected:</div>
        <div className="font-medium text-red-600 text-right">
          {metrics.rejected}
        </div>

        <div className="text-gray-500">Success Rate:</div>
        <div
          className={`font-medium text-right ${
            Number(metrics.successRate) > 75
              ? "text-green-600"
              : Number(metrics.successRate) > 50
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {metrics.successRate}%
        </div>
      </div>
    </div>
  );
};

export default function StockPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalStocks: any;
    completedOrders: any;
    inProgressOrders: any;
    stockItems: StockItem[] | null;
  }>({
    totalStocks: null,
    completedOrders: null,
    inProgressOrders: null,
    stockItems: null,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"stocks" | "vendors">("stocks");
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [editVendorModalOpen, setEditVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [deleteStockModalState, setDeleteStockModalState] = useState<{
    isOpen: boolean;
    stockItem: StockItem | null;
  }>({
    isOpen: false,
    stockItem: null,
  });
  const [deleteVendorModalState, setDeleteVendorModalState] = useState<{
    isOpen: boolean;
    vendor: { id: string; name: string } | null;
  }>({
    isOpen: false,
    vendor: null,
  });
  const [vendorMetrics, setVendorMetrics] = useState<{
    [key: string]: {
      totalRequested: number;
      processed: number;
      rejected: number;
      pending: number;
      successRate: string;
      lastUpdated: Date;
    };
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    level: true,
    unit: true,
    total: true,
    vendor: true,
  });
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Detect screen size for responsive layout
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

  const filteredData = useFilteredData(
    activeTab === "stocks" ? data?.stockItems || [] : vendors || [],
    {
      searchQuery,
      filterType,
      dateFilter,
      activeTab,
      stockItems: data?.stockItems || [],
    }
  );

  const itemsPerPage = viewMode === "cards" ? 5 : 10;

  const fetchVendorMetrics = async () => {
    try {
      const metricsPromises = vendors.map(async (vendor) => {
        const metrics = await getVendorMetricsData(vendor.id);
        return { vendorId: vendor.id, metrics };
      });

      const metricsResults = await Promise.all(metricsPromises);

      const metricsMap = metricsResults.reduce((acc, { vendorId, metrics }) => {
        acc[vendorId] = metrics;
        return acc;
      }, {} as any);

      setVendorMetrics(metricsMap);
    } catch (error) {
      console.error("Error fetching vendor metrics:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [
        totalStocks,
        completedOrders,
        inProgressOrders,
        stockItems,
        vendorsList,
      ] = await Promise.all([
        getTotalStocks(),
        getCompletedOrders(),
        getInProgressOrders(),
        getStockItems(),
        getVendors(),
      ]);

      setData({ totalStocks, completedOrders, inProgressOrders, stockItems });
      setVendors(vendorsList);

      // Fetch vendor metrics after getting vendors
      if (vendorsList.length > 0) {
        await fetchVendorMetrics();
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      if (vendors.length > 0 && activeTab === "vendors") {
        fetchVendorMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, vendors.length]);

  useEffect(() => {
    if (activeTab === "vendors" && vendors.length > 0) {
      fetchVendorMetrics();
    }
  }, [activeTab]);

  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const paginatedData = useMemo(() => {
    return getPaginatedData(filteredData);
  }, [filteredData, currentPage, itemsPerPage]);

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
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs sm:text-sm text-gray-500">
          Showing {startIndex + 1} to {endIndex} of {totalItems} entries
        </div>
      </div>
    );
  };

  const handleTabChange = (tab: "stocks" | "vendors") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleDeleteVendor = (vendor: { id: string; name: string }) => {
    if (!vendor || !vendor.id) {
      toast.error("Invalid vendor selected for deletion");
      return;
    }

    setDeleteVendorModalState({
      isOpen: true,
      vendor: vendor,
    });
  };

  const handleStockDeleteSuccess = async () => {
    toast.success("Stock item deleted successfully");
    await fetchData();
  };

  const handleStockDeleteError = (error: Error) => {
    toast.error(`Failed to delete stock item: ${error.message}`);
  };

  const canShowReorderButton = () => {
    return (
      selectedItems.length > 0 &&
      selectedItems.every((id) => {
        const item = data?.stockItems?.find((item) => item.id === id);
        return item && isStockLow(item.quantity, item.minimumQuantity);
      })
    );
  };

  const handleFilter = (type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleDateFilter = (period: string) => {
    setDateFilter(period);
    setCurrentPage(1);
  };

  const handleExport = async (exportFormat: string) => {
    try {
      const dataToExport = filteredData;

      const tableElement = document.querySelector("table");
      if (tableElement) {
        tableElement.classList.add(
          activeTab === "stocks" ? "stock-table" : "vendor-table"
        );
      }

      await exportData(
        dataToExport,
        activeTab as "stocks" | "vendors",
        exportFormat,
        data?.stockItems || []
      );

      toast.success(
        `${
          activeTab === "stocks" ? "Stock items" : "Vendors"
        } exported successfully`
      );
    } catch (error) {
      toast.error(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Export error:", error);
    }
  };

  const getPendingStocksCount = () => {
    return data?.stockItems?.filter((item) => item.status === "PENDING").length;
  };

  const handleDelete = (item: StockItem) => {
    if (!item) return;

    setDeleteStockModalState({
      isOpen: true,
      stockItem: item,
    });
  };

  const handleEdit = (item: StockItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditModalClose = async () => {
    setEditModalOpen(false);
    setSelectedItem(null);
    const updatedStockItems = await getStockItems();
    setData((prev) => ({ ...prev, stockItems: updatedStockItems }));
  };

  const handleBulkReorder = async (itemIds: string[]) => {
    try {
      await bulkReorderStock(itemIds);
      setSelectedItems([]);
      await fetchData();
      return true;
      // toast.success(
      //   `${itemIds.length > 1 ? "Items" : "Item"} reordered successfully`
      // );
    } catch (error) {
      console.error("Bulk reorder failed:", error);
      toast.error(`Failed to reorder ${itemIds.length > 1 ? "items" : "item"}`);
    }
  };

  const getCompletedOrdersCount = () => {
    return data?.stockItems?.filter((item) => item.status === "COMPLETED")
      .length;
  };

  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "table" ? "cards" : "table"));
  };

  if (loading) {
    return <StockPageSkeleton />;
  }

  return (
    <div className="mx-auto p-3 sm:p-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Stock Management
        </h1>

        <button
          onClick={() => {
            if (activeTab === "stocks") {
              setAddModalOpen(true);
            } else {
              setAddVendorModalOpen(true);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{activeTab === "stocks" ? "Add Stock" : "Add Vendor"}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        {/* Total Stocks Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl sm:text-2xl font-medium text-blue-600 mb-2 sm:mb-4">
            Total Stocks
          </h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Total: {data?.totalStocks?.count}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm">
              {formatDate(data?.totalStocks?.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Completed Orders Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl sm:text-2xl font-medium text-green-600 mb-2 sm:mb-4">
            Completed Orders
          </h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Total: {getCompletedOrdersCount()}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm">
              {formatDate(data?.completedOrders?.lastUpdated)}
            </span>
          </div>
        </div>

        {/* In Progress Orders Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl sm:text-2xl font-medium text-orange-600 mb-2 sm:mb-4">
            Pending Orders
          </h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Total: {getPendingStocksCount()}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm">
              {formatDate(data?.inProgressOrders?.lastUpdated)}
            </span>
          </div>
        </div>
      </div>

      {/* Full Width Stock Items Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {activeTab === "stocks" ? "Stock Items" : "Vendors"}
          </h2>

          {/* View toggle for mobile/desktop */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
              className="sm:hidden"
            >
              {viewMode === "table" ? (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Cards
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Table
                </>
              )}
            </Button>

            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => toggleColumnVisibility("date")}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.date}
                      className="mr-2"
                      readOnly
                    />
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleColumnVisibility("level")}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.level}
                      className="mr-2"
                      readOnly
                    />
                    Level
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleColumnVisibility("unit")}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.unit}
                      className="mr-2"
                      readOnly
                    />
                    Unit Price
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleColumnVisibility("total")}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.total}
                      className="mr-2"
                      readOnly
                    />
                    Total Value
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleColumnVisibility("vendor")}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.vendor}
                      className="mr-2"
                      readOnly
                    />
                    Vendor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "stocks"
                  ? "Search stock items..."
                  : "Search vendors..."
              }
              className="w-full px-4 py-2 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-400 text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {activeTab === "stocks" && (
              <ReorderButton
                selectedItems={selectedItems}
                stockItems={data?.stockItems}
                onReorder={handleBulkReorder}
              />
            )}

            {/* Only show filter button for stocks tab */}
            {activeTab === "stocks" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFilter("all")}>
                    All Items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilter("low")}>
                    Low Stock
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilter("normal")}>
                    Normal Stock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 sm:flex-none px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm ${
                    !canShowReorderButton()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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

        {/* Table Section */}
        <div className="mb-4 border-b border-gray-200">
          <div className="flex justify-center space-x-4 sm:space-x-8">
            <button
              className={`pb-3 px-3 sm:px-4 ${
                activeTab === "stocks"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("stocks")}
            >
              Stocks
            </button>
            <button
              className={`pb-3 px-3 sm:px-4 ${
                activeTab === "vendors"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("vendors")}
            >
              Vendors
            </button>
          </div>
        </div>

        {/* Conditional Table/Cards Rendering */}
        {activeTab === "stocks" ? (
          <>
            {viewMode === "table" ? (
              <div className="overflow-x-auto rounded-lg ">
                <table className="w-full">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Select all items
                              const allIds =
                                data?.stockItems?.map((item) => item.id) || [];
                              setSelectedItems(allIds);
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          checked={
                            selectedItems.length > 0 &&
                            selectedItems.length === data?.stockItems?.length
                          }
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                        S/N
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Item Name
                      </th>
                      {visibleColumns.date && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                          Date
                        </th>
                      )}
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Quantity
                      </th>
                      {visibleColumns.level && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                          Level
                        </th>
                      )}
                      {visibleColumns.unit && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                          Unit
                        </th>
                      )}
                      {visibleColumns.total && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                          Total
                        </th>
                      )}
                      {visibleColumns.vendor && (
                        <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                          Vendor
                        </th>
                      )}
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((item: StockItem, index) => (
                      <tr key={item.id} className="bg-white hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              setSelectedItems(
                                e.target.checked
                                  ? [...selectedItems, item.id]
                                  : selectedItems.filter((id) => id !== item.id)
                              );
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 text-xs sm:text-sm">
                          {item.name}
                        </td>
                        {visibleColumns.date && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden sm:table-cell text-center">
                            {formatDateTime(new Date(item.createdAt))}
                          </td>
                        )}
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm text-center">
                          {item.quantity}
                        </td>
                        {visibleColumns.level && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-sm text-center">
                            <StockLevelIndicator
                              quantity={item.quantity}
                              minimumQuantity={item.minimumQuantity}
                            />
                          </td>
                        )}
                        {visibleColumns.unit && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden sm:table-cell text-center">
                            ${Number(item.pricePerUnit).toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.total && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden sm:table-cell text-center">
                            $
                            {(
                              item.quantity * Number(item.pricePerUnit)
                            ).toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.vendor && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden sm:table-cell text-center">
                            {item.vendor.name}
                          </td>
                        )}
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-gray-50 rounded-full">
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(item)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="cursor-pointer text-red-600"
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : loading ? (
              <StockItemCardSkeletons count={itemsPerPage} />
            ) : (
              <div className="space-y-3">
                {paginatedData.map((item: StockItem, index) => (
                  <StockItemCard
                    key={item.id}
                    item={item}
                    index={index + 1 + (currentPage - 1) * itemsPerPage}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={(checked) => {
                      setSelectedItems(
                        checked
                          ? [...selectedItems, item.id]
                          : selectedItems.filter((id) => id !== item.id)
                      );
                    }}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
                {paginatedData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No stock items found matching your criteria
                  </div>
                )}
              </div>
            )}
            <PaginationControls totalItems={filteredData.length} />
          </>
        ) : (
          <>
            {viewMode === "table" ? (
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 text-center">
                        S/N
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Name
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                        Email
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell text-center">
                        Phone
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Total
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Processed
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Rejected
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Success
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getPaginatedData(filteredData).map(
                      (vendor: any, index) => {
                        const metrics =
                          vendorMetrics[vendor.id] ||
                          getVendorMetrics(vendor, data?.stockItems || []);
                        return (
                          <tr
                            key={vendor.id}
                            className="bg-white hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                              {index + 1 + (currentPage - 1) * itemsPerPage}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">
                              {vendor.name}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs hidden sm:table-cell text-center">
                              {vendor.email}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs hidden sm:table-cell text-center">
                              {vendor.phone}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                              {metrics.totalRequested}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-green-600 text-xs sm:text-sm">
                              {metrics.processed}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-red-600 text-xs sm:text-sm">
                              {metrics.rejected}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                              <span
                                className={`${
                                  Number(metrics.successRate) > 75
                                    ? "text-green-600"
                                    : Number(metrics.successRate) > 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {metrics.successRate}%
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 hover:bg-gray-50 rounded-full">
                                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedVendor(vendor);
                                        setEditVendorModalOpen(true);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteVendor(vendor)}
                                      className="cursor-pointer text-red-600"
                                    >
                                      <Trash className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : loading ? (
              <VendorCardSkeletons count={itemsPerPage} />
            ) : (
              <div className="space-y-3">
                {getPaginatedData(filteredData).map((vendor: any, index) => {
                  const metrics =
                    vendorMetrics[vendor.id] ||
                    getVendorMetrics(vendor, data?.stockItems || []);
                  return (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      index={index + 1 + (currentPage - 1) * itemsPerPage}
                      metrics={metrics}
                    />
                  );
                })}
                {paginatedData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No vendors found matching your criteria
                  </div>
                )}
              </div>
            )}
            <PaginationControls totalItems={filteredData.length} />
          </>
        )}

        {/* Modals */}
        {addModalOpen && (
          <AddStockItemModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={async () => {
              const updatedStockItems = await getStockItems();
              setData((prev) => ({ ...prev, stockItems: updatedStockItems }));
              toast.success("Stock item added successfully");
            }}
          />
        )}

        {editModalOpen && selectedItem && (
          <EditStockItemModal
            isOpen={editModalOpen}
            onClose={handleEditModalClose}
            item={selectedItem}
            vendors={vendors}
          />
        )}

        <AddVendorModal
          isOpen={addVendorModalOpen}
          onClose={() => {
            setAddVendorModalOpen(false);
            fetchData();
          }}
        />

        <EditVendorModal
          isOpen={editVendorModalOpen}
          onClose={() => {
            setEditVendorModalOpen(false);
            setSelectedVendor(null);
            fetchData();
          }}
          vendor={selectedVendor}
        />

        <DeleteConfirmationModal
          isOpen={deleteStockModalState.isOpen}
          onClose={() =>
            setDeleteStockModalState({ isOpen: false, stockItem: null })
          }
          onConfirm={async () => {
            if (!deleteStockModalState.stockItem?.id) {
              console.error("No stock item ID provided for deletion");
              return;
            }
            await deleteStockItem(deleteStockModalState.stockItem.id);
          }}
          title="Delete Stock Item"
          description="This will permanently remove this item from inventory."
          itemToDelete={deleteStockModalState.stockItem?.name}
          onSuccess={handleStockDeleteSuccess}
          onError={handleStockDeleteError}
          isDangerous={true}
        />

        <DeleteConfirmationModal
          isOpen={deleteVendorModalState.isOpen}
          onClose={() =>
            setDeleteVendorModalState({ isOpen: false, vendor: null })
          }
          onConfirm={async () => {
            const vendorId = deleteVendorModalState.vendor?.id;
            if (vendorId) {
              await deleteVendor(vendorId);
            }
          }}
          title="Delete Vendor"
          description="This will permanently remove this vendor and all associated records."
          itemToDelete={deleteVendorModalState.vendor?.name}
          onSuccess={() => {
            toast.success("Vendor deleted successfully");
            fetchData();
            setDeleteVendorModalState({ isOpen: false, vendor: null });
          }}
          onError={(error) => {
            toast.error(`Failed to delete vendor: ${error.message}`);
          }}
          isDangerous={true}
        />
      </div>
    </div>
  );
}
