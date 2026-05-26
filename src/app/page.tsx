import React from "react";
import Link from "next/link";
import { getAggregateNews, getCustomNews, NewsItem } from "@/lib/news";
import NewsAuthHeader from "@/components/NewsAuthHeader";
import MobileMenu from "@/components/MobileMenu";
import WhatsAppSubscriberBox from "@/components/WhatsAppSubscriberBox";

// Helper component for displaying a news card
function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const fallbackImage = "/news_industry.png";
  const image = item.imageUrl || fallbackImage;

  const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;

  if (featured) {
    return (
      <Link href={readerUrl} className="bg-slate-950/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-slate-900 hover:border-slate-800/80 flex flex-col md:flex-row group cursor-pointer block h-full transition-all duration-500">
        <div className="w-full md:w-[60%] h-64 md:h-[400px] relative overflow-hidden bg-[#020610]">
          <img src={image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="w-full md:w-[40%] bg-gradient-to-br from-[#090F21]/90 to-[#020610]/95 p-8 flex flex-col justify-center text-white relative">
          <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase mb-2 relative z-10">{item.source}</span>
          <h3 className="text-2xl md:text-3xl font-bold font-serif mb-4 leading-tight relative z-10 group-hover:text-[#C5A059] transition-colors">{item.title}</h3>
          <p className="text-slate-400 mb-6 relative z-10 text-xs font-light">Published: {new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <span className="bg-gradient-to-r from-[#C5A059] to-[#b08d4b] hover:opacity-90 text-[#020610] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl self-start transition-all duration-300 relative z-10 shadow-[0_0_15px_rgba(197,160,89,0.2)]">Read Article</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={readerUrl} className="bg-[#070d1e]/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-900/80 hover:border-slate-800 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] cursor-pointer group flex flex-col h-full transition-all duration-300">
      <div className="h-40 relative overflow-hidden bg-slate-950">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-mono font-bold text-[#C5A059] uppercase tracking-wider block mb-1">{item.source}</span>
          <h4 className="font-bold text-sm text-[#e2e8f0] group-hover:text-[#C5A059] line-clamp-3 leading-snug transition-colors">{item.title}</h4>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 border-t border-slate-900/60 pt-2">
          <span>{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-[#C5A059] font-semibold">↗ Read</span>
        </div>
      </div>
    </Link>
  );
}

// Helper component for small list items (Sidebar)
function NewsListItem({ item, category }: { item: NewsItem; category: string }) {
  const fallbackImage = "/news_puri.png";
  const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;
  return (
    <Link href={readerUrl} className="flex gap-4 group cursor-pointer border-b border-slate-900/40 pb-4 last:border-b-0 last:pb-0">
      <div className="flex-1 text-left">
        <p className="text-[9px] font-mono text-[#C5A059] font-bold mb-1 uppercase tracking-wider">{category}</p>
        <h4 className="font-bold text-xs text-[#e2e8f0] leading-snug group-hover:text-[#C5A059] line-clamp-3 transition-colors">{item.title}</h4>
      </div>
      <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-[#020610] border border-slate-900">
        <img src={item.imageUrl || fallbackImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
      </div>
    </Link>
  );
}

// Helper component for a grid section
function NewsGridSection({ title, items }: { title: string; items: NewsItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-serif font-bold text-white whitespace-nowrap">{title}</h2>
        <div className="h-[1px] bg-slate-900 flex-1"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams.lang === 'or' ? 'or' : 'en';
  const news = await getAggregateNews(lang);
  const customNews = await getCustomNews();

  // Helper to merge custom news into rss categories
  const mergeNews = (rssItems: NewsItem[] = [], categoryKey: string) => {
    const customItems = customNews.filter((n: any) => n.status === "published" && n.category === categoryKey.toLowerCase());
    return [...customItems, ...rssItems];
  };

  const breaking = mergeNews(news.breaking, "breaking");
  const odisha = mergeNews(news.odisha, "odisha");
  const politics = mergeNews(news.politics, "politics");
  const business = mergeNews(news.business, "business");
  const tech = mergeNews(news.tech, "tech");
  const health = mergeNews(news.health, "health");
  const gold = mergeNews(news.gold, "gold");
  
  // District news for sidebar
  const bhubaneswar = news.bhubaneswar?.[0];
  const cuttack = news.cuttack?.[0];
  const sambalpur = news.sambalpur?.[0];

  const topHero = breaking[0];
  const topSubArticles = breaking.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#020610] text-[#e2e8f0] font-sans pb-16">
      
      {/* Primary Header */}
      <header className="bg-[#050B1B]/80 backdrop-blur-md border-b border-slate-900/60 sticky top-[40px] z-50 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger Menu */}
            <MobileMenu lang={lang} />
            <div className="hidden sm:flex w-8 h-8 border-2 border-[#C5A059] items-center justify-center rounded-lg bg-slate-950">
              <span className="text-[#C5A059] font-black text-xs font-mono">NP</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white font-serif whitespace-nowrap">
              SD NEWS <span className="text-[#C5A059]">HUB</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-mono font-bold">
            <Link href="/" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-5 translate-y-2.5">
              {lang === 'or' ? 'ମୁଖ୍ୟ ପୃଷ୍ଠା' : 'Home'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] text-slate-400 transition-colors py-5">
              {lang === 'or' ? 'ଓଡ଼ିଶା' : 'Odisha'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] text-slate-400 transition-colors py-5">
              {lang === 'or' ? 'ରାଜନୀତି' : 'Politics'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] text-slate-400 transition-colors py-5">
              {lang === 'or' ? 'ବ୍ୟବସାୟ' : 'Business'}
            </Link>
          </nav>
          
          <NewsAuthHeader lang={lang} />
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-[#04091A] border-b border-slate-900/80 text-white text-xs flex items-center overflow-hidden">
        <div className="bg-[#E63946] font-bold px-4 py-2.5 flex items-center gap-2 z-10 shrink-0 uppercase tracking-widest font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> {lang === 'or' ? 'ଲାଇଭ୍' : 'LIVE'}
        </div>
        <div className="font-bold text-[#C5A059] px-4 py-2.5 shrink-0 uppercase tracking-wider font-mono text-[10px] bg-slate-950/40 border-r border-slate-900">{lang === 'or' ? 'ସର୍ବଶେଷ ଅପଡେଟ୍:' : 'Latest Updates:'}</div>
        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="animate-[marquee_30s_linear_infinite] inline-block hover:pause">
            {breaking.map((n, i) => (
              <React.Fragment key={n.id}>
                {n.title} &nbsp; <span className="text-[#C5A059]">|</span> &nbsp;
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-2xl font-serif font-bold text-white whitespace-nowrap">
                {lang === 'or' ? 'ଭାରତର ମୁଖ୍ୟ ଖବର' : 'India Top Stories'}
              </h2>
              <div className="h-[1px] bg-slate-900 flex-1"></div>
            </div>
            
            {/* Hero Article */}
            {topHero && (
              <div className="mb-2">
                <NewsCard item={topHero} featured={true} />
              </div>
            )}

            {/* Sub Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {topSubArticles.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Local District News */}
            <div className="bg-[#070d1e]/60 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-900 shadow-xl">
              <div className="bg-[#050B1B]/80 px-6 py-4 border-b border-slate-900/60">
                <h3 className="text-base font-bold text-[#C5A059] font-serif uppercase tracking-wider">Odisha Districts Live</h3>
              </div>
              <div className="p-5 flex flex-col gap-5">
                {bhubaneswar && <NewsListItem item={bhubaneswar} category="Bhubaneswar" />}
                {cuttack && <NewsListItem item={cuttack} category="Cuttack" />}
                {sambalpur && <NewsListItem item={sambalpur} category="Sambalpur" />}
              </div>
              <button className="w-full py-3 bg-slate-950/40 text-slate-300 text-xs font-mono font-bold hover:bg-slate-900/60 border-t border-slate-900/60 transition-colors uppercase tracking-widest">
                View All Districts
              </button>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-[#0B2B26]/60 via-[#070d1e]/90 to-[#020610]/95 border border-[#C5A059]/20 rounded-3xl p-6 text-[#e2e8f0] shadow-xl relative overflow-hidden backdrop-blur-md">
              <h3 className="font-bold text-lg font-serif mb-2 text-[#C5A059]">Subscribe to Daily Brief</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Get the latest top stories delivered directly to your inbox every morning.</p>
              <div className="flex flex-col gap-2 relative z-10">
                <input type="email" placeholder="Your email address" className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 outline-none text-xs focus:border-[#C5A059]/40 transition-colors" />
                <button className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#020610] font-bold py-2.5 rounded-xl text-xs transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.15)] uppercase tracking-wider font-mono">Subscribe</button>
              </div>
            </div>

            {/* WhatsApp Subscriber Box */}
            <WhatsAppSubscriberBox />

          </div>
        </div>

        {/* Categorized Grid Sections */}
        <NewsGridSection title={lang === 'or' ? 'ଓଡ଼ିଶା ଖବର' : 'Odisha State News'} items={odisha.slice(0, 4)} />
        <NewsGridSection title={lang === 'or' ? 'ରାଜନୀତି' : 'Politics & Government'} items={politics} />
        <NewsGridSection title={lang === 'or' ? 'ବ୍ୟବସାୟ' : 'Business & Economy'} items={business} />
        
        {/* Two Column Grid for specific niches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-serif font-bold text-white whitespace-nowrap">{lang === 'or' ? 'ଟେକ୍ନୋଲୋଜି' : 'Technology'}</h2>
              <div className="h-[1px] bg-slate-900 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tech.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-serif font-bold text-white whitespace-nowrap">{lang === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ମେଡିକାଲ' : 'Healthcare & Medical'}</h2>
              <div className="h-[1px] bg-slate-900 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {health.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Gold specific section matching SD Ecosystem */}
        <div className="mt-16 bg-gradient-to-br from-[#090F21]/80 via-[#060b17]/95 to-[#020610]/98 border border-[#2A344A]/30 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-5"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#C5A059]">Gold Market Insights</h2>
              <Link href="https://shyamdash.com" className="text-xs font-bold text-sky-400 hover:underline">Trade on SD Gold Hub →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gold.map(item => {
                const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;
                return (
                <Link key={item.id} href={readerUrl} className="bg-[#040815]/90 rounded-2xl overflow-hidden border border-slate-900 hover:border-[#C5A059] transition-all duration-300 group shadow-lg">
                  <div className="h-32 bg-slate-950/80 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="Gold" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏆</div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-mono font-bold text-[#C5A059] uppercase tracking-wider">{item.source}</span>
                    <h4 className="text-xs font-bold mt-1 text-slate-300 group-hover:text-white line-clamp-3 leading-snug transition-colors">{item.title}</h4>
                  </div>
                </Link>
              )})}
            </div>
          </div>
        </div>

      </main>

      {/* Tailwind Keyframes for Marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}} />

    </div>
  );
}
