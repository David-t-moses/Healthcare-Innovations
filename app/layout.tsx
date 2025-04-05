import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/globals.css";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { Toaster } from "sonner";
import { NotificationProvider } from "@/components/NotificationContext";
import { getCurrentUser } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gray-100 w-full">
        <SupabaseProvider>
          <NotificationProvider userId={user?.id}>
            {children}
          </NotificationProvider>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
