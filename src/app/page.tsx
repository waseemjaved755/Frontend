import { redirect } from "next/navigation";

import { MapPageClient } from "@/components/map/map-page-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-full pt-14">
      <MapPageClient />
    </div>
  );
}
