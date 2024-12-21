import { getCurrentUser } from "@/lib/auth";
import MedicalRecordList from "@/components/MedicalRecordList";

export default async function MedicalRecordsPage() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto py-6">
      <MedicalRecordList userRole={user?.role} />
    </div>
  );
}
