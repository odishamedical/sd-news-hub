"use client";

import React from "react";

interface DigitalPressIdProps {
  name: string;
  agency: string;
  role: string;
  photoUrl?: string;
  idNumber: string;
  bloodGroup?: string;
  validUntil?: string;
}

export default function DigitalPressId({
  name,
  agency,
  role,
  photoUrl,
  idNumber,
  bloodGroup = "O+",
  validUntil = "DEC 2028"
}: DigitalPressIdProps) {
  return (
    <div className="w-full max-w-[340px] mx-auto bg-[#050810] rounded-2xl overflow-hidden relative shadow-2xl border border-[#C5A059]/30 transform transition-all hover:scale-105 hover:shadow-[#C5A059]/20 font-sans group">
      
      {/* Holographic Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"></div>

      {/* Top Header */}
      <div className="bg-[#0A0F1C] border-b border-[#1C2438] px-4 py-3 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#FFE082] to-[#C5A059] rounded flex items-center justify-center font-bold text-[10px] text-[#050810]">SD</div>
            <span className="text-[10px] font-black tracking-widest text-[#C5A059] uppercase">News Hub</span>
         </div>
         <span className="text-[8px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">VERIFIED MEDIA</span>
      </div>

      {/* Profile Section */}
      <div className="p-6 relative z-10">
         
         <div className="flex justify-between items-start mb-6">
            <div className="w-24 h-24 rounded-lg bg-[#1C2438] border-2 border-[#C5A059] overflow-hidden shadow-lg shadow-black p-0.5">
               <div className="w-full h-full rounded bg-[#0A0F1C] overflow-hidden">
                 {photoUrl ? (
                   <img src={photoUrl} alt="Reporter" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-bold">PHOTO</div>
                 )}
               </div>
            </div>
            
            <div className="w-16 h-16 bg-white rounded-lg p-1 opacity-90 shadow-inner">
               {/* Mock QR Code Pattern */}
               <div className="w-full h-full bg-black grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={Math.random() > 0.4 ? "bg-white" : "bg-black"}></div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-1 mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">{name}</h2>
            <div className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">{role}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{agency}</div>
         </div>

         <div className="grid grid-cols-2 gap-4 border-t border-[#1C2438] pt-4">
            <div>
               <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Press ID No.</div>
               <div className="text-xs font-mono text-white">{idNumber}</div>
            </div>
            <div>
               <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Blood Group</div>
               <div className="text-xs font-bold text-red-400">{bloodGroup}</div>
            </div>
            <div>
               <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Valid Until</div>
               <div className="text-xs font-bold text-white">{validUntil}</div>
            </div>
            <div>
               <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Authority</div>
               <div className="text-xs font-bold text-[#C5A059] italic">Gov. Accredited</div>
            </div>
         </div>

      </div>

      {/* Bottom Security Bar */}
      <div className="bg-[#C5A059] h-2 w-full"></div>
      <div className="bg-gradient-to-r from-transparent via-[#C5A059]/20 to-transparent h-1 w-full mt-1"></div>

    </div>
  );
}
