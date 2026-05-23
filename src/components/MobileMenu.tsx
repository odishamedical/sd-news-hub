"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function MobileMenu({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);

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
        </div>
      )}
    </>
  );
}
