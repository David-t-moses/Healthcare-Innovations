import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/globals.css";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

import { Toaster } from "sonner";
import { NotificationProvider } from "@/components/NotificationContext";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"], // Adjust weights as needed
  variable: "--font-inter", // Custom CSS variable
});

export const metadata: Metadata = {
  title: "Pharma - Healthcare Innovations",
  description:
    "Streamline your healthcare operations with our powerful CRM app. Features include real-time appointment scheduling, patient and inventory management, notifications, and easy billing. Focus on patient care today!",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gray-100 w-full">
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </Suspense>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
