import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Pharma Innovations",
  description:
    "Create a new account with Pharma Innovations. Join our platform to streamline your pharmacy operations with our comprehensive management system.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function SignUpLayout({
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
