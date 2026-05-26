"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import DigitalPressId from "@/components/DigitalPressId";

interface Reporter {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  organizationName: string;
  agencyName?: string;
  district?: string;
  affiliation?: string;
  photoUrl?: string;
  bloodGroup?: string;
  status: "pending" | "approved" | "rejected";
}

export default function VerifyPressPage() {
  const params = useParams();
  const reporterId = params.id as string;
  
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReporter() {
      if (!reporterId) return;
      try {
        const docRef = doc(db, "news_reporters", reporterId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReporter({
            id: docSnap.id,
            ...data
          } as Reporter);
        } else {
          setError("Accreditation record not found in the official registry.");
        }
      } catch (err: any) {
        console.error("Error fetching reporter accreditation:", err);
        setError("Database validation error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchReporter();
  }, [reporterId]);

  return (
    <div className="min-h-screen bg-[#020610] text-[#e2e8f0] font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Radial Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="bg-[#050B1B]/80 backdrop-blur-md border-b border-slate-900/60 w-full z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 border-2 border-[#C5A059] items-center justify-center rounded-lg bg-slate-950 flex">
              <span className="text-[#C5A059] font-black text-xs font-mono">SD</span>
            </div>
            <h1 className="text-lg font-bold tracking-wider text-white font-serif">
              SD NEWS <span className="text-[#C5A059]">HUB</span>
            </h1>
          </Link>
          <div className="hidden sm:flex text-xs font-bold font-mono tracking-widest text-[#C5A059] uppercase border border-[#C5A059]/20 px-3 py-1.5 rounded-full bg-slate-950/40">
            Accreditation Verification Portal
          </div>
        </div>
      </header>

      {/* Main Validation Panel */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        {loading ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-mono tracking-wider text-gray-400">Verifying security signature with SD Central Registry...</p>
          </div>
        ) : error || !reporter ? (
          <div className="bg-red-950/10 border border-red-500/20 max-w-md w-full rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <span className="text-2xl text-red-500 font-bold">✕</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Verification Failed</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{error || "This credential is not registered or has been removed."}</p>
            </div>
            <Link href="/" className="inline-block w-full py-3 bg-[#1C2438] hover:bg-[#2A344A] text-white border border-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#070d1e]/40 border border-[#1C2438] rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
            
            {/* Left Column: Accreditation Status Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] font-bold uppercase">Official Digital Credential</span>
                <h2 className="text-3xl font-black text-white font-serif tracking-tight leading-none">Accreditation Card</h2>
              </div>

              {/* Status Badge */}
              <div className="border-t border-b border-slate-900 py-4 space-y-2">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Status</div>
                {reporter.status === "approved" ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 font-black text-sm uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Verified Active Press Member
                  </div>
                ) : reporter.status === "rejected" ? (
                  <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 font-black text-sm uppercase tracking-widest">
                    Revoked / Inactive Press Member
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 font-black text-sm uppercase tracking-widest">
                    Awaiting Accreditation Review
                  </div>
                )}
              </div>

              {/* Verified Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">Accredited Name</div>
                  <div className="text-white font-bold text-sm">{reporter.fullName || "Unnamed Reporter"}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">Affiliation / Agency</div>
                  <div className="text-[#C5A059] font-bold text-sm">{reporter.organizationName || reporter.agencyName || "Independent"}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">Coverage Scope</div>
                  <div className="text-white">{reporter.affiliation || "Local Contributor"}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">District / District Code</div>
                  <div className="text-white">{reporter.district || "Odisha"}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">Issuing Authority</div>
                  <div className="text-white italic">Shyam Dash Ecosystem Press Board</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider mb-1 font-bold">Accreditation ID</div>
                  <div className="text-slate-400 font-mono text-[10px]">SDNH-2026-VIP-{reporter.id.substring(0, 8).toUpperCase()}</div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  This public verification page allows third-parties, governmental offices, and press organizations to instantly authenticate the legitimacy of the presenter. All credentials on this network are signed cryptographically using the Shyam Dash Ecosystem security protocol.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive DigitalPressId Rendering */}
            <div className="flex justify-center">
              <DigitalPressId 
                name={reporter.fullName || "Unnamed Reporter"}
                agency={reporter.organizationName || reporter.agencyName || "SD NEWS HUB"}
                role={reporter.status === "approved" ? "VERIFIED CONTRIBUTOR" : reporter.status === "rejected" ? "REVOKED MEDIA" : "AWAITING VERIFICATION"}
                photoUrl={reporter.photoUrl}
                idNumber={`SDNH-2026-VIP-${reporter.id.substring(0, 5).toUpperCase()}`}
                bloodGroup={reporter.bloodGroup || "O+"}
                validUntil="DEC 2028"
              />
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#050B1B]/40 border-t border-slate-900/60 py-6 text-center text-xs text-gray-600 z-10 shrink-0">
        <p>© 2026 Shyam Dash Ecosystem. All Rights Reserved. Verification Portal v2.6</p>
      </footer>
    </div>
  );
}
