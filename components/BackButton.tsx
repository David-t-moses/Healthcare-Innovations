"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  path: string;
  className?: string;
}

export function BackButton({
  label = "Back",
  path,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(path)}
      variant="ghost"
      className={`flex items-center gap-2 hover:bg-blue-50 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
