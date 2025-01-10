"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/actions/user.actions";
import { motion } from "framer-motion";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCheckCircleFill } from "react-icons/bs";
import { BiErrorCircle } from "react-icons/bi";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setMessage("Email verified successfully!");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed, Please try again.");
      }
    });
  }, [searchParams, router]);

  const statusColors = {
    verifying: "text-blue-600",
    success: "text-green-600",
    error: "text-red-600",
  };

  const statusIcons = {
    verifying: <AiOutlineLoading3Quarters className="w-12 h-12" />,
    success: <BsCheckCircleFill className="w-12 h-12" />,
    error: <BiErrorCircle className="w-12 h-12" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: status === "verifying" ? 360 : 0 }}
            transition={{
              duration: 1,
              repeat: status === "verifying" ? Infinity : 0,
            }}
            className={`mb-4 flex justify-center ${statusColors[status]}`}
          >
            {statusIcons[status]}
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">Email Verification</h1>

          <p className={`${statusColors[status]} text-lg font-medium mb-4`}>
            {message}
          </p>

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Redirecting to dashboard...
            </motion.div>
          )}

          {status === "error" && (
            <button
              onClick={() => router.push("/sign-in")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
