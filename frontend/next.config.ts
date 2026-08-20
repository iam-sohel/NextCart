import type { NextConfig } from "next";

/**
 * NEXTCART — Next.js config.
 *
 * Image handling note (Next.js 16):
 *   `images.domains` is deprecated as of Next 16. The supported ways to
 *   allowlist remote image hosts are:
 *     - `images.remotePatterns` (recommended)
 *     - `images.localPatterns`   (constrain which `/public/**` paths may
 *                                be optimized)
 *   We keep `localPatterns` permissive for development (the mock catalogue
 *   uses several `/products/...` paths) and we configure
 *   `remotePatterns` for the Spring Boot API host (`localhost:8080`) plus
 *   an opt-in `NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES` comma list so the CDN
 *   host can be added per-environment without a code change.
 *
 *   When the backend's image strategy changes (e.g. moves to a CDN), add
 *   that hostname here or set NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES.
 */

const remoteHostnames = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

interface RemotePattern {
  protocol: "http" | "https";
  hostname: string;
  pathname?: string;
  port?: string;
}

const remotePatterns: RemotePattern[] = [
  // The Spring Boot API host — used when the backend returns relative
  // image paths that the frontend absolutizes to API_BASE_URL.
  { protocol: "http", hostname: "localhost", port: "8080", pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8080", pathname: "/**" },
];

for (const hostname of remoteHostnames) {
  remotePatterns.push({ protocol: "https", hostname, pathname: "/**" });
}

const nextConfig: NextConfig = {
  images: {
    // Permissive during development; tighten before going live.
    localPatterns: [{ pathname: "/**", search: "" }],
    remotePatterns,
  },
};

export default nextConfig;
