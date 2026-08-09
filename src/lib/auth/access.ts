export const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/review", "/settings"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldRedirectToLogin(pathname: string, hasSessionCookie: boolean): boolean {
  return isProtectedPath(pathname) && !hasSessionCookie;
}
