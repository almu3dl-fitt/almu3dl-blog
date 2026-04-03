const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

type PexelsPhoto = {
  src: {
    original: string;
    large2x: string;
    large: string;
  };
};

type PexelsSearchResponse = {
  photos: PexelsPhoto[];
  total_results: number;
};

/**
 * Fetches a high-quality landscape photo from Pexels matching the given query.
 * Returns null if no API key is configured or the request fails.
 */
export async function fetchPexelsCoverImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    return null;
  }

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "large");

  try {
    const response = await fetch(url.toString(), {
      headers: { Authorization: PEXELS_API_KEY },
      next: { revalidate: 86400 }, // cache result for 24 hours
    });

    if (!response.ok) {
      console.warn(`[cover-image-fetch] Pexels API error: ${response.status}`);
      return null;
    }

    const data: PexelsSearchResponse = await response.json();
    const photo = data.photos?.[0];

    return photo?.src?.large2x ?? photo?.src?.large ?? null;
  } catch (error) {
    console.warn("[cover-image-fetch] Pexels fetch failed:", error);
    return null;
  }
}
