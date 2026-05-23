"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function MobileMenu({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localEmail = localStorage.getItem("sd_current_user_email");
      if (localEmail) {
        setUserEmail(localEmail);
        setUserName(localStorage.getItem("sd_current_user_name") || "User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sd_current_user_email");
    localStorage.removeItem("sd_current_user_name");
    localStorage.removeItem("sd_current_user_role");
    setUserEmail(null);
    setUserName("User");
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="md:hidden text-[#C5A059] hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#0B2B26] z-[100] flex flex-col p-6 animate-in fade-in slide-in-from-left duration-200">
          <div className="flex justify-between items-center mb-10 border-b border-[#1a3d35] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
                <span className="text-[#C5A059] font-bold text-sm">NP</span>
              </div>
              <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#C5A059] hover:text-white transition-colors bg-[#1a3d35] rounded-full p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <nav className="flex flex-col gap-6 text-xl font-bold text-white px-2">
            <Link onClick={() => setIsOpen(false)} href="/" className="hover:text-[#C5A059] transition-colors">{lang === 'or' ? 'ମୁଖ୍ୟ ପୃଷ୍ଠା' : 'Home'}</Link>
            <Link onClick={() => setIsOpen(false)} href="#" className="hover:text-[#C5A059] transition-colors">{lang === 'or' ? 'ଓଡ଼ିଶା' : 'Odisha'}</Link>
            <Link onClick={() => setIsOpen(false)} href="#" className="hover:text-[#C5A059] transition-colors">{lang === 'or' ? 'ରାଜନୀତି' : 'Politics'}</Link>
            <Link onClick={() => setIsOpen(false)} href="#" className="hover:text-[#C5A059] transition-colors">{lang === 'or' ? 'ବ୍ୟବସାୟ' : 'Business'}</Link>
          </nav>

          <div className="mt-auto border-t border-[#1a3d35] pt-6 flex flex-col gap-4">
            {userEmail ? (
              <>
                <button 
                  onClick={() => setShowLogout(!showLogout)}
                  className="flex items-center gap-3 text-white mb-2 text-left w-full hover:bg-[#1a3d35] p-2 -ml-2 rounded transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-[#C5A059] text-[#0A1C16] flex items-center justify-center font-bold text-lg shrink-0">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold truncate">{userName}</div>
                    <div className="text-xs text-gray-400 truncate">{userEmail}</div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showLogout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                <Link onClick={() => setIsOpen(false)} href="/dashboard" className="bg-[#C5A059] text-[#0A1C16] text-center font-bold py-3 rounded hover:bg-[#b08d4b] transition-colors">
                  {lang === 'or' ? 'ଡ୍ୟାସବୋର୍ଡ' : 'Go to Dashboard'}
                </Link>
                
                {showLogout && (
                  <button onClick={handleLogout} className="border border-red-500/30 text-red-400 font-bold py-3 rounded hover:bg-red-500/10 transition-colors animate-in fade-in slide-in-from-top-2">
                    {lang === 'or' ? 'ଲଗ୍ ଆଉଟ୍' : 'Sign Out'}
                  </button>
                )}
              </>
            ) : (
              <>
                <Link onClick={() => setIsOpen(false)} href="https://sd-auth-center.vercel.app?redirect_uri=https://sd-news-hub.vercel.app" className="bg-[#C5A059] text-[#0A1C16] text-center font-bold py-3 rounded hover:bg-[#b08d4b] transition-colors">
                  {lang === 'or' ? 'ଲଗଇନ୍ / ରେଜିଷ୍ଟର' : 'Login / Register'}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
