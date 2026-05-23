"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NewsAuthHeader({ lang }: { lang: string }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [showLogout, setShowLogout] = useState(false);

  const handleLangChange = (e: React.MouseEvent, newLang: string) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set('lang', newLang);
      window.location.href = `${window.location.pathname}?${params.toString()}`;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("sso_email") || params.get("email");
      const name = params.get("sso_name") || params.get("name");
      const role = params.get("sso_role") || params.get("role");

      if (token && email && name) {
        localStorage.setItem("sd_current_user_email", email);
        localStorage.setItem("sd_current_user_name", name);
        if (role) {
          localStorage.setItem("sd_current_user_role", role);
        }
        
        // Clean URL to remove SSO params but preserve lang
        const cleanParams = new URLSearchParams(window.location.search);
        cleanParams.delete("token");
        cleanParams.delete("sso_email");
        cleanParams.delete("email");
        cleanParams.delete("sso_name");
        cleanParams.delete("name");
        cleanParams.delete("sso_role");
        cleanParams.delete("role");
        
        const cleanUrl = window.location.pathname + (cleanParams.toString() ? `?${cleanParams.toString()}` : "");
        window.history.replaceState({}, document.title, cleanUrl);
        
        setUserEmail(email);
        setUserName(name);
      } else {
        const localEmail = localStorage.getItem("sd_current_user_email");
        if (localEmail) {
          setUserEmail(localEmail);
          setUserName(localStorage.getItem("sd_current_user_name") || "User");
        }
      }
    }
  }, [lang]);

  const handleLogout = () => {
    localStorage.removeItem("sd_current_user_email");
    localStorage.removeItem("sd_current_user_name");
    localStorage.removeItem("sd_current_user_role");
    setUserEmail(null);
    setUserName("User");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold shrink-0">
      {/* Language Switcher */}
      <div className="flex border border-[#1a3d35] rounded overflow-hidden text-[10px] sm:text-xs">
        <button onClick={(e) => handleLangChange(e, 'en')} className={`px-2 py-1 ${lang === 'en' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>EN</button>
        <button onClick={(e) => handleLangChange(e, 'or')} className={`px-2 py-1 ${lang === 'or' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>ଓଡ଼ିଆ</button>
      </div>
      
      {/* Auth Links */}
      {userEmail ? (
        <div className="relative hidden sm:flex items-center">
          <button 
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Click to view account options"
          >
            <div className="w-6 h-6 rounded bg-[#C5A059] text-[#0A1C16] flex items-center justify-center font-bold text-[10px]">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[#C5A059]">{userName}</span>
            <svg className="w-3 h-3 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {showLogout && (
            <div className="absolute top-full right-0 mt-3 w-32 bg-[#0B2B26] border border-[#1a3d35] rounded shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-2">
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-[#1a3d35] rounded transition-colors uppercase whitespace-nowrap text-[10px] font-bold w-full text-left px-3 py-2">
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link href="https://sd-auth-center.vercel.app?redirect_uri=https://sd-news-hub.vercel.app" className="hover:text-[#C5A059] transition-colors hidden sm:block">Login</Link>
          <Link href="https://sd-auth-center.vercel.app?redirect_uri=https://sd-news-hub.vercel.app" className="bg-[#C5A059] text-[#0A1C16] hover:bg-[#b08d4b] px-3 py-1.5 rounded transition-colors hidden sm:block">Register</Link>
        </>
      )}
      
      {userEmail ? (
        <Link href="/dashboard" className="border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1C16] px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors text-[10px] sm:text-xs">
          <span className="hidden sm:inline">{lang === 'or' ? 'ଡ୍ୟାସବୋର୍ଡ' : 'Dashboard'}</span>
          <span className="sm:hidden">{lang === 'or' ? 'ଡ୍ୟାସ' : 'Hub'}</span>
        </Link>
      ) : (
        <Link href="/register-reporter" className="border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1C16] px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors text-[10px] sm:text-xs">
          <span className="hidden sm:inline">{lang === 'or' ? 'ଯୋଗଦାନ କରନ୍ତୁ' : 'Contribute News'}</span>
          <span className="sm:hidden">{lang === 'or' ? 'ଯୋଗଦାନ' : 'Contribute'}</span>
        </Link>
      )}
    </div>
  );
}
