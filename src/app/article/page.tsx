import React from "react";
import Link from "next/link";
import NewsAuthHeader from "@/components/NewsAuthHeader";
import { getAggregateNews, getCustomNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ searchParams }: { searchParams: Promise<{ url?: string, title?: string, source?: string, id?: string, lang?: string }> }) {
  const resolvedParams = await searchParams;
  const lang = resolvedParams.lang === 'or' ? 'or' : 'en';
  let articleUrl = resolvedParams.url || "#";
  let title = resolvedParams.title || "News Article";
  let source = resolvedParams.source || "News Source";
  let isCustom = false;
  let customContent = "";
  let imageUrl = "";

  if (resolvedParams.id) {
    isCustom = true;
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "news_articles", resolvedParams.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        title = lang === 'or' ? (data.title_or || data.title) : (data.title_en || data.title);
        source = data.reporterName || data.source || "SD News Hub";
        customContent = lang === 'or' ? (data.content_or || data.content) : (data.content_en || data.content);
        imageUrl = data.thumbnailBase64 || data.image || "";
      }
    } catch (e) {
      console.error("Error fetching custom article:", e);
    }
  }

  if (!resolvedParams.url && !resolvedParams.id) {
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
  const allNews = [
    ...(customNews || []), 
    ...(rssNews.breaking || []), 
    ...(rssNews.business || []), 
    ...(rssNews.tech || [])
  ];
  const relatedNews = allNews.filter(n => n.link !== articleUrl).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA]">
      
      {/* Primary Header */}
      <header className="bg-[#0B2B26] text-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold">
            <Link href="/" className="hover:text-[#C5A059] transition-colors py-5">
              Home
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              Odisha
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              Politics
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              Business
            </Link>
          </nav>
          
          <NewsAuthHeader lang={lang} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Article Snippet & Related News) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Top Banner Ad: IT Hub */}
          <a href="https://sd-it-hub-w3sk.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full h-24 md:h-28 rounded-xl overflow-hidden relative shadow-lg group">
            <img src="/ads/ad_ithub.png" alt="SD IT Hub" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B26]/90 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-between px-8">
              <div>
                <span className="bg-[#C5A059] text-[#0A1C16] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded mb-1 inline-block">Sponsored</span>
                <h3 className="text-white font-bold text-xl md:text-2xl">Launch Your Digital Future</h3>
                <p className="text-gray-200 text-sm hidden md:block">Register premium domains at wholesale prices</p>
              </div>
              <div className="hidden sm:block bg-white text-[#0B2B26] px-6 py-2 rounded-full font-bold shadow-md group-hover:bg-[#C5A059] transition-colors">
                Book Domain
              </div>
            </div>
          </a>

          {/* Article Brief Card or Full Custom Content */}
          <article className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 text-left">
            <div className="inline-block px-3 py-1 bg-[#0A1C16] text-[#C5A059] text-xs font-bold uppercase tracking-widest rounded mb-6">
              {source}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black font-serif text-[#0A1C16] leading-tight mb-6">
              {title}
            </h1>

            {isCustom ? (
              <div className="space-y-6">
                {imageUrl && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-slate-900 border border-slate-200">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-serif text-left">
                  {customContent}
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-center">
                  This news article is hosted on {source}. Click below to read the full, uninterrupted story on the official publisher's website.
                </p>

                <div className="text-center">
                  <a 
                    href={articleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <span>Read Full Story on {source}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </>
            )}
          </article>

          {/* In-Feed Ad: Dehapa */}
          <a href="https://sd-dehapa-hub.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full h-40 rounded-xl overflow-hidden relative shadow-lg group">
            <img src="/ads/ad_dehapa.png" alt="Dehapa Health" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded w-max mb-2">Health Ad</span>
              <h3 className="font-bold text-2xl mb-1">Feeling Unwell?</h3>
              <p className="text-blue-100 text-sm mb-3">Consult top specialists via video call instantly.</p>
              <span className="font-bold text-blue-300 group-hover:text-white transition-colors">Book Appointment ↗</span>
            </div>
          </a>

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
          
          {/* Square Ad: Bhulia Saree */}
          <a href="https://sd-bhulia-hub.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full aspect-square rounded-xl overflow-hidden relative shadow-lg group">
            <img src="/ads/ad_bhulia.png" alt="SD Bhulia Hub" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded mb-3 inline-block">Handloom</span>
              <h3 className="text-white font-bold text-xl font-serif mb-2 leading-tight">Authentic Sambalpuri Silk</h3>
              <p className="text-gray-300 text-xs mb-4">Support local weavers directly.</p>
              <div className="bg-white/10 backdrop-blur border border-white/30 text-white px-4 py-2 rounded text-sm font-bold group-hover:bg-white group-hover:text-black transition-colors inline-block">
                Shop Collection
              </div>
            </div>
          </a>

          {/* Sticky Skyscraper Ad: Gold Hub */}
          <a href="https://sd-gold-hub.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full h-[600px] rounded-xl overflow-hidden relative shadow-lg group sticky top-24 border border-[#C5A059]/30">
            <img src="/ads/ad_goldhub.png" alt="SD Gold Hub" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1C16]/80 via-transparent to-[#0A1C16]"></div>
            <div className="absolute top-8 left-0 right-0 text-center px-6">
              <span className="bg-[#C5A059] text-[#0A1C16] text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-lg shadow-[#C5A059]/20">Live Rates</span>
              <h3 className="text-white font-black text-3xl font-serif mt-6 mb-2 leading-tight">Secure Your Wealth</h3>
              <p className="text-[#C5A059] text-sm font-bold uppercase tracking-wider">24K Gold & Silver</p>
            </div>
            <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
              <div className="bg-black/50 backdrop-blur rounded p-4 border border-[#C5A059]/30 mb-6">
                <div className="text-gray-400 text-xs uppercase mb-1">Today's Price (10g)</div>
                <div className="text-[#C5A059] text-2xl font-bold font-serif">₹74,500 <span className="text-green-400 text-sm ml-1">▲</span></div>
              </div>
              <div className="bg-[#C5A059] text-[#0A1C16] w-full py-4 rounded font-bold uppercase tracking-wider group-hover:bg-white transition-colors shadow-xl shadow-[#C5A059]/20">
                Start Investing
              </div>
            </div>
          </a>

        </aside>

      </main>
      
      {/* Footer */}
      <footer className="bg-[#0A1C16] text-center py-6 text-xs text-[#C5A059] mt-8">
        © {new Date().getFullYear()} SD News Hub. All rights reserved.
      </footer>
    </div>
  );
}
