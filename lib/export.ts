import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { format } from "date-fns";

const formatStockDataForExport = (data: any[]) => {
  return data.map((item) => ({
    "Item Name": item.name,
    Quantity: item.quantity,
    "Minimum Quantity": item.minimumQuantity,
    "Stock Level": `${((item.quantity / item.minimumQuantity) * 100).toFixed(
      0
    )}%`,
    "Price Per Unit": `$${Number(item.pricePerUnit).toFixed(2)}`,
    "Total Value": `$${(item.quantity * Number(item.pricePerUnit)).toFixed(2)}`,
    Vendor: item.vendor?.name || "N/A",
    Status: item.status,
    "Order Date": format(new Date(item.createdAt), "PPP"),
  }));
};

const formatVendorDataForExport = (data: any[], stockItems: any[] = []) => {
  return data.map((vendor) => {
    const vendorStocks = stockItems.filter(
      (item) => item.vendor?.id === vendor.id
    );
    const totalRequested = vendorStocks.length;
    const processed = vendorStocks.filter(
      (item) => item.status === "COMPLETED"
    ).length;
    const rejected = vendorStocks.filter(
      (item) => item.status === "REJECTED"
    ).length;
    const successRate =
      totalRequested > 0
        ? ((processed / totalRequested) * 100).toFixed(0)
        : "0";

    return {
      "Vendor Name": vendor.name,
      Email: vendor.email,
      Phone: vendor.phone,
      "Total Requested": totalRequested,
      Processed: processed,
      Rejected: rejected,
      "Success Rate": `${successRate}%`,
      "Created At": vendor.createdAt
        ? format(new Date(vendor.createdAt), "PPP")
        : "N/A",
    };
  });
};

export const exportData = (
  data: any[],
  type: "stocks" | "vendors",
  exportFormat: string,
  stockItems: any[] = []
) => {
  try {
    const formattedData =
      type === "stocks"
        ? formatStockDataForExport(data)
        : formatVendorDataForExport(data, stockItems);

    const fileName = `${type}-${format(new Date(), "yyyy-MM-dd")}`;

    switch (exportFormat) {
      case "csv":
        exportToCSV(formattedData, fileName);
        break;
      case "excel":
        exportToExcel(formattedData, fileName);
        break;
      case "png":
        exportToPNG(type);
        break;
      default:
        throw new Error("Unsupported export format");
    }
    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
};

export const exportToCSV = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${fileName}.csv`);
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPNG = async (type: "stocks" | "vendors") => {
  const selector = type === "stocks" ? ".stock-table" : ".vendor-table";
  const element = document.querySelector(selector);
  if (!element) {
    const tables = document.querySelectorAll("table");
    if (tables.length === 0) throw new Error("No table found to export");

    const canvas = await html2canvas(tables[0] as HTMLElement, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `${type}-${format(new Date(), "yyyy-MM-dd")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    return;
  }

  const canvas = await html2canvas(element as HTMLElement, {
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = `${type}-${format(new Date(), "yyyy-MM-dd")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};
