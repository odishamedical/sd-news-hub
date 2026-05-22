"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db, collection, addDoc, serverTimestamp } from "@/lib/firebase";

export default function RegisterReporter() {
  const [formData, setFormData] = useState({
    fullName: "",
    agencyName: "",
    channelLink: "",
    coverageArea: "Odisha General",
    pressIdNumber: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await addDoc(collection(db, "news_reporters"), {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setStatus("success");
    } catch (error) {
      console.error("Error submitting registration:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full border-t-4 border-[#C5A059]">
          <div className="w-16 h-16 bg-[#0B2B26] text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold font-serif mb-4 text-[#0A1C16]">Registration Received</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Thank you, {formData.fullName}. Your request to become a registered contributor has been securely submitted to the SD Ecosystem. Our team will verify your credentials and contact you shortly.
          </p>
          <Link href="/" className="bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold py-3 px-6 rounded w-full block transition-colors">
            Return to News Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Simple Header */}
      <header className="bg-[#0B2B26] text-white h-16 flex items-center px-6 sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
            <span className="text-[#C5A059] font-bold text-sm">NP</span>
          </div>
          <span className="text-xl font-bold tracking-wider hidden sm:block">SD NEWS HUB</span>
        </Link>
        <div className="h-6 w-px bg-gray-600 mx-4 hidden sm:block"></div>
        <span className="text-sm font-semibold text-[#C5A059]">Contributor Portal</span>
      </header>

      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B2B26] mb-4">Become a Contributor</h1>
          <p className="text-gray-600">Register as a journalist, news agency, or official YouTube channel to syndicate your content across the SD News network.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0A1C16] mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                  placeholder="e.g. Shyam Dash"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1C16] mb-2">Agency / Channel Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                  placeholder="e.g. Odisha Daily"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">Primary Coverage Area</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                value={formData.coverageArea}
                onChange={(e) => setFormData({...formData, coverageArea: e.target.value})}
              >
                <option>Odisha General</option>
                <option>Bhubaneswar Local</option>
                <option>Cuttack Local</option>
                <option>Political News</option>
                <option>Business & Economy</option>
                <option>Healthcare / Telemedicine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">YouTube / Website Link</label>
              <input 
                required
                type="url" 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                placeholder="https://youtube.com/..."
                value={formData.channelLink}
                onChange={(e) => setFormData({...formData, channelLink: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">Press ID Number (Optional)</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                placeholder="Registration or ID number"
                value={formData.pressIdNumber}
                onChange={(e) => setFormData({...formData, pressIdNumber: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-2">Providing a valid Press ID accelerates the verification process.</p>
            </div>

            {status === "error" && (
              <div className="bg-red-50 text-red-600 p-4 rounded text-sm font-semibold">
                There was an error connecting to the database. Please try again.
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="w-full bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold text-lg py-4 rounded transition-colors mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C5A059]"></span>
                  Processing...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Protected by SD Ecosystem centralized Firebase SSO.</p>

          </div>
        </form>
      </main>
    </div>
  );
}
