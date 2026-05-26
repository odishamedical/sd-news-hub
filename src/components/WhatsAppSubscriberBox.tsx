"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function WhatsAppSubscriberBox() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both name and WhatsApp number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save subscriber details to "whatsapp_subscribers" Firestore collection
      await addDoc(collection(db, "whatsapp_subscribers"), {
        fullName: name.trim(),
        whatsapp: phone.trim(),
        source: "news_hub_homepage",
        subscribedAt: serverTimestamp()
      });
      setSuccess(true);
      setName("");
      setPhone("");
    } catch (err: any) {
      console.error("Error saving subscriber:", err);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0B2036]/60 via-[#070d1e]/90 to-[#020610]/95 border border-[#C5A059]/30 rounded-3xl p-6 text-[#e2e8f0] shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative pulse dot */}
      <div className="absolute top-4 right-4 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>

      <h3 className="font-bold text-lg font-serif mb-2 text-[#C5A059]">WhatsApp News Alerts</h3>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Get instant breaking news, daily summaries, and local bulletins sent straight to your WhatsApp.
      </p>

      {success ? (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-xs font-bold text-center space-y-2">
          <div>✓ Successfully Subscribed!</div>
          <p className="font-normal text-[10px] text-gray-400">You are now on the official SD broadcast list.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="text-[#C5A059] hover:underline text-[10px] block mx-auto mt-2"
          >
            Subscribe another number
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative z-10">
          <div>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 outline-none text-xs focus:border-[#C5A059]/40 transition-colors"
              required
            />
          </div>
          <div>
            <input 
              type="tel" 
              placeholder="WhatsApp Number (e.g. 919876543210)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 outline-none text-xs focus:border-[#C5A059]/40 transition-colors"
              required
            />
          </div>

          {error && <div className="text-red-400 text-[10px] font-bold">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] uppercase tracking-wider font-mono"
          >
            {loading ? "Subscribing..." : "Join Alert Network"}
          </button>
        </form>
      )}
    </div>
  );
}
