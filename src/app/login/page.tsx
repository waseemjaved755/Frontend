import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  return <LoginForm />;
}
