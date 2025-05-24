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
    <div className="">
      {children}
    </div>
  );
}
