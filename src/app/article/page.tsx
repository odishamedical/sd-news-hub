import React from "react";
import Link from "next/link";
import NewsAuthHeader from "@/components/NewsAuthHeader";
import { getAggregateNews, getCustomNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ searchParams }: { searchParams: Promise<{ url?: string, title?: string, source?: string }> }) {
  const resolvedParams = await searchParams;
  const articleUrl = resolvedParams.url || "#";
  const title = resolvedParams.title || "News Article";
  const source = resolvedParams.source || "News Source";

  if (!resolvedParams.url) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#0A1C16] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Article Provided</h1>
          <Link href="/" className="text-[#C5A059] hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  // Fetch all news to show in grid
  const [rssNews, customNews] = await Promise.all([
    getAggregateNews(),
    getCustomNews()
  ]);
  
  // Combine and pick recent news for the "Read Next" grid
  const allNews = [...customNews, ...rssNews.national, ...rssNews.business, ...rssNews.sports];
  const relatedNews = allNews.filter(n => n.link !== articleUrl).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA]">
      
      {/* Universal News Header */}
      <NewsAuthHeader lang="en" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Article Snippet & Related News) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Top Banner Ad Placeholder */}
          <div className="w-full h-24 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded text-gray-500 font-bold text-sm">
            [ Top Banner Ad Placeholder (728x90) ]
          </div>

          {/* Article Brief Card */}
          <article className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 text-center">
            <div className="inline-block px-3 py-1 bg-[#0A1C16] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded mb-6">
              {source}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black font-serif text-[#0A1C16] leading-tight mb-8">
              {title}
            </h1>

            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              This news article is hosted on {source}. Click below to read the full, uninterrupted story on the official publisher's website.
            </p>

            <a 
              href={articleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <span>Read Full Story on {source}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </article>

          {/* In-Feed Ad Placeholder */}
          <div className="w-full h-32 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded text-gray-500 font-bold text-sm">
            [ In-Article AdSense Placeholder ]
          </div>

          {/* Related News Grid */}
          <div>
            <h2 className="text-2xl font-bold font-serif mb-6 text-[#0B2B26] border-b-2 border-[#C5A059] pb-2 inline-block">Read Next</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedNews.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={`/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group flex flex-col h-full"
                >
                  <div className="h-40 relative overflow-hidden bg-[#0B2B26]">
                    <img src={item.imageUrl || "/news_industry.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-1">{item.source}</span>
                      <h4 className="font-bold text-sm mb-2 group-hover:text-[#0B2B26] line-clamp-3">{item.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t pt-2">
                      <span>{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-[#C5A059]">↗ Read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar (Ads & Promos) */}
        <aside className="flex flex-col gap-6">
          {/* Square Ad Placeholder */}
          <div className="w-full aspect-square bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded text-gray-500 font-bold text-sm text-center p-4">
            [ Sidebar Ad Placeholder (300x250) ]<br/><br/>Perfect for SD Ecosystem Cross-Promotion!
          </div>

          {/* Sticky Tall Ad Placeholder */}
          <div className="w-full h-[600px] bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded text-gray-500 font-bold text-sm sticky top-24">
            [ Sticky Skyscraper Ad Placeholder (300x600) ]
          </div>
        </aside>

      </main>
      
      {/* Footer */}
      <footer className="bg-[#0A1C16] text-center py-6 text-xs text-[#C5A059] mt-8">
        © {new Date().getFullYear()} SD News Hub. All rights reserved.
      </footer>
    </div>
  );
}
