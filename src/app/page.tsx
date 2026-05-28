import { redirect } from "next/navigation";

import { MapView } from "@/components/map/map-view";
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
    <div className="h-[calc(100vh-3.5rem)]">
      <MapView />
    </div>
  );
}
