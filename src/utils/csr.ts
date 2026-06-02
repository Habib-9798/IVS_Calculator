export function getCsrNameFromUrl(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return "Direct";
  const firstSegment = path.split("/")[0];
  try {
    return decodeURIComponent(firstSegment).toLowerCase() || "Direct";
  } catch {
    return firstSegment.toLowerCase() || "Direct";
  }
}

export function isCsrUrl(): boolean {
  const name = getCsrNameFromUrl().toLowerCase();
  return name.endsWith(".csr");
}

export function isAdminUrl(): boolean {
  return !isCsrUrl();
}

export function isDashboardRoute(): boolean {
  const path = window.location.pathname.toLowerCase();
  return path.endsWith("/dashboard");
}
