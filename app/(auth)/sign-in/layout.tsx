import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Pharma Innovations",
  description:
    "Sign in to access your Pharma Innovations dashboard. Manage patients, appointments, inventory, and more from our secure platform.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      {children}
    </div>
  );
}
