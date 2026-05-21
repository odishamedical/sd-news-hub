import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0A1C16] font-sans">
      
      {/* Primary Header */}
      <header className="bg-[#0B2B26] text-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">NEWS PORTAL</h1>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold">
            <Link href="/" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-5 translate-y-2.5">Home</Link>
            <Link href="/districts" className="hover:text-[#C5A059] transition-colors py-5">Districts</Link>
            <Link href="/categories" className="hover:text-[#C5A059] transition-colors py-5">Categories</Link>
            <Link href="/about" className="hover:text-[#C5A059] transition-colors py-5">About</Link>
          </nav>
          
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link href="https://sd-auth-center.vercel.app" className="hover:text-[#C5A059] transition-colors">Login</Link>
            <Link href="https://sd-auth-center.vercel.app" className="hover:text-[#C5A059] transition-colors">Register</Link>
            <button className="w-8 h-8 rounded border border-white/20 flex items-center justify-center hover:border-[#C5A059]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-[#051815] border-t border-[#1a3d35] text-white text-sm flex items-center overflow-hidden">
        <div className="bg-[#E63946] font-bold px-4 py-2 flex items-center gap-2 z-10 shrink-0 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
        </div>
        <div className="font-bold text-[#C5A059] px-4 py-2 shrink-0">Breaking News:</div>
        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="animate-[marquee_20s_linear_infinite] inline-block">
            Massive Earthquake Hits Japan &nbsp; | &nbsp; Odisha Govt Announces New Industrial Policy &nbsp; | &nbsp; Champions League Semi-Finals Tonight &nbsp; | &nbsp; Global Markets Rally as Tech Stocks Surge
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-serif font-bold border-b border-gray-300 pb-2 flex-1">Top Stories</h2>
            </div>
            
            {/* Hero Article */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col md:flex-row group cursor-pointer">
              <div className="w-full md:w-[60%] h-64 md:h-80 relative overflow-hidden bg-[#0B2B26]">
                <img src="/news_earthquake.png" alt="Earthquake" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="w-full md:w-[40%] bg-[#0B2B26] p-8 flex flex-col justify-center text-white relative">
                {/* Diagonal cut illusion */}
                <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-8 bg-[#0B2B26] skew-x-[-10deg]"></div>
                
                <h3 className="text-3xl font-bold font-serif mb-4 leading-tight relative z-10 group-hover:text-[#C5A059] transition-colors">Massive Earthquake Hits Japan</h3>
                <p className="text-gray-300 mb-6 relative z-10 text-sm">Widespread damage reported after powerful quake strikes the eastern coast.</p>
                <button className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] font-bold px-6 py-3 rounded self-start transition-colors relative z-10">Read More</button>
              </div>
            </div>

            {/* Sub Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group flex flex-col">
                <div className="h-40 relative overflow-hidden bg-[#0B2B26]">
                  <img src="/news_industry.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-[#0B2B26] line-clamp-2">Odisha's New Industrial Policy Unveiled</h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t pt-2">
                    <span>1 hour ago</span>
                    <span className="flex gap-1 text-[#C5A059]">★★★</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group flex flex-col">
                <div className="h-40 relative overflow-hidden bg-[#0B2B26]">
                  <img src="/news_football.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-[#0B2B26] line-clamp-2">Champions League Semi-Finals Preview</h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t pt-2">
                    <span>3 hours ago</span>
                    <span className="flex gap-1 text-[#C5A059]">★★</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group flex flex-col">
                <div className="h-40 relative overflow-hidden bg-[#0B2B26]">
                  <img src="/news_climate.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-[#0B2B26] line-clamp-2">Global Climate Summit 2026 Begins</h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t pt-2">
                    <span>5 hours ago</span>
                    <span className="flex gap-1 text-[#C5A059]">★★</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Section containing Browsers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Browse by District</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Bhubaneswar', 'Cuttack', 'Puri', 'Sambalpur', 'Rourkela', 'Berhampur'].map(dist => (
                    <button key={dist} className="bg-[#0B2B26] hover:bg-[#15463f] text-white py-2 px-4 rounded text-sm font-semibold transition-colors text-center w-full">
                      {dist}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Browse by Category</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Politics', 'Sports', 'Business', 'Entertainment', 'Technology', 'Health'].map(cat => (
                    <button key={cat} className="bg-gray-100 hover:bg-[#C5A059] hover:text-white text-[#0A1C16] border border-gray-200 py-2 px-4 rounded text-sm font-semibold transition-colors text-center w-full">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-[#0B2B26] rounded-xl overflow-hidden shadow-sm text-white">
              <div className="bg-[#051815] px-6 py-4 border-b border-[#1a3d35]">
                <h3 className="text-xl font-bold text-[#C5A059] font-serif">Local News</h3>
              </div>
              
              <div className="p-4 flex flex-col gap-4">
                
                <div className="flex gap-4 group cursor-pointer border-b border-[#1a3d35] pb-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#C5A059] font-bold mb-1 uppercase tracking-wider">Bhubaneswar</p>
                    <h4 className="font-bold text-sm leading-snug group-hover:text-gray-300">City Celebrates Grand Rath Yatra Preparations</h4>
                  </div>
                  <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-[#051815]">
                    <img src="/news_rathyatra.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Rath Yatra" />
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer border-b border-[#1a3d35] pb-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#C5A059] font-bold mb-1 uppercase tracking-wider">Cuttack</p>
                    <h4 className="font-bold text-sm leading-snug group-hover:text-gray-300">Monsoon Floods Cause Havoc in the District Areas</h4>
                  </div>
                  <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-[#051815]">
                    <img src="/news_floods.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Floods" />
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer">
                  <div className="flex-1">
                    <p className="text-xs text-[#C5A059] font-bold mb-1 uppercase tracking-wider">Puri</p>
                    <h4 className="font-bold text-sm leading-snug group-hover:text-gray-300">Annual Beach Festival Draws Thousands of Tourists</h4>
                  </div>
                  <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-[#051815]">
                    <img src="/news_puri.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Puri" />
                  </div>
                </div>

              </div>
              <button className="w-full py-3 bg-[#051815] text-[#C5A059] text-sm font-bold hover:bg-black transition-colors">View All Local News</button>
            </div>

            {/* Newsletter or Ad Box */}
            <div className="bg-[#C5A059] rounded-xl p-6 text-[#0A1C16] shadow-sm">
              <h3 className="font-bold text-xl font-serif mb-2">Subscribe to Daily Brief</h3>
              <p className="text-sm mb-4">Get the latest top stories delivered directly to your inbox every morning.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Your email address" className="px-4 py-2 rounded border-none outline-none text-sm" />
                <button className="bg-[#0B2B26] hover:bg-[#051815] text-white font-bold py-2 rounded text-sm transition-colors">Subscribe</button>
              </div>
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
      `}} />

    </div>
  );
}
