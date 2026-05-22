import Parser from "rss-parser";
import { unstable_cache } from "next/cache";

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['description', 'description']
    ]
  }
});

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
}

export interface NewsCategory {
  title: string;
  items: NewsItem[];
}

/**
 * Extracts the image URL from a Google News description block.
 * Google News puts images inside the description HTML.
 */
function extractImageFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : undefined;
}

/**
 * Generates a deterministic distinct image for an article.
 */
function getDeterministicImage(id: string): string {
  // Use a simple hash of the ID to get a consistent seed
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  return `https://picsum.photos/seed/${seed}/800/500`;
}

/**
 * Fetches an RSS feed from Google News for a given search query.
 */
export async function fetchNewsByQuery(query: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const feedUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    // We bypass node fetch caching to rely on Next.js native unstable_cache
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.slice(0, limit).map((item, index) => {
      // Clean up the title (Google News appends the source with a dash at the end)
      const rawTitle = item.title || "";
      const lastDash = rawTitle.lastIndexOf(" - ");
      const title = lastDash > -1 ? rawTitle.substring(0, lastDash) : rawTitle;
      const source = lastDash > -1 ? rawTitle.substring(lastDash + 3) : "Unknown Source";

      const id = item.guid || `${query}-${index}`;
      let imageUrl = extractImageFromHtml(item.description || item.content);
      if (!imageUrl) {
        imageUrl = getDeterministicImage(id);
      }

      return {
        id,
        title,
        link: item.link || "#",
        pubDate: item.pubDate || new Date().toISOString(),
        source,
        imageUrl
      };
    });
  } catch (error) {
    console.error(`Error fetching news for ${query}:`, error);
    return [];
  }
}

/**
 * We wrap the aggregate function in Next.js unstable_cache so that it is revalidated every 5 minutes.
 * This ensures fast page loads while keeping news reasonably fresh.
 */
export const getAggregateNews = unstable_cache(
  async () => {
    // We will fetch these categories in parallel
    const queries = [
      { key: "breaking", q: "India News", limit: 5 },
      { key: "odisha", q: "Odisha", limit: 6 },
      { key: "politics", q: "India Politics", limit: 4 },
      { key: "business", q: "India Business", limit: 4 },
      { key: "tech", q: "Technology India", limit: 4 },
      { key: "health", q: "Health Medical News India", limit: 4 },
      { key: "gold", q: "Gold Price Jewelry News India", limit: 4 },
      { key: "bhubaneswar", q: "Bhubaneswar", limit: 3 },
      { key: "cuttack", q: "Cuttack", limit: 3 },
      { key: "sambalpur", q: "Sambalpur", limit: 3 }
    ];

    const results: Record<string, NewsItem[]> = {};

    await Promise.all(
      queries.map(async (query) => {
        results[query.key] = await fetchNewsByQuery(query.q, query.limit);
      })
    );

    return results;
  },
  ["aggregate-news-feeds"],
  { revalidate: 300 } // Revalidate every 5 minutes (300 seconds)
);
