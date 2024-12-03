import { cookies } from "next/headers";
import AppointmentScheduler from "@/components/AppointmentScheduler";

interface PageProps {
  searchParams: { patientId?: string };
}

async function getData() {
  const cookieStore = cookies();
  const authToken = cookieStore.get("sb-zfxigyrendxuhjlyyyyq-auth-token");
  return { authToken: authToken?.value };
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const data = await getData();

  return (
    <div className="container mx-auto py-6">
      <AppointmentScheduler patientId={searchParams.patientId} />
    </div>
  );
}
