"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

const AUTH_PATHS = ["/login", "/signup", "/setup"];

type AppChromeProps = {
  children: ReactNode;
  email?: string | null;
};

export function AppChrome({ children, email }: AppChromeProps) {
  const pathname = usePathname();
  const hideHeader = AUTH_PATHS.includes(pathname) && !email;

  return (
    <>
      {!hideHeader ? <SiteHeader email={email} /> : null}
      <main className="relative">{children}</main>
    </>
  );
}
