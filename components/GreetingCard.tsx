"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

const GreetingCard: React.FC = () => {
  const [greeting, setGreeting] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [userData, setUserData] = useState<{
    fullName: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserData({
            fullName: user.fullName,
            role: user.role,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get time-based greeting and welcome message
  useEffect(() => {
    const updateTimeBasedContent = () => {
      const hour = new Date().getHours();

      // Set appropriate greeting
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
        setWelcomeMessage(
          "Welcome to your dashboard. Here you can monitor key metrics, manage appointments, and keep track of inventory. Have a productive day!"
        );
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good afternoon");
        setWelcomeMessage(
          "Welcome to your dashboard. Here you can monitor key metrics, manage appointments, and keep track of inventory. Hope your day is going well!"
        );
      } else if (hour >= 18 && hour < 22) {
        setGreeting("Good evening");
        setWelcomeMessage(
          "Welcome to your dashboard. Here you can check on today's progress, review appointments, and prepare for tomorrow."
        );
      } else {
        setGreeting("Good night");
        setWelcomeMessage(
          "You're working late! Here's a quick overview of your dashboard. Consider getting some rest soon."
        );
      }
    };

    updateTimeBasedContent();

    // Update greeting and message every hour
    const intervalId = setInterval(updateTimeBasedContent, 3600000); // 1 hour

    return () => clearInterval(intervalId);
  }, []);

  // Format the user's name to get first name
  const getFirstName = (fullName: string) => {
    return fullName.split(" ")[0];
  };

  // Format the role to be more user-friendly
  const formatRole = (role: string) => {
    if (role === "STAFF") return "Dr.";
    if (role === "PATIENT") return "";
    return "";
  };

  return (
    <div className="border-none bg-transparent shadow-none">
      <div className="pt-2">
        {isLoading ? (
          // Loading skeleton state
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          // Loaded content state
          <>
            <motion.h1
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {greeting},{" "}
              {userData
                ? `${formatRole(userData.role)} ${getFirstName(
                    userData.fullName
                  )}`
                : "User"}
            </motion.h1>

            <motion.p
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </motion.p>

            <motion.p
              className=" text-sm mt-4 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {welcomeMessage}
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
};

export default GreetingCard;
