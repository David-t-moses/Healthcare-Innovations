"use server";

import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

export async function signUp(formData: {
  fullName: string;
  email: string;
  password: string;
  role: "PATIENT" | "STAFF";
}) {
  const supabase = createServerActionClient({ cookies });

  try {
    const hashedPassword = await hash(formData.password, 10);

    // Create Prisma user
    const user = await prisma.user.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        password: hashedPassword,
        role: formData.role,
      },
    });

    // Create Supabase user
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: supabaseError } = await adminClient.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

    if (supabaseError) {
      await prisma.user.delete({
        where: { id: user.id },
      });
      return { error: supabaseError.message };
    }

    // Sign in and create session
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: formData.email,
        password: formData.password,
      }
    );

    if (signInError) {
      return { error: signInError.message };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = createServerActionClient({ cookies });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return { error: error.message };
    }

    // Fetch user data from Prisma if needed
    const user = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    return { success: true, user };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function signOut() {
  const supabase = createServerActionClient({ cookies });

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
