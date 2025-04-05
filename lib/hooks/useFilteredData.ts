import { useMemo } from "react";

export function useFilteredData(data, options) {
  const {
    searchQuery,
    filterType,
    dateFilter,
    activeTab,
    stockItems = [],
  } = options;

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((item) => {
        if (activeTab === "stocks") {
          return (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          // For vendors
          return (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.phone.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    // Apply type filter
    if (filterType !== "all") {
      if (activeTab === "stocks") {
        if (filterType === "low") {
          result = result.filter(
            (item) => item.quantity <= item.minimumQuantity
          );
        } else if (filterType === "normal") {
          result = result.filter(
            (item) => item.quantity > item.minimumQuantity
          );
        }
      } else {
        // For vendors
        if (filterType === "active") {
          result = result.filter((vendor) => {
            const vendorItems = stockItems.filter(
              (item) => item.vendor?.id === vendor.id
            );
            return vendorItems.length > 0;
          });
        } else if (filterType === "inactive") {
          result = result.filter((vendor) => {
            const vendorItems = stockItems.filter(
              (item) => item.vendor?.id === vendor.id
            );
            return vendorItems.length === 0;
          });
        }
      }
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      if (activeTab === "stocks") {
        result = result.filter((item) => {
          const itemDate = new Date(item.createdAt);

          if (dateFilter === "today") {
            return itemDate >= today;
          } else if (dateFilter === "week") {
            return itemDate >= weekStart;
          } else if (dateFilter === "month") {
            return itemDate >= monthStart;
          }
          return true;
        });
      } else {
        // For vendors, filter based on their stock items' dates
        result = result.filter((vendor) => {
          const vendorItems = stockItems.filter(
            (item) => item.vendor?.id === vendor.id
          );

          // If no items, don't show in date filters except "all"
          if (vendorItems.length === 0) return false;

          return vendorItems.some((item) => {
            const itemDate = new Date(item.createdAt);

            if (dateFilter === "today") {
              return itemDate >= today;
            } else if (dateFilter === "week") {
              return itemDate >= weekStart;
            } else if (dateFilter === "month") {
              return itemDate >= monthStart;
            }
            return true;
          });
        });
      }
    }

    return result;
  }, [data, searchQuery, filterType, dateFilter, activeTab, stockItems]);

  return filteredData;
}
