import Dashboard from "@/components/Dashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
