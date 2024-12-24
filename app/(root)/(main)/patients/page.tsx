"use client";

import { useState, useEffect } from "react";
import PatientList from "@/components/PatientList";
import PatientGrid from "@/components/PatientGrid";
import AddPatientModal from "@/components/AddPatientModal";
import PatientAnalytics from "@/components/PatientAnalytics";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import the LoadingSpinner component
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const supabase = createClientComponentClient();

  // Simulated data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleDeletePatient = async (patientId: string) => {
    const { error } = await supabase
      .from("Patient")
      .delete()
      .eq("id", patientId);

    if (error) {
      toast.error("Failed to delete patient");
    } else {
      toast.success("Patient deleted successfully");
    }
  };

  // Display loading spinner while isLoading is true
  if (isLoading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Patients
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
          flex items-center space-x-2 transition-colors w-full sm:w-auto justify-center"
        >
          <span>Add Patient</span>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 w-full">
        <PatientAnalytics />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="w-full">
          <PatientList onDeletePatient={handleDeletePatient} />
        </TabsContent>
        <TabsContent value="grid" className="w-full">
          <PatientGrid onDeletePatient={handleDeletePatient} />
        </TabsContent>
      </Tabs>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
