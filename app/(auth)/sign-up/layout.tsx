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
    <div>
      {children}
    </div>
  );
}
