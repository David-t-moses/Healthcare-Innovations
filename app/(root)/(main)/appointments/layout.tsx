export const metadata: Metadata = {
  title: "Appointments - Pharma Innovations",
  description:
    "Streamline your healthcare operations with our powerful CRM app. Features include real-time appointment scheduling, patient and inventory management, notifications, and easy billing. Focus on patient care today!",
  icons: {
    icon: "/favicon.png",
  },
};

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
