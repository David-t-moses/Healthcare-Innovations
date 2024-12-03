import PatientDetails from "@/components/PatientDetails";

export default function PatientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-6">
      <PatientDetails patientId={params.id} />
    </div>
  );
}
