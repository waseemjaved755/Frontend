import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  return <ResetPasswordForm />;
}
