"use client";

import Image from "next/image";

interface BrandLogoProps {
  fontSize?: string;
}

export default function BrandLogo({
  fontSize = "1.5rem",
}: BrandLogoProps) {
  const width = fontSize === "1.25rem" ? 205 : 225;

  return (
    <Image
      src="/havlook-logo.png"
      alt="HavLook"
      width={1494}
      height={566}
      priority
      style={{
        width: `${width}px`,
        height: "auto",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
