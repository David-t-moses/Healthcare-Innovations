"use client";
import { useEffect, useState } from "react";
import { getActiveStaff } from "@/lib/actions/staff.actions";

export default function StaffOverview() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStatus = async () => {
      const staffData = await getActiveStaff();
      setStaff(staffData);
      setLoading(false);
    };

    fetchStaffStatus();

    // Refresh every minute to keep data current
    const interval = setInterval(fetchStaffStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
