import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function SignupPage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  return <SignupForm />;
}
