export function getTarget(url: string | null | undefined) {
  if (!url) return undefined;
  const isRelative = url.startsWith("/") || url.startsWith("#") || url.startsWith(".");
  return isRelative ? undefined : "_blank";
}

export function getRel(url: string | null | undefined) {
  return getTarget(url) === "_blank" ? "noopener noreferrer" : undefined;
}
