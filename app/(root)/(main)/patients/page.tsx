"use client";
import { useState, useEffect } from "react";
import PatientList from "@/components/PatientList";
import PatientGrid from "@/components/PatientGrid";
import AddPatientModal from "@/components/AddPatientModal";
import PatientAnalytics from "@/components/PatientAnalytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Layout, Grid } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PatientsSkeleton = () => (
  <div className="w-full min-h-screen">
    <div className="w-full container mx-auto px-4 py-8 max-w-7xl">
      <div className="w-full bg-gray-200 rounded-xl shadow-sm p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2 bg-white" />
            <Skeleton className="h-6 w-48 bg-white" />
          </div>
          <Skeleton className="h-12 w-48 rounded-lg bg-white" />
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <Skeleton className="h-10 w-48" />
            </div>
          </div>

          {/* Content Section */}
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function PatientsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeletePatient = async (patientId: string) => {
    const { error } = await supabase
      .from("Patient")
      .delete()
      .eq("id", patientId);

    if (error) {
      toast.error("Failed to delete patient, Please try again.");
    } else {
      toast.success("Patient deleted successfully");
    }
  };

  if (isLoading) {
    return <PatientsSkeleton />;
  }

  return (
    <div className="w-full min-h-screen ">
      <div className="w-fullcontainer mx-auto px-4 py-8 max-w-7xl">
        <div className=" w-full bg-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Patient Management
              </h1>
              <p className="text-gray-600">
                Manage and monitor your patient records
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg
              flex items-center gap-2 transition-all duration-200 transform hover:scale-105
              shadow-md hover:shadow-lg w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Patient</span>
            </button>
          </div>

          <div className="mb-8">
            <PatientAnalytics />
          </div>

          <Tabs defaultValue="list" className="w-full">
            <div className="flex w-full justify-between items-center mb-6">
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Layout className="w-4 h-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="grid"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Grid className="w-4 h-4" />
                  Grid View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list">
              <PatientList onDeletePatient={handleDeletePatient} />
            </TabsContent>
            <TabsContent value="grid">
              <PatientGrid onDeletePatient={handleDeletePatient} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}
