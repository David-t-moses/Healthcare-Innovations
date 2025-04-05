import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(new Date(date), "MMM dd, yyyy h:mm a");
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "text-green-700 bg-green-100";
    case "pending":
      return "text-yellow-700 bg-yellow-100";
    case "overdue":
      return "text-red-700 bg-red-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
}
