import React from "react";
import Link from "next/link";

export default function ArticlePage({ searchParams }: { searchParams: { url?: string, title?: string, source?: string } }) {
  const articleUrl = searchParams.url || "#";
  const title = searchParams.title || "Article";
  const source = searchParams.source || "News Source";

  if (!searchParams.url) {
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
    <div className="h-screen w-full flex flex-col bg-[#0A1C16] overflow-hidden">
      
      {/* SD News Hub Reader Header */}
      <header className="h-16 bg-[#0B2B26] text-white shrink-0 flex items-center justify-between px-6 border-b border-[#1a3d35] shadow-lg relative z-10">
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

      {/* Frame Loading Notice (Shows briefly or if iframe is blocked) */}
      <div className="absolute top-16 left-0 right-0 p-2 bg-[#E63946] text-white text-center text-xs font-bold z-0 flex justify-center gap-2 items-center">
        <span>If the article below is blank (due to site security), please </span>
        <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">click here to read it directly</a>.
      </div>

      {/* Article Frame */}
      <div className="flex-1 w-full bg-white relative z-10">
        <iframe 
          src={articleUrl} 
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title={title}
        ></iframe>
      </div>

    </div>
  );
}
