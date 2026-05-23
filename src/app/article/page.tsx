import React from "react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA]">
      
      {/* SD News Hub Reader Header */}
      <header className="h-16 bg-[#0B2B26] text-white shrink-0 flex items-center justify-between px-6 border-b border-[#1a3d35] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded bg-[#0A1C16]">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <span className="text-xl font-bold tracking-wider text-white hidden sm:block">SD NEWS HUB</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-bold transition-colors">
            Return Home ✕
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Article Snippet & Primary Ad) */}
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
          <div className="w-full h-64 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded text-gray-500 font-bold text-sm">
            [ In-Article AdSense Placeholder ]
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
