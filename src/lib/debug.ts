/** Dev logs for photo / AI flow — visible in browser DevTools → Console */
export function photoLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("[PhotoMap]", ...args);
  }
}

export function photoLogError(...args: unknown[]): void {
  console.error("[PhotoMap]", ...args);
}
