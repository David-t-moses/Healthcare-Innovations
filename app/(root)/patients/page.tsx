"use client";

import { useState } from "react";
import PatientList from "@/components/PatientList";
import PatientGrid from "@/components/PatientGrid";
import AddPatientModal from "@/components/AddPatientModal";
import PatientDetails from "@/components/PatientDetails";
import PatientAnalytics from "@/components/PatientAnalytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
          flex items-center space-x-2 transition-colors"
        >
          <span>Add Patient</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <PatientAnalytics />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <PatientList />
        </TabsContent>
        <TabsContent value="grid">
          <PatientGrid />
        </TabsContent>
      </Tabs>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
