export function getCsrNameFromUrl() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");

  if (!path) {
    return "Direct";
  }

  const firstSegment = path.split("/")[0];

  try {
    return decodeURIComponent(firstSegment) || "Direct";
  } catch {
    return firstSegment || "Direct";
  }
}