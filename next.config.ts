import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    // Permit all quality values used in the project
    qualities: [70, 75, 90, 95],
    // Add remote patterns when using external image URLs in future
  },
};

export default nextConfig;
