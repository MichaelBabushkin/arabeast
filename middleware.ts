export { auth as middleware } from "@/auth";

export const config = {
  // Protect game routes; leave API and auth pages open
  matcher: ["/play/:path*"],
};
