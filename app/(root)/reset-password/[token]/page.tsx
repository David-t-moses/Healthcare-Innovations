"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineLockClosed } from "react-icons/hi";
import { resetPassword } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPassword({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(params.token, password);
    setIsLoading(false);

    if (result.success) {
      toast.success("Password updated successfully!");
      router.push("/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600 mt-2">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New password"
                required
                minLength={8}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
