"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, serverTimestamp, query, getDocs, where } from "@/lib/firebase";

export default function ReporterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  
  const [articleData, setArticleData] = useState({
    title: "",
    category: "odisha", // match news.ts categories
    source: "",
    url: "",
    image: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        // Redirect to Auth Center with redirect_uri
        window.location.href = `https://sd-auth-center.vercel.app?redirect_uri=${encodeURIComponent(window.location.href)}`;
      } else {
        const userName = localStorage.getItem("sd_current_user_name");
        setUser({ email, name: userName });
        checkReporterStatus(email);
        
        setArticleData(prev => ({
          ...prev,
          source: userName || email.split("@")[0]
        }));
      }
    }
  }, [router]);

  const checkReporterStatus = async (email: string) => {
    try {
      // Super admins bypass the reporter check
      const role = localStorage.getItem("sd_current_user_role");
      if (role === "super_admin") {
        setIsApproved(true);
        return;
      }

      // Query Firebase for this user's reporter application
      const q = query(collection(db, "news_reporters"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // No application found → redirect to registration form
        window.location.href = "/register-reporter";
        return;
      }

      // Check the status of their application
      const application = snapshot.docs[0].data();
      if (application.status === "approved") {
        setIsApproved(true);
      } else {
        // Pending or rejected → show waiting screen
        setIsApproved(false);
      }
    } catch (e) {
      console.error(e);
      setIsApproved(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await addDoc(collection(db, "news_articles"), {
        ...articleData,
        authorEmail: user?.email,
        pubDate: new Date().toUTCString(),
        createdAt: serverTimestamp()
      });
      setStatus("success");
      setArticleData({ ...articleData, title: "", url: "", image: "" }); // reset form fields
      
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Error submitting article:", error);
      setStatus("error");
    }
  };

  if (isApproved === null) {
    return <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">Loading...</div>;
  }

  if (isApproved === false) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
        {/* Primary Header */}
        <header className="bg-[#0B2B26] text-white">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
                <span className="text-[#C5A059] font-bold text-sm">NP</span>
              </div>
              <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full border-t-4 border-[#C5A059]">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold font-serif mb-3 text-[#0A1C16]">Application Under Review</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Your reporter application has been received and is currently being reviewed by the editorial team. You will be notified once your credentials are verified and your Digital ID Card is ready.
            </p>
            <Link href="/" className="bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold py-3 px-6 rounded w-full block transition-colors mb-3">
              Return to News Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Header */}
      <header className="bg-[#0B2B26] text-white h-16 flex items-center px-6 sticky top-0 z-50 shadow-md justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
            <span className="text-[#C5A059] font-bold text-sm">NP</span>
          </div>
          <span className="text-xl font-bold tracking-wider hidden sm:block">SD NEWS HUB</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-[#C5A059] border-r border-gray-600 pr-4">Reporter Desk</span>
          <span className="text-xs font-bold text-white">{user?.name}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-serif text-[#0B2B26] mb-2">Publish Article</h1>
          <p className="text-gray-600">Submit a new article, video, or update directly into the SD News stream.</p>
        </div>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 font-semibold flex items-center justify-between">
            Article published successfully to the live feed!
            <Link href="/" className="text-sm underline hover:text-green-900">View Home Page</Link>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 font-semibold">
            Failed to publish article. Please check your connection.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">Headline / Title</label>
              <input 
                required
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059] text-lg font-serif"
                placeholder="Breaking news headline..."
                value={articleData.title}
                onChange={(e) => setArticleData({...articleData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0A1C16] mb-2">News Category</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                  value={articleData.category}
                  onChange={(e) => setArticleData({...articleData, category: e.target.value})}
                >
                  <option value="breaking">Breaking / Headline</option>
                  <option value="odisha">Odisha State News</option>
                  <option value="politics">Politics & Govt</option>
                  <option value="business">Business & Economy</option>
                  <option value="tech">Technology</option>
                  <option value="health">Healthcare</option>
                  <option value="gold">Gold & Jewelry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1C16] mb-2">Reporting Source</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                  value={articleData.source}
                  onChange={(e) => setArticleData({...articleData, source: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">Article Link / Video URL</label>
              <input 
                required
                type="url" 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                placeholder="https://..."
                value={articleData.url}
                onChange={(e) => setArticleData({...articleData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A1C16] mb-2">Thumbnail Image URL (Optional)</label>
              <input 
                type="url" 
                className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]"
                placeholder="https://images.unsplash.com/..."
                value={articleData.image}
                onChange={(e) => setArticleData({...articleData, image: e.target.value})}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold text-lg py-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === "submitting" ? "Publishing..." : "Publish to Live Feed"}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
