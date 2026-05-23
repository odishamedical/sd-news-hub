"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function NewsAuthHeader({ lang }: { lang: string }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getLangUrl = (newLang: string) => {
    // Return early if hooks aren't ready
    if (!pathname) return `/?lang=${newLang}`;
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set('lang', newLang);
    return `${pathname}?${params.toString()}`;
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
    <div className="flex items-center gap-4 text-xs font-semibold">
      {/* Language Switcher */}
      <div className="flex border border-[#1a3d35] rounded overflow-hidden">
        <Link href={getLangUrl('en')} className={`px-2 py-1 ${lang === 'en' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>EN</Link>
        <Link href={getLangUrl('or')} className={`px-2 py-1 ${lang === 'or' ? 'bg-[#C5A059] text-[#0A1C16]' : 'text-gray-400 hover:text-white transition-colors'}`}>ଓଡ଼ିଆ</Link>
      </div>
      
      {/* Auth Links */}
      {userEmail ? (
        <>
          <div className="flex items-center gap-2 hidden sm:flex">
            <div className="w-6 h-6 rounded bg-[#C5A059] text-[#0A1C16] flex items-center justify-center font-bold text-[10px]">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[#C5A059]">{userName}</span>
          </div>
          <button onClick={handleLogout} className="hover:text-red-400 transition-colors hidden sm:block uppercase">Sign Out</button>
        </>
      ) : (
        <>
          <Link href="https://sd-auth-center.vercel.app?redirect_uri=https://sd-news-hub.vercel.app" className="hover:text-[#C5A059] transition-colors hidden sm:block">Login</Link>
          <Link href="https://sd-auth-center.vercel.app?redirect_uri=https://sd-news-hub.vercel.app" className="bg-[#C5A059] text-[#0A1C16] hover:bg-[#b08d4b] px-3 py-1.5 rounded transition-colors hidden sm:block">Register</Link>
        </>
      )}
      
      <Link href="/register-reporter" className="border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1C16] px-3 py-1.5 rounded transition-colors">
        {lang === 'or' ? 'ଯୋଗଦାନ କରନ୍ତୁ' : 'Contribute News'}
      </Link>
    </div>
  );
}
