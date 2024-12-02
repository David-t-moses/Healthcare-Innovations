import Dashboard from "@/components/Dashboard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard>{children}</Dashboard>;
}
