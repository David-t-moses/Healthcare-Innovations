import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reject Order - Pharma Innovations",
  description:
    "Reject inventory orders that don't meet requirements. Provide rejection reasons, notify vendors, and maintain accurate records of all inventory decisions.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RejectOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
