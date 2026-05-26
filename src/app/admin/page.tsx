"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, getDocs, doc, updateDoc, query, orderBy, limit, addDoc, serverTimestamp } from "@/lib/firebase";

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

  // Add Reporter Modal State
  const [isAddReporterOpen, setIsAddReporterOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addAgency, setAddAgency] = useState("");
  const [addArea, setAddArea] = useState("");
  const [isAddingReporter, setIsAddingReporter] = useState(false);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState("");

  const handleAddReporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPhone) return alert("Please fill Name, Email and Phone.");
    setIsAddingReporter(true);
    try {
      await addDoc(collection(db, "news_reporters"), {
        fullName: addName,
        email: addEmail.toLowerCase(),
        phone: addPhone,
        whatsapp: addPhone,
        organizationName: addAgency || "Independent",
        district: addArea || "Odisha",
        status: "approved",
        createdAt: serverTimestamp()
      });
      alert("Reporter successfully added!");
      setIsAddReporterOpen(false);
      // Clear forms
      setAddName("");
      setAddEmail("");
      setAddPhone("");
      setAddAgency("");
      setAddArea("");
      fetchReporters();
    } catch (err: any) {
      console.error(err);
      alert("Failed to add reporter: " + err.message);
    } finally {
      setIsAddingReporter(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone) return alert("Please enter a phone number.");
    
    // Generate a unique invitation ID
    const inviteId = "inv_" + Math.random().toString(36).substring(2, 10);
    const inviteUrl = `${window.location.origin}/invite/${inviteId}`;
    
    try {
      await addDoc(collection(db, "reporter_invitations"), {
        inviteId,
        recipientName: inviteName || "VIP Contributor",
        phone: invitePhone,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      setGeneratedInviteUrl(inviteUrl);
    } catch (err: any) {
      console.error(err);
      alert("Failed to create invitation: " + err.message);
    }
  };

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
      const q = query(collection(db, "news_reporters"), orderBy("createdAt", "desc"), limit(50));
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
      const q = query(collection(db, "news_articles"), orderBy("createdAt", "desc"), limit(50));
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
    <div className="flex h-[calc(100vh-40px)] bg-[#0A0F1C] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#050810] border-r border-[#1C2438] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#1C2438]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C5A059] rounded flex items-center justify-center font-bold text-[#050810]">SD</div>
            <span className="font-bold text-white tracking-wider">News Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#1C2438]/50 text-white rounded-lg border border-[#C5A059]/20 font-medium transition-colors">
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </button>
        </nav>
        <div className="p-4 border-t border-[#1C2438]">
           <Link href="https://sd-auth-center.vercel.app/launcher" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             Exit Admin
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0A0F1C]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#1C2438] bg-[#050810]/50 sticky top-0 z-30 backdrop-blur-md">
          <h1 className="text-xl font-bold text-white">Editorial Command Center</h1>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-[#1C2438] border border-[#C5A059] flex items-center justify-center text-xs font-bold text-[#C5A059]">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          
          {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white">{articles.filter(a => a.status === 'published').length}</div>
                     <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Published</div>
                  </div>
               </div>
               <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white">{articles.filter(a => a.status === 'pending').length}</div>
                     <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pending Articles</div>
                  </div>
               </div>
               <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white">{reporters.filter(r => r.status === 'approved').length}</div>
                     <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Reporters</div>
                  </div>
               </div>
               <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white">0</div>
                     <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today's Views</div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               {/* LEFT COLUMN (2/3 width) */}
               <div className="xl:col-span-2 space-y-6">
                  
                  {/* ADVANCED GENERATOR LAUNCHER */}
                  <div className="bg-gradient-to-br from-[#1C2438] to-[#050810] border border-[#1F2937] hover:border-[#C5A059]/50 rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300">
                     <div className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-[#FFE082] to-[#C5A059] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#C5A059]/20 relative z-10 group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8 text-[#050810]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 relative z-10">Advanced News Creator</h2>
                        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6 relative z-10">
                          Launch the full-page studio to generate AI articles with dual English/Odia editors, granular location tagging, and manual SEO overrides.
                        </p>
                        <Link href="/admin/generator" className="bg-gradient-to-r from-[#C5A059] to-[#996515] hover:from-[#d4b06a] hover:to-[#a87422] text-[#0A0F1C] font-black px-8 py-3 rounded-lg shadow-xl hover:shadow-[#C5A059]/20 transition-all hover:-translate-y-1 relative z-10 flex items-center gap-2">
                           Open Studio <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </Link>
                     </div>
                  </div>

                  {/* MODERATION QUEUE WIDGET */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-lg overflow-hidden">
                     <div className="px-6 py-4 border-b border-[#1F2937] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Pending Article Approvals</h2>
                     </div>
                     <div className="divide-y divide-[#1F2937]">
                        {articles.filter(a => a.status === 'pending').length === 0 ? (
                           <div className="p-8 text-center text-gray-500 text-sm">No articles waiting for approval.</div>
                        ) : (
                           articles.filter(a => a.status === 'pending').map(article => (
                              <div key={article.id} className="p-4 hover:bg-[#1F2937]/50 flex items-center justify-between gap-4 transition-colors">
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-sm font-bold text-white truncate">{article.title}</h3>
                                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">{article.category}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">By {article.reporterName} • {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'New'}</p>
                                 </div>
                                 <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => setEditingArticle(article)} className="text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded border border-gray-600 hover:border-gray-400 transition-colors">Review</button>
                                    <button onClick={() => handleArticleAction(article.id, "published", article)} className="text-xs font-bold text-emerald-900 bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded transition-colors">Approve</button>
                                    <button onClick={() => handleArticleAction(article.id, "rejected", article)} className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded transition-colors">Reject</button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

               </div>

               {/* RIGHT COLUMN (1/3 width) */}
               <div className="space-y-6">
                  
                  {/* REPORTER MANAGEMENT WIDGET */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-lg overflow-hidden flex flex-col h-[400px]">
                     <div className="px-6 py-4 border-b border-[#1F2937] flex justify-between items-center shrink-0">
                        <h2 className="text-lg font-bold text-white">Reporter Applications</h2>
                        <div className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded">
                           {reporters.filter(r => r.status === 'pending').length} New
                        </div>
                     </div>
                     
                     <div className="p-4 border-b border-[#1F2937] shrink-0 space-y-3 bg-[#0A0F1C]/50">
                        <button 
                           onClick={() => setIsAddReporterOpen(true)}
                           className="w-full bg-[#1F2937] hover:bg-[#374151] text-white font-bold py-2 rounded text-sm transition-colors border border-gray-600"
                        >
                           + Add Reporter / Agency
                        </button>
                        <button 
                           onClick={() => {
                             setIsInviteOpen(true);
                             setGeneratedInviteUrl("");
                           }}
                           className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 font-bold py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.573-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.082 19.165s-1.815-.011-3.482-.907l-3.91 1.027 1.043-3.809c-1.002-1.724-1.533-3.702-1.533-5.779 0-6.236 5.066-11.303 11.303-11.303 6.237 0 11.303 5.066 11.303 11.303 0 6.236-5.065 11.303-11.303 11.303z"/></svg>
                           Invite via WhatsApp
                        </button>
                     </div>

                     <div className="flex-1 overflow-y-auto divide-y divide-[#1F2937]">
                        {loading ? (
                           <div className="p-6 text-center text-gray-500 text-xs animate-pulse">Loading applications...</div>
                        ) : reporters.filter(r => r.status === 'pending').length === 0 ? (
                           <div className="p-6 text-center text-gray-500 text-sm">No new applications.</div>
                        ) : (
                           reporters.filter(r => r.status === 'pending').map(reporter => (
                              <div key={reporter.id} className="p-4 hover:bg-[#1F2937]/50 transition-colors">
                                 <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                                          {reporter.fullName.charAt(0)}
                                       </div>
                                       <div>
                                          <div className="text-sm font-bold text-white leading-tight">{reporter.fullName}</div>
                                          <div className="text-[10px] text-gray-400">{reporter.agencyName}</div>
                                       </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">PENDING</span>
                                 </div>
                                 <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleUpdateReporterStatus(reporter.id, "approved")} className="flex-1 bg-[#1F2937] hover:bg-emerald-500 hover:text-emerald-900 text-white text-xs font-bold py-1.5 rounded transition-colors">Approve</button>
                                    <button onClick={() => handleUpdateReporterStatus(reporter.id, "rejected")} className="flex-1 bg-[#1F2937] hover:bg-red-500 hover:text-white text-white text-xs font-bold py-1.5 rounded transition-colors">Reject</button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  {/* MEDIA LIBRARY WIDGET */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-lg overflow-hidden">
                     <div className="px-6 py-4 border-b border-[#1F2937] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Media Library</h2>
                        <button className="text-xs text-[#C5A059] hover:underline">View All</button>
                     </div>
                     <div className="p-4">
                        <div className="grid grid-cols-3 gap-2">
                           {[1,2,3,4,5,6].map(i => (
                              <div key={i} className="aspect-square bg-[#1F2937] rounded-lg overflow-hidden border border-[#374151]">
                                 <img src={`https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&q=80`} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="media" />
                              </div>
                           ))}
                        </div>
                        <button className="w-full mt-4 bg-[#1F2937] hover:bg-[#374151] text-white font-bold py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                           Upload Media
                        </button>
                     </div>
                  </div>

               </div>
            </div>
          </div>
      </main>

      {/* ARTICLE EDIT MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#050810] border-b border-[#1F2937] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-[#C5A059]">Editorial Review</h3>
                <p className="text-xs text-gray-400">By {editingArticle.reporterName}</p>
              </div>
              <button onClick={() => setEditingArticle(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Headline</label>
                    <input 
                      type="text" 
                      value={editingArticle.title}
                      onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                      className="w-full text-2xl font-black font-serif bg-[#050810] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Summary Pitch</label>
                    <textarea 
                      rows={2}
                      value={editingArticle.summary}
                      onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value})}
                      className="w-full text-sm font-medium bg-[#050810] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                    className="w-full bg-[#050810] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-sm font-bold text-white"
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
                  <div className="bg-[#050810] aspect-video rounded overflow-hidden border border-[#1F2937]">
                    {editingArticle.thumbnailBase64 ? (
                      <img src={editingArticle.thumbnailBase64} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Image</div>
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
                  className="w-full text-base font-serif leading-relaxed bg-[#050810] border border-[#1F2937] rounded p-4 focus:border-[#C5A059] focus:outline-none text-white"
                />
              </div>
            </div>

            <div className="bg-[#050810] border-t border-[#1F2937] px-6 py-4 flex justify-between items-center shrink-0">
              <button 
                onClick={() => handleArticleAction(editingArticle.id, "rejected", editingArticle)}
                disabled={isSaving}
                className="text-red-400 font-bold text-sm px-4 py-2 border border-red-900 rounded hover:bg-red-900/30 disabled:opacity-50"
              >
                Reject Article
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleArticleAction(editingArticle.id, editingArticle.status, editingArticle)}
                  disabled={isSaving}
                  className="text-gray-300 font-bold text-sm px-4 py-2 border border-gray-600 rounded hover:bg-[#1F2937] disabled:opacity-50"
                >
                  Save Edits
                </button>
                <button 
                  onClick={() => handleArticleAction(editingArticle.id, "published", editingArticle)}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2 rounded shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Publishing..." : "Approve & Publish Live"}
                </button>
              </div>
            </div>

          </div>
        </div>
      {/* ADD REPORTER MODAL */}
      {isAddReporterOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#050810] border-b border-[#1F2937] px-6 py-4 flex justify-between items-center">
              <h3 className="font-black text-lg text-[#C5A059]">Add Verified Reporter / Agency</h3>
              <button onClick={() => setIsAddReporterOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddReporterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Legal Name *</label>
                <input required value={addName} onChange={e => setAddName(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address *</label>
                <input required type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp / Phone *</label>
                <input required value={addPhone} onChange={e => setAddPhone(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">News Agency / Publication Name</label>
                <input value={addAgency} onChange={e => setAddAgency(e.target.value)} placeholder="e.g. Independent, OTV, etc." className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Coverage Area / District</label>
                <input value={addArea} onChange={e => setAddArea(e.target.value)} placeholder="e.g. Khordha, Bhubaneswar" className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
              </div>
              <button type="submit" disabled={isAddingReporter} className="w-full py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] font-black rounded-lg transition-colors text-sm uppercase">
                {isAddingReporter ? "Adding Reporter..." : "Add & Accredit Reporter"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#050810] border-b border-[#1F2937] px-6 py-4 flex justify-between items-center">
              <h3 className="font-black text-lg text-green-400">Generate VIP Reporter Invitation</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {!generatedInviteUrl ? (
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Reporter Name (Optional)</label>
                    <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp Number *</label>
                    <input required value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="With country code, e.g. 919876543210" className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded p-2 focus:border-[#C5A059] focus:outline-none text-white text-sm" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-lg transition-colors text-sm uppercase">
                    Generate Invitation Link
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-bold">
                    Invitation successfully generated!
                  </div>
                  <div className="text-left bg-[#0A0F1C] border border-[#1F2937] p-3 rounded font-mono text-xs select-all text-gray-300 break-all">
                    {generatedInviteUrl}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInviteUrl);
                        alert("Link copied to clipboard!");
                      }} 
                      className="flex-1 py-2 bg-[#1C2438] hover:bg-[#2A344A] text-white font-bold rounded text-xs border border-gray-600"
                    >
                      Copy Link
                    </button>
                    <a 
                      href={`https://api.whatsapp.com/send?phone=${invitePhone}&text=${encodeURIComponent(
                        `Hi ${inviteName || "Reporter"}, you are exclusively invited to join SD News Hub as a verified contributor. Please complete your registration here: ${generatedInviteUrl}`
                      )}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xs text-center flex items-center justify-center gap-1"
                    >
                      Send via WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
