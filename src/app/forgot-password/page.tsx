import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  return <ForgotPasswordForm />;
}
