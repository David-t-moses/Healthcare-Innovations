import { getCurrentUser } from "@/lib/auth";
import PrescriptionList from "@/components/PrescriptionList";

export default async function PrescriptionsPage() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto py-6">
      <PrescriptionList userRole={user?.role} />
    </div>
  );
}
