import { redirect } from "next/navigation";

import { UploadForm } from "@/components/upload/upload-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function UploadPage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  return <UploadForm />;
}
