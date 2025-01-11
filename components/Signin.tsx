"use client";

import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DecorativeSection } from "./DecorativeSection";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signIn } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface LoginData {
  email: string;
  password: string;
}

const Signin = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(formData);

      if (result.success) {
        router.push(result.redirect || "/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sign in");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br bg-slate-200">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-100 p-8 rounded-xl shadow-lg w-full max-w-md md:w-1/2 relative z-10"
      >
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-blue-600 mb-2"
          >
            Welcome Back
          </motion.h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg transition-all duration-200 font-medium
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </motion.button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      <DecorativeSection />
    </div>
  );
};

export default Signin;
