import type { MetadataRoute } from "next";

import { SITE_HOST, SITE_URL, isPreviewDeployment } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: SITE_HOST,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
