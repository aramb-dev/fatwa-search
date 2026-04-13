import type { MetadataRoute } from "next"

const BASE_URL = "https://search.aramb.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/en/search`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/ar/search`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/en/yt-search`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ar/yt-search`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
