"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { SignupForm } from "@/components/SignupForm";
import { DecorativeSection } from "@/components/DecorativeSection";
import { signUp } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  role: "PATIENT" | "STAFF";
  organisationKey?: string;
  phone?: string;
  dateOfBirth?: string;
  insurance?: string;
  emergencyContact?: string;
}

export default function SignUp() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
    organisationKey: "",
    phone: "",
    dateOfBirth: "",
    insurance: "",
    emergencyContact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await signUp(formData);
      if (result.success) {
        toast.success(result.message);
        // window.location.href = "/dashboard";
      } else if (result.error) {
        toast.error(result.error);
        console.error(result.error);
      }
    });
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
            Pharma
          </motion.h1>
          <p className="text-gray-600">Your Health, Our Priority</p>
        </div>

        <SignupForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isLoading={isPending}
        />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Login
            </a>
          </p>
        </div>
      </motion.div>

      <DecorativeSection />
    </div>
  );
}
