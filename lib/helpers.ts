export const getVendorMetrics = (vendor: any, stockItems: any[]) => {
  // Filter stock items that belong to this vendor
  const vendorStockItems = stockItems.filter(
    (item) => item.vendor.id === vendor.id
  );

  // Calculate metrics
  const totalRequested = vendorStockItems.length;
  const processed = vendorStockItems.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const rejected = vendorStockItems.filter(
    (item) => item.status === "REJECTED"
  ).length;

  // Calculate success rate (processed / total requested)
  const successRate =
    totalRequested > 0
      ? ((processed / totalRequested) * 100).toFixed(1)
      : "0.0";

  return {
    totalRequested,
    processed,
    rejected,
    successRate,
  };
};
