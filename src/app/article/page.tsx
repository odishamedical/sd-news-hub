import React from "react";
import Link from "next/link";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import DOMPurify from "isomorphic-dompurify";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ searchParams }: { searchParams: Promise<{ url?: string, title?: string, source?: string }> }) {
  const resolvedParams = await searchParams;
  const articleUrl = resolvedParams.url || "#";
  const title = resolvedParams.title || "Article";
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

  // --- NATIVE READER MODE LOGIC ---
  let cleanHtml = "";
  let readerError = "";

  try {
    const response = await fetch(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher blocked access: ${response.status}`);
    }

    const html = await response.text();
    const doc = new JSDOM(html, { url: articleUrl });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      throw new Error('Could not extract text from this publisher.');
    }

    cleanHtml = DOMPurify.sanitize(article.content || "", {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'class', 'id']
    });
  } catch (error: any) {
    console.error("Native Reader failed:", error);
    readerError = error.message || "Failed to load article natively.";
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
          <div className="h-8 w-px bg-gray-600 hidden sm:block mx-2"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider">{source}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-200 line-clamp-1 max-w-[200px] sm:max-w-md md:max-w-xl">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={articleUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex text-xs font-bold bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] px-4 py-2 rounded transition-colors items-center gap-2"
          >
            <span>Open Original</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
          <Link href="/" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-bold transition-colors">
            Close ✕
          </Link>
        </div>
      </header>

      {/* Reader Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 bg-white shadow-xl my-8 rounded-xl border border-gray-200">
        {readerError ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-red-600 mb-4">Reading Mode Unavailable</h2>
            <p className="text-gray-600 mb-6">{readerError}</p>
            <p className="text-sm text-gray-500 mb-8">This publisher strictly blocks native extraction. Please read the article on their official website.</p>
            <a 
              href={articleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block font-bold bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] px-6 py-3 rounded transition-colors"
            >
              Read on Official Site
            </a>
          </div>
        ) : (
          <article className="prose prose-lg prose-slate max-w-none">
            <h1 className="text-3xl font-black font-serif mb-6 text-[#0A1C16] leading-tight">{title}</h1>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-8 pb-8 border-b border-gray-100">
              <span>{source}</span>
              <span>•</span>
              <span>Native Reader Mode</span>
            </div>
            
            {/* INJECT CLEAN HTML */}
            <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
          </article>
        )}
      </main>
      
      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-500">
        Content extracted for readability. All rights belong to {source}.
      </footer>
    </div>
  );
}
