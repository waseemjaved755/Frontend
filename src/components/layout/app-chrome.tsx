"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AUTH_SHELL_PATHS } from "@/lib/auth/constants";
import { SiteHeader } from "@/components/layout/site-header";

type AppChromeProps = {
  children: ReactNode;
  email?: string | null;
};

export function AppChrome({ children, email }: AppChromeProps) {
  const pathname = usePathname();
  /** Auth flows use AuthShell only — never stack the map toolbar on top. */
  const hideHeader = (AUTH_SHELL_PATHS as readonly string[]).includes(pathname);

  return (
    <>
      {!hideHeader ? <SiteHeader email={email} /> : null}
      <main className="relative">{children}</main>
    </>
  );
}
