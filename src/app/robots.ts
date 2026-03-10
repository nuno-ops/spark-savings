import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://sparksavings.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/contributor/",
          "/company/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
