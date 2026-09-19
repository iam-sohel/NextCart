import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * NEXTCART — Next.js config.
 *
 * Image handling note (Next.js 16):
 *   `images.domains` is deprecated as of Next 16. The supported ways to
 *   allowlist remote image hosts are:
 *     - `images.remotePatterns` (recommended)
 *     - `images.localPatterns`   (constrain which `/public/**` paths may
 *                                be optimized)
 *   Local `/public/**` images remain optimizable. Remote images are
 *   environment-driven:
 *     - the API host is derived from `NEXT_PUBLIC_API_BASE_URL`, because the
 *       frontend absolutizes backend-relative image paths to that host;
 *     - localhost API hosts are allowed only outside production;
 *     - additional CDN hosts can be added with
 *       `NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES`.
 *
 * Production deployments must set `NEXT_PUBLIC_API_BASE_URL` (and
 * `NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES` when a separate image CDN is used)
 * at build time. There is intentionally no production localhost fallback.
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

/**
 * Derive the image remote pattern for the configured API host. Backend
 * image payloads may be relative (for example `/uploads/...`), and the
 * frontend absolutizes those URLs to `NEXT_PUBLIC_API_BASE_URL`. Next.js
 * must therefore allow that same host for optimized remote images.
 */
function apiRemotePattern(): RemotePattern[] {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!raw) {
    return localhostApiRemotePatterns();
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return localhostApiRemotePatterns();
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return localhostApiRemotePatterns();
  }

  // Never allow a localhost API host in a production bundle. Production has
  // no valid localhost image source; deployments must configure a real API
  // host instead of relying on the development fallback.
  if (
    process.env.NODE_ENV === "production" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  ) {
    return [];
  }

  return [
    {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      pathname: "/**",
      ...(url.port ? { port: url.port } : {}),
    },
  ];
}

/**
 * Development-only API image hosts. These exist because local development
 * defaults to `http://localhost:8080` when `NEXT_PUBLIC_API_BASE_URL` is
 * unset. They are never added to production bundles.
 */
function localhostApiRemotePatterns(): RemotePattern[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return [
    { protocol: "http", hostname: "localhost", port: "8080", pathname: "/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "8080", pathname: "/**" },
  ];
}

const remotePatterns: RemotePattern[] = [
  ...apiRemotePattern(),
  // External image CDN used by backend (e.g., Unsplash)
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
];

for (const hostname of remoteHostnames) {
  remotePatterns.push({ protocol: "https", hostname, pathname: "/**" });
}

const nextConfig: NextConfig = {
  // Pin the workspace root to this frontend directory. The repository root
  // contains a stray package.json/package-lock.json (unrelated MUI/icon
  // leftovers, not a real workspace), which otherwise makes Next.js infer
  // the wrong root and emit a build warning.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
    // Permissive during development; tighten before going live.
    localPatterns: [{ pathname: "/**", search: "" }],
    remotePatterns,
  },
};

export default nextConfig;
