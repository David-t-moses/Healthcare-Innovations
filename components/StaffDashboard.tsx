"use client";

import React from "react";
import GreetingCard from "@/components/GreetingCard";
import DashboardOverviewGrid from "@/components/DashboardOverviewGrid";
import DashboardCalendar from "@/components/DashboardCalendar";
import WeatherWidget from "@/components/WeatherWidget";

const StaffDashboard: React.FC = () => {
  return (
    <div className="p-4 pl-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <GreetingCard />
          <DashboardOverviewGrid />
        </div>
        <div className="md:col-span-1">
          <div className="md:fixed md:top-20 space-y-6">
            <DashboardCalendar />
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
