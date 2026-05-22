import React from "react";
import Link from "next/link";
import { getAggregateNews, getCustomNews, NewsItem } from "@/lib/news";

// Helper component for displaying a news card
function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const fallbackImage = "/news_industry.png";
  const image = item.imageUrl || fallbackImage;

  const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;

  if (featured) {
    return (
      <Link href={readerUrl} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col md:flex-row group cursor-pointer block h-full">
        <div className="w-full md:w-[60%] h-64 md:h-[400px] relative overflow-hidden bg-[#0B2B26]">
          <img src={image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="w-full md:w-[40%] bg-[#0B2B26] p-8 flex flex-col justify-center text-white relative">
          <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-8 bg-[#0B2B26] skew-x-[-10deg]"></div>
          <span className="text-xs text-[#C5A059] font-bold uppercase tracking-wider mb-2 relative z-10">{item.source}</span>
          <h3 className="text-2xl md:text-3xl font-bold font-serif mb-4 leading-tight relative z-10 group-hover:text-[#C5A059] transition-colors">{item.title}</h3>
          <p className="text-gray-300 mb-6 relative z-10 text-sm opacity-80">Published: {new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <span className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] font-bold px-6 py-3 rounded self-start transition-colors relative z-10">Read Article</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={readerUrl} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group flex flex-col h-full">
      <div className="h-40 relative overflow-hidden bg-[#0B2B26]">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
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
  );
}

// Helper component for small list items (Sidebar)
function NewsListItem({ item, category }: { item: NewsItem; category: string }) {
  const fallbackImage = "/news_puri.png";
  const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;
  return (
    <Link href={readerUrl} className="flex gap-4 group cursor-pointer border-b border-[#1a3d35] border-opacity-30 pb-4">
      <div className="flex-1">
        <p className="text-[10px] text-[#C5A059] font-bold mb-1 uppercase tracking-wider">{category}</p>
        <h4 className="font-bold text-xs leading-snug group-hover:text-gray-600 line-clamp-3">{item.title}</h4>
      </div>
      <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-[#051815]">
        <img src={item.imageUrl || fallbackImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="News" />
      </div>
    </Link>
  );
}

// Helper component for a grid section
function NewsGridSection({ title, items }: { title: string; items: NewsItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-xl font-serif font-bold border-b border-gray-300 pb-2 mb-4 text-[#0B2B26]">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    const customItems = customNews.filter(n => n.category === categoryKey);
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
    <div className="min-h-screen bg-[#F4F1EA] text-[#0A1C16] font-sans">
      
      {/* Primary Header */}
      <header className="bg-[#0B2B26] text-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold">
            <Link href="/" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-5 translate-y-2.5">
              {lang === 'or' ? 'ମୁଖ୍ୟ ପୃଷ୍ଠା' : 'Home'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              {lang === 'or' ? 'ଓଡ଼ିଶା' : 'Odisha'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              {lang === 'or' ? 'ରାଜନୀତି' : 'Politics'}
            </Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">
              {lang === 'or' ? 'ବ୍ୟବସାୟ' : 'Business'}
            </Link>
          </nav>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Language Switcher */}
            <div className="flex border border-[#1a3d35] rounded overflow-hidden">
              <Link href="/?lang=en" className={`px-2 py-1 ${lang === 'en' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>EN</Link>
              <Link href="/?lang=or" className={`px-2 py-1 ${lang === 'or' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>ଓଡ଼ିଆ</Link>
            </div>
            
            {/* Auth Links */}
            <Link href="https://sd-auth-center.vercel.app" className="hover:text-[#C5A059] transition-colors hidden sm:block">Login</Link>
            <Link href="https://sd-auth-center.vercel.app" className="bg-[#C5A059] text-[#0A1C16] hover:bg-[#b08d4b] px-3 py-1.5 rounded transition-colors hidden sm:block">Register</Link>
            
            <Link href="/register-reporter" className="border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1C16] px-3 py-1.5 rounded transition-colors">
              {lang === 'or' ? 'ଯୋଗଦାନ କରନ୍ତୁ' : 'Contribute News'}
            </Link>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-[#051815] border-t border-[#1a3d35] text-white text-sm flex items-center overflow-hidden">
        <div className="bg-[#E63946] font-bold px-4 py-2 flex items-center gap-2 z-10 shrink-0 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> {lang === 'or' ? 'ଲାଇଭ୍' : 'LIVE'}
        </div>
        <div className="font-bold text-[#C5A059] px-4 py-2 shrink-0">{lang === 'or' ? 'ସର୍ବଶେଷ ଅପଡେଟ୍:' : 'Latest Updates:'}</div>
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
            <h2 className="text-2xl font-serif font-bold border-b border-gray-300 pb-2 text-[#0B2B26]">{lang === 'or' ? 'ଭାରତର ମୁଖ୍ୟ ଖବର' : 'India Top Stories'}</h2>
            
            {/* Hero Article */}
            {topHero && (
              <div className="mb-2">
                <NewsCard item={topHero} featured={true} />
              </div>
            )}

            {/* Sub Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topSubArticles.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Local District News */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="bg-[#051815] px-6 py-4 border-b border-[#1a3d35]">
                <h3 className="text-lg font-bold text-[#C5A059] font-serif">Odisha Districts Live</h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {bhubaneswar && <NewsListItem item={bhubaneswar} category="Bhubaneswar" />}
                {cuttack && <NewsListItem item={cuttack} category="Cuttack" />}
                {sambalpur && <NewsListItem item={sambalpur} category="Sambalpur" />}
              </div>
              <button className="w-full py-3 bg-[#f8f9fa] text-[#0A1C16] text-xs font-bold hover:bg-gray-200 transition-colors">View All Districts</button>
            </div>

            {/* Newsletter */}
            <div className="bg-[#C5A059] rounded-xl p-6 text-[#0A1C16] shadow-sm">
              <h3 className="font-bold text-lg font-serif mb-2">Subscribe to Daily Brief</h3>
              <p className="text-xs mb-4">Get the latest top stories delivered directly to your inbox every morning.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Your email address" className="px-4 py-2 rounded border-none outline-none text-xs" />
                <button className="bg-[#0B2B26] hover:bg-[#051815] text-white font-bold py-2 rounded text-xs transition-colors">Subscribe</button>
              </div>
            </div>

          </div>
        </div>

        {/* Categorized Grid Sections */}
        <NewsGridSection title={lang === 'or' ? 'ଓଡ଼ିଶା ଖବର' : 'Odisha State News'} items={odisha.slice(0, 4)} />
        <NewsGridSection title={lang === 'or' ? 'ରାଜନୀତି' : 'Politics & Government'} items={politics} />
        <NewsGridSection title={lang === 'or' ? 'ବ୍ୟବସାୟ' : 'Business & Economy'} items={business} />
        
        {/* Two Column Grid for specific niches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="text-xl font-serif font-bold border-b border-gray-300 pb-2 mb-4 text-[#0B2B26]">{lang === 'or' ? 'ଟେକ୍ନୋଲୋଜି' : 'Technology'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tech.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold border-b border-gray-300 pb-2 mb-4 text-[#0B2B26]">{lang === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ମେଡିକାଲ' : 'Healthcare & Medical'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {health.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Gold specific section matching SD Ecosystem */}
        <div className="mt-8 bg-[#121A30] text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center border-b border-[#2A344A] pb-3 mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#C5A059]">Gold Market Insights</h2>
              <Link href="https://shyamdash.com" className="text-xs font-bold text-sky-400 hover:underline">Trade on SD Gold Hub →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gold.map(item => {
                const readerUrl = `/article?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`;
                return (
                <Link key={item.id} href={readerUrl} className="bg-[#0A1021] rounded-xl overflow-hidden border border-[#2A344A] hover:border-[#C5A059] transition-colors group">
                  <div className="h-32 bg-[#1A233A] relative">
                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Gold" />}
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-bold text-[#C5A059] uppercase">{item.source}</span>
                    <h4 className="text-xs font-bold mt-1 text-slate-200 group-hover:text-white line-clamp-3">{item.title}</h4>
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
