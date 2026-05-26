"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, getDocs, doc, updateDoc, query, orderBy } from "@/lib/firebase";

interface Reporter {
  id: string;
  fullName: string;
  agencyName: string;
  channelLink: string;
  coverageArea: string;
  pressIdNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
}

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  thumbnailBase64: string;
  reporterEmail: string;
  reporterName: string;
  status: "pending" | "published" | "rejected";
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"reporters" | "articles" | "ai_studio">("reporters");
  
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // Modal State for Article Editing
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Studio State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("Politics");
  const [aiLanguage, setAiLanguage] = useState("English + Odia");
  const [aiTone, setAiTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);

  const handleGenerateNews = async () => {
    if (!aiPrompt) return alert("Please enter a prompt");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          category: aiCategory,
          language: aiLanguage,
          tone: aiTone
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedArticle(data.data);
      } else {
        alert(data.error || "Failed to generate news");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling AI API");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auth Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      // First extract any SSO tokens from URL if arriving from Auth Center
      const params = new URLSearchParams(window.location.search);
      const ssoRole = params.get("sso_role") || params.get("role");
      const ssoEmail = params.get("sso_email") || params.get("email");
      const ssoName = params.get("sso_name") || params.get("name");

      let hasSsoParams = false;
      if (ssoRole) { localStorage.setItem("sd_current_user_role", ssoRole); hasSsoParams = true; }
      if (ssoEmail) { localStorage.setItem("sd_current_user_email", ssoEmail); hasSsoParams = true; }
      if (ssoName) { localStorage.setItem("sd_current_user_name", ssoName); hasSsoParams = true; }

      if (hasSsoParams) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      const role = localStorage.getItem("sd_current_user_role");
      if (role !== "super_admin" && role !== "admin") {
        router.push("/");
      } else {
        setIsAdmin(true);
        fetchData();
      }
    }
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchReporters(), fetchArticles()]);
    setLoading(false);
  };

  const fetchReporters = async () => {
    try {
      const q = query(collection(db, "news_reporters"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reporter[];
      setReporters(data);
    } catch (error) {
      console.error("Error fetching reporters", error);
    }
  };

  const fetchArticles = async () => {
    try {
      const q = query(collection(db, "news_articles"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles", error);
    }
  };

  const handleUpdateReporterStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const reporterRef = doc(db, "news_reporters", id);
      await updateDoc(reporterRef, { status: newStatus });
      setReporters(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating reporter status", error);
    }
  };

  const handleArticleAction = async (id: string, newStatus: Article["status"], updatedData?: Partial<Article>) => {
    setIsSaving(true);
    try {
      const articleRef = doc(db, "news_articles", id);
      const payload = { status: newStatus, ...updatedData };
      await updateDoc(articleRef, payload);
      
      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a));
      setEditingArticle(null);
    } catch (error) {
      console.error("Error updating article", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Admin Header */}
      <header className="bg-[#0A1C16] text-[#C5A059] h-16 flex items-center px-6 justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold tracking-wider text-white hover:text-[#C5A059]">SD NEWS HUB</Link>
          <span className="text-sm font-semibold px-2 py-1 bg-[#1a3d35] rounded text-[#C5A059]">EDITORIAL DESK</span>
        </div>
        <div className="flex gap-4">
          <Link href="https://sd-auth-center.vercel.app/launcher" className="text-sm hover:text-white transition-colors">Back to Launchpad</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold font-serif text-[#0B2B26]">Editorial Management</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
            <button 
              onClick={() => setActiveTab("reporters")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "reporters" ? "bg-[#0B2B26] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Reporter Applications
              {reporters.filter(r => r.status === "pending").length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {reporters.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("articles")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "articles" ? "bg-[#0B2B26] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Article Submissions
              {articles.filter(a => a.status === "pending").length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {articles.filter(a => a.status === "pending").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("ai_studio")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "ai_studio" ? "bg-[#C5A059] text-white" : "text-[#C5A059] hover:bg-amber-50"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Studio
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B2B26]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            
            {/* REPORTERS TAB */}
            {activeTab === "reporters" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0B2B26] text-white">
                      <th className="p-4 font-semibold text-sm">Applicant Name</th>
                      <th className="p-4 font-semibold text-sm">Agency / Channel</th>
                      <th className="p-4 font-semibold text-sm">Coverage Area</th>
                      <th className="p-4 font-semibold text-sm">Status</th>
                      <th className="p-4 font-semibold text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reporters.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No applications found.</td></tr>
                    ) : (
                      reporters.map((reporter) => (
                        <tr key={reporter.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-[#0A1C16]">{reporter.fullName}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: {reporter.pressIdNumber || "N/A"}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-800">{reporter.agencyName}</div>
                            <a href={reporter.channelLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Channel</a>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{reporter.coverageArea}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              reporter.status === "approved" ? "bg-green-100 text-green-700" :
                              reporter.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {reporter.status}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            {reporter.status === "pending" && (
                              <>
                                <button onClick={() => handleUpdateReporterStatus(reporter.id, "approved")} className="bg-[#0B2B26] hover:bg-[#1a3d35] text-[#C5A059] px-3 py-1.5 rounded text-xs font-bold transition-colors">Approve</button>
                                <button onClick={() => handleUpdateReporterStatus(reporter.id, "rejected")} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-bold transition-colors">Reject</button>
                              </>
                            )}
                            {reporter.status === "approved" && (
                              <button onClick={() => handleUpdateReporterStatus(reporter.id, "rejected")} className="text-gray-400 hover:text-red-500 text-xs font-semibold px-2 py-1">Revoke</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ARTICLES TAB */}
            {activeTab === "articles" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0B2B26] text-white">
                      <th className="p-4 font-semibold text-sm">Headline & Summary</th>
                      <th className="p-4 font-semibold text-sm">Reporter</th>
                      <th className="p-4 font-semibold text-sm">Category</th>
                      <th className="p-4 font-semibold text-sm">Date</th>
                      <th className="p-4 font-semibold text-sm text-center">Status</th>
                      <th className="p-4 font-semibold text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No article submissions found.</td></tr>
                    ) : (
                      articles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 max-w-sm">
                            <div className="font-bold text-[#0A1C16] text-sm leading-tight mb-1">{article.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-2">{article.summary}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-800 text-sm">{article.reporterName}</div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">{article.reporterEmail}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                              {article.category}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              article.status === "published" ? "bg-green-100 text-green-700" :
                              article.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {article.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => setEditingArticle(article)}
                              className="bg-[#0B2B26] hover:bg-[#1a3d35] text-white px-4 py-2 rounded text-xs font-bold transition-colors whitespace-nowrap"
                            >
                              Review & Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI STUDIO TAB */}
            {activeTab === "ai_studio" && (
              <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10 bg-white">
                
                {/* Left Side: Generator Controls */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-black font-serif text-[#0B2B26] flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      AI Content Studio
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">Turn bullet points into SEO-optimized, dual-language news articles instantly.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">News Prompt / Facts</label>
                      <textarea 
                        rows={4}
                        placeholder="e.g. Odisha CM launched a new telemedicine project in Sambalpur..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                        <select 
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-[#C5A059] outline-none"
                        >
                          <option>Politics</option>
                          <option>Health</option>
                          <option>Education</option>
                          <option>Business</option>
                          <option>Crime</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tone</label>
                        <select 
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-[#C5A059] outline-none"
                        >
                          <option>Professional</option>
                          <option>Neutral</option>
                          <option>Engaging</option>
                          <option>Urgent</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleGenerateNews}
                      disabled={isGenerating || !aiPrompt}
                      className="w-full bg-[#0B2B26] hover:bg-[#1a3d35] text-[#C5A059] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <><div className="animate-spin h-5 w-5 border-2 border-[#C5A059] border-t-transparent rounded-full" /> Generating...</>
                      ) : (
                        <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Generate Article & SEO</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Side: Output Review */}
                <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                  {generatedArticle ? (
                    <div className="space-y-6">
                      
                      <div className="flex justify-between items-center bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                        <span className="text-sm font-bold text-green-800 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Generation Successful
                        </span>
                        <div className="flex gap-2">
                          <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded font-bold hover:bg-gray-50 text-gray-700">Save Draft</button>
                          <button className="text-xs bg-[#C5A059] text-white px-3 py-1.5 rounded font-bold hover:bg-[#b08e4d] shadow">Publish Live</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Output */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2 border-b pb-2">
                            <span className="text-xl">🇬🇧</span> <h3 className="font-bold text-gray-800">English (SEO Default)</h3>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Headline</label>
                            <div className="text-sm font-bold font-serif text-[#0B2B26] bg-gray-50 p-2 rounded border border-gray-100">{generatedArticle.title_en}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Summary (Meta Desc)</label>
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{generatedArticle.summary_en}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Article</label>
                            <div className="text-xs text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap leading-relaxed h-48 overflow-y-auto">{generatedArticle.content_en}</div>
                          </div>
                        </div>

                        {/* Odia Output */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2 border-b pb-2">
                            <span className="text-xl">🇮🇳</span> <h3 className="font-bold text-gray-800">Odia (Local)</h3>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Headline</label>
                            <div className="text-sm font-bold font-serif text-[#0B2B26] bg-gray-50 p-2 rounded border border-gray-100">{generatedArticle.title_or}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Summary</label>
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{generatedArticle.summary_or}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Article</label>
                            <div className="text-xs text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap leading-relaxed h-48 overflow-y-auto">{generatedArticle.content_or}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0B2B26]/5 rounded-lg p-4 border border-[#0B2B26]/10 mt-6 space-y-4">
                        <div className="flex gap-6">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-[#0B2B26] uppercase tracking-widest block mb-1">SEO Keywords</label>
                            <div className="text-xs text-gray-600">{generatedArticle.seo_keywords}</div>
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-[#0B2B26] uppercase tracking-widest block mb-1">Hashtags</label>
                            <div className="text-xs text-gray-600">{generatedArticle.hashtags}</div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-[#0B2B26]/10 flex items-start gap-4">
                          <div className="w-32 h-20 bg-gray-200 rounded shrink-0 relative overflow-hidden group">
                            <img src={`https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80`} alt="Thumbnail mock" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-white font-bold">Unsplash Mock</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#0B2B26] uppercase tracking-widest block mb-1">Suggested Thumbnail Prompt</label>
                            <div className="text-xs text-gray-600 italic">"{generatedArticle.thumbnail_prompt}"</div>
                            <button className="mt-2 text-xs bg-gray-800 text-white px-3 py-1 rounded shadow-sm hover:bg-black transition-colors">Generate Real Image</button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      <h4 className="font-bold text-gray-600 mb-2">No Content Generated Yet</h4>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">Enter a prompt on the left and click generate to create an SEO-optimized dual-language article.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ARTICLE EDIT MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0A1C16] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-[#C5A059]">Editorial Review</h3>
                <p className="text-xs text-gray-400">By {editingArticle.reporterName}</p>
              </div>
              <button 
                onClick={() => setEditingArticle(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Headline</label>
                    <input 
                      type="text" 
                      value={editingArticle.title}
                      onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                      className="w-full text-2xl font-black font-serif border border-gray-300 rounded p-2 focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Summary Pitch</label>
                    <textarea 
                      rows={2}
                      value={editingArticle.summary}
                      onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value})}
                      className="w-full text-sm font-medium border border-gray-300 rounded p-2 focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 focus:border-[#C5A059] focus:outline-none text-sm font-bold"
                  >
                    <option>Politics</option>
                    <option>Odisha</option>
                    <option>Crime</option>
                    <option>Sports</option>
                    <option>Business</option>
                    <option>Entertainment</option>
                    <option>Investigation</option>
                  </select>

                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-1">Thumbnail</label>
                  <div className="bg-gray-100 aspect-video rounded overflow-hidden border border-gray-200">
                    {editingArticle.thumbnailBase64 ? (
                      <img src={editingArticle.thumbnailBase64} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Article Content</label>
                <textarea 
                  rows={12}
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                  className="w-full text-base font-serif leading-relaxed border border-gray-300 rounded p-4 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center shrink-0">
              <button 
                onClick={() => handleArticleAction(editingArticle.id, "rejected", editingArticle)}
                disabled={isSaving}
                className="text-red-600 font-bold text-sm px-4 py-2 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
              >
                Reject Article
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleArticleAction(editingArticle.id, editingArticle.status, editingArticle)}
                  disabled={isSaving}
                  className="text-gray-700 font-bold text-sm px-4 py-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                >
                  Save Edits (Keep {editingArticle.status})
                </button>
                <button 
                  onClick={() => handleArticleAction(editingArticle.id, "published", editingArticle)}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-2 rounded shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Publishing..." : "Approve & Publish Live"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
