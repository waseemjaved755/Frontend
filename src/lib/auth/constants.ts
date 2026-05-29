/** Routes that use AuthShell fullscreen (hide map toolbar even if session exists). */
export const AUTH_SHELL_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/reset-password",
  "/setup",
] as const;

export const AUTH_RESET_PATH = "/auth/reset-password";
