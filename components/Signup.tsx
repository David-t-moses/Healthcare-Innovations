"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SignupForm } from "./SignupForm";
import { DecorativeSection } from "./DecorativeSection";
import { FormData } from "@/types";

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    role: "patient",
    note: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      alert("User registered successfully!");
    } else {
      alert(data.message || "Something went wrong");
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
            Pharma App
          </motion.h1>
          <p className="text-gray-600">Your Health, Our Priority</p>
        </div>

        <SignupForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </motion.div>

      <DecorativeSection />
    </div>
  );
};

export default Signup;
