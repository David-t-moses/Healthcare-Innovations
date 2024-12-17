"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function StaffOverview() {
  const [staff, setStaff] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStaffStatus = async () => {
      const { data } = await supabase.from("StaffStatus").select("*");

      setStaff(data);
    };

    const channel = supabase
      .channel("staff_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_status" },
        (payload) => {
          fetchStaffStatus();
        }
      )
      .subscribe();

    fetchStaffStatus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      {staff.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {member.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              member.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {member.status}
          </span>
        </div>
      ))}
    </div>
  );
}
