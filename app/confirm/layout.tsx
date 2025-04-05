import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Order - Pharma Innovations",
  description:
    "Confirm your inventory order and update stock levels. Review order details, verify quantities, and approve purchases to maintain optimal inventory levels.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function ConfirmOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
