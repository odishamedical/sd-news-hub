"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "@/lib/firebase";
import NewsAuthHeader from "@/components/NewsAuthHeader";

type Article = {
  id: string;
  title: string;
  category: string;
  summary: string;
  status: "pending" | "published" | "rejected";
  createdAt: any;
};

export default function ReporterDesk() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"submit" | "feed">("submit");
  
  // Articles state
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [fetchingArticles, setFetchingArticles] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    summary: "",
    content: "",
    thumbnailBase64: ""
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        window.location.href = `https://sd-auth-center.vercel.app?redirect_uri=${encodeURIComponent(window.location.href)}`;
        return;
      }
      const name = localStorage.getItem("sd_current_user_name") || "Reporter";
      setUser({ email, name });
      checkAccess(email);
    }
  }, []);

  const checkAccess = async (email: string) => {
    try {
      const role = localStorage.getItem("sd_current_user_role");
      if (role === "super_admin") {
        fetchMyArticles(email);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "news_reporters"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const application = snapshot.docs[0].data();
        if (application.status === "approved") {
          fetchMyArticles(email);
          setLoading(false);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    }
  };

  const fetchMyArticles = async (email: string) => {
    setFetchingArticles(true);
    try {
      const q = query(
        collection(db, "news_articles"), 
        where("reporterEmail", "==", email)
      );
      // Note: Ordering requires a composite index in Firebase if combined with where.
      // For now, we will sort it on the client side if Firebase complains.
      const snapshot = await getDocs(q);
      const articles: Article[] = [];
      snapshot.forEach(doc => {
        articles.push({ id: doc.id, ...doc.data() } as Article);
      });
      // Sort descending by date
      articles.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setMyArticles(articles);
    } catch (e) {
      console.error("Error fetching articles", e);
    } finally {
      setFetchingArticles(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnailBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitStatus("submitting");

    try {
      await addDoc(collection(db, "news_articles"), {
        ...formData,
        reporterEmail: user.email,
        reporterName: user.name,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      setSubmitStatus("success");
      setFormData({ title: "", category: "", summary: "", content: "", thumbnailBase64: "" });
      fetchMyArticles(user.email);
      
      setTimeout(() => {
        setSubmitStatus("idle");
        setActiveTab("feed");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting article:", error);
      setSubmitStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#0B2B26] font-semibold">Authenticating Reporter Profile...</p>
        </div>
      </div>
    );
  }

  const publishedCount = myArticles.filter(a => a.status === "published").length;
  const pendingCount = myArticles.filter(a => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#F4F1EA]">

      {/* Primary Header */}
      <header className="bg-[#0B2B26] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white hidden sm:block">SD NEWS HUB</h1>
          </Link>
          <div className="hidden md:flex gap-4 items-center">
             <span className="bg-[#C5A059] text-[#0A1C16] text-xs font-black uppercase px-3 py-1 rounded-full">Reporter Desk</span>
          </div>
          <NewsAuthHeader lang="en" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-serif text-[#0B2B26]">Welcome, {user?.name}</h1>
            <p className="text-gray-600">SD News Hub Official Contributor</p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-[#0B2B26] hover:text-[#C5A059] transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Hub
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area: Workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
              <button 
                onClick={() => setActiveTab("submit")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-colors ${activeTab === "submit" ? "bg-[#0B2B26] text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}
              >
                📝 Submit New Article
              </button>
              <button 
                onClick={() => setActiveTab("feed")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === "feed" ? "bg-[#0B2B26] text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}
              >
                📋 My Submissions
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "feed" ? "bg-[#C5A059] text-[#0A1C16]" : "bg-amber-100 text-amber-800"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT: Submit */}
            {activeTab === "submit" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="font-black text-[#0B2B26] text-lg">Draft New Story</h2>
                  <p className="text-xs text-gray-500 mt-1">Your submission will be reviewed by our editorial desk before publishing.</p>
                </div>
                
                {submitStatus === "success" ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Article Submitted!</h3>
                    <p className="text-gray-500">Your story has been sent to the editorial desk.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Headline / Title <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059] text-lg font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Write a catchy headline..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-[#0A1C16] mb-2">Category <span className="text-red-500">*</span></label>
                        <select required className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          <option value="">Select Category</option>
                          <option>Politics</option>
                          <option>Odisha</option>
                          <option>Crime</option>
                          <option>Sports</option>
                          <option>Business</option>
                          <option>Entertainment</option>
                          <option>Investigation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0A1C16] mb-2">Thumbnail Image <span className="text-red-500">*</span></label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded bg-gray-50 h-[46px] flex items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
                          {formData.thumbnailBase64 ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-bold w-full px-4">
                              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              <span className="truncate">Image attached</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                              Click to upload photo
                            </span>
                          )}
                          <input required={!formData.thumbnailBase64} type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Summary / Pitch <span className="text-red-500">*</span></label>
                      <textarea required rows={2} className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="Brief 1-2 sentence overview of the news..."></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Full Story / Details <span className="text-red-500">*</span></label>
                      <textarea required rows={8} className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm font-serif leading-relaxed" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write your full report here. Be objective, accurate, and verify your facts..."></textarea>
                    </div>
                    
                    {submitStatus === "error" && (
                      <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-semibold border border-red-200">
                        Failed to submit. Please try again.
                      </div>
                    )}

                    <div className="pt-2">
                      <button type="submit" disabled={submitStatus === "submitting"} className="w-full sm:w-auto px-8 py-3 bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-black rounded transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                        {submitStatus === "submitting" ? (
                          <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C5A059]"></span> Submitting to Desk...</>
                        ) : (
                          "Submit for Review →"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT: Feed */}
            {activeTab === "feed" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="font-black text-[#0B2B26] text-lg">My Submissions</h2>
                  <button onClick={() => fetchMyArticles(user?.email || '')} className="text-sm text-gray-500 hover:text-[#0B2B26] flex items-center gap-1">
                    <svg className={`w-4 h-4 ${fetchingArticles ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Refresh
                  </button>
                </div>
                
                {fetchingArticles && myArticles.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">Loading your feed...</div>
                ) : myArticles.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No articles yet</h3>
                    <p className="text-gray-500 text-sm mb-4">You haven't submitted any news stories.</p>
                    <button onClick={() => setActiveTab("submit")} className="text-[#C5A059] font-bold hover:underline">Write your first story →</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myArticles.map(article => (
                      <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                              {article.category}
                            </span>
                            {article.status === "pending" && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Pending Review</span>}
                            {article.status === "published" && <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live</span>}
                            {article.status === "rejected" && <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded">Rejected</span>}
                          </div>
                          <span className="text-xs text-gray-400 font-medium">
                            {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 font-serif leading-tight mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            
            {/* Stats Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-black text-[#0B2B26] uppercase tracking-wider text-sm mb-4">My Dashboard</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                  <div className="text-2xl font-black text-[#0B2B26]">{myArticles.length}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase mt-1">Total</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <div className="text-2xl font-black text-green-600">{publishedCount}</div>
                  <div className="text-xs font-bold text-green-700 uppercase mt-1">Published</div>
                </div>
              </div>
            </div>

            {/* Digital ID Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
              <div className="bg-gradient-to-br from-[#0B2B26] to-[#1a4a40] p-6 text-center text-white relative z-10">
                <div className="absolute top-2 right-2 opacity-20">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg>
                </div>
                <h3 className="font-black tracking-widest uppercase text-sm text-[#C5A059] mb-1">SD News Hub</h3>
                <h4 className="font-bold text-[10px] uppercase tracking-wider opacity-70 mb-4">Press Credential</h4>
                <div className="w-20 h-20 bg-white/10 rounded-full mx-auto border-2 border-[#C5A059] flex items-center justify-center mb-3">
                  <span className="text-3xl">👤</span>
                </div>
                <h2 className="font-serif font-bold text-lg">{user?.name}</h2>
                <p className="text-xs opacity-70 uppercase tracking-widest mt-1">ID: SDNH-PENDING</p>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 font-medium">Digital ID functionality unlocking in Phase 3.</p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-5">
              <h3 className="font-black text-amber-900 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Editorial Guidelines
              </h3>
              <ul className="text-xs text-amber-800 space-y-2 font-medium">
                <li>• Verify all facts and quotes before submission.</li>
                <li>• Do not use sensationalized or misleading clickbait headlines.</li>
                <li>• Upload a clear, relevant, high-quality thumbnail image.</li>
                <li>• Ensure appropriate credit is given for external media.</li>
                <li>• Avoid biased reporting; present facts neutrally.</li>
              </ul>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
