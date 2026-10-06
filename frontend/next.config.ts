import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const remoteHostnames = (
    process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES ?? ""
)
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

interface RemotePattern {
  protocol: "http" | "https";
  hostname: string;
  pathname?: string;
  port?: string;
}

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

  if (
      process.env.NODE_ENV === "production" &&
      (url.hostname === "localhost" ||
          url.hostname === "127.0.0.1")
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

function localhostApiRemotePatterns(): RemotePattern[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return [
    {
      protocol: "http",
      hostname: "localhost",
      port: "8080",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "8080",
      pathname: "/**",
    },
  ];
}

const remotePatterns: RemotePattern[] = [
  ...apiRemotePattern(),

  // Supabase Storage - product images
  {
    protocol: "https",
    hostname: "cbkyvodjqyiebtdexrrd.supabase.co",
    pathname: "/storage/v1/object/public/product-images/**",
  },

  // External image CDN
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

for (const hostname of remoteHostnames) {
  remotePatterns.push({
    protocol: "https",
    hostname,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },

  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
    ],

    remotePatterns,
  },
};

export default nextConfig;