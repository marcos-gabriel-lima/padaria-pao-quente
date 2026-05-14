// Extract the trusted client IP from a request.
//
// On Vercel, x-real-ip is set by Vercel's edge network and cannot be forged by clients.
// x-forwarded-for is user-controllable at the leftmost position; taking the first entry
// (as the old code did) is spoofable. Taking the last entry is safer because Vercel's
// edge appends the actual client IP at the right.
export function getTrustedIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1] ?? "unknown";
  }

  return "unknown";
}
