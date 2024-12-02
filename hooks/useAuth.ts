"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Ensure user stays on protected routes if authenticated
          if (
            window.location.pathname === "/sign-in" ||
            window.location.pathname === "/sign-up"
          ) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Handle different auth events
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          router.push("/dashboard");
        }
      } else {
        setUser(null);
        // Only redirect to sign-in if not already on an auth page
        if (!window.location.pathname.includes("sign-")) {
          router.push("/sign-in");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return { isLoading, user };
}
