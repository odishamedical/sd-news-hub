"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, collection, addDoc, serverTimestamp, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function AdvancedNewsGenerator() {
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Taxonomy State
  const [locationScope, setLocationScope] = useState("India");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [town, setTown] = useState("");
  const [category, setCategory] = useState("Politics");

  // Content State
  const [prompt, setPrompt] = useState("");
  const [engHeadline, setEngHeadline] = useState("");
  const [odiaHeadline, setOdiaHeadline] = useState("");
  const [engContent, setEngContent] = useState("");
  const [odiaContent, setOdiaContent] = useState("");

  // SEO State
  const [seoMetaDesc, setSeoMetaDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [hashtags, setHashtags] = useState("");

  // Media State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [aiImagePrompt, setAiImagePrompt] = useState("");

  useEffect(() => {
    // Check admin access
    const role = localStorage.getItem("sd_current_user_role");
    if (role !== "super_admin") {
      window.location.href = "/dashboard";
    }
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!prompt) return alert("Please enter a news prompt first!");
    setLoading(true);
    
    try {
      const response = await fetch("/api/generate-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          category,
          language: "English & Odia",
          tone: "Professional",
          includeThumbnail: false
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const aiData = resData.data;
        setEngHeadline(aiData.title_en || "");
        setOdiaHeadline(aiData.title_or || "");
        setEngContent(aiData.content_en || "");
        setOdiaContent(aiData.content_or || "");
        setSeoMetaDesc(aiData.summary_en || "");
        setSeoKeywords(aiData.seo_keywords || "");
        setHashtags(aiData.hashtags || "");
        setAiImagePrompt(aiData.thumbnail_prompt || "");
      } else {
        alert(resData.error || "Failed to generate content from AI");
      }
    } catch (error: any) {
      console.error("AI news generation error:", error);
      alert("Error generating content: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerateAIImage = () => {
    const finalPrompt = aiImagePrompt || `Realistic news photo for article about ${category} in ${state || 'Odisha'}: ${prompt}`;
    setLoading(true);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=576&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
    setThumbnailFile(null);
    setThumbnailPreview(imageUrl);
    setLoading(false);
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileRef = ref(storage, `news_thumbnails/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(fileRef, file);
      
      task.on("state_changed", 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handlePublish = async () => {
    if (!engHeadline || !engContent) return alert("Please generate or write content first.");
    setPublishing(true);

    try {
      let finalThumbnailUrl = "";
      if (thumbnailFile) {
        try {
          finalThumbnailUrl = await uploadFile(thumbnailFile);
        } catch (uploadError) {
          console.warn("Storage upload failed, falling back to Base64:", uploadError);
          finalThumbnailUrl = await fileToBase64(thumbnailFile);
        }
      } else if (thumbnailPreview) {
        finalThumbnailUrl = thumbnailPreview;
      }

      const reporterEmail = localStorage.getItem("sd_current_user_email") || "admin@sdnewshub.com";
      const reporterName = localStorage.getItem("sd_current_user_name") || "Editorial Admin";

      await addDoc(collection(db, "news_articles"), {
        // Core
        title: engHeadline,
        titleOdia: odiaHeadline,
        content: engContent,
        contentOdia: odiaContent,
        summary: seoMetaDesc,
        category,
        thumbnailBase64: finalThumbnailUrl, // keeping the field name compatible for now
        
        // SEO
        seoKeywords,
        hashtags,

        // Taxonomy
        locationScope,
        state,
        district,
        block,
        town,

        // Metadata
        reporterEmail,
        reporterName,
        status: "published", // Admins publish directly
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);

    } catch (error) {
      console.error("Publishing failed:", error);
      alert("Failed to publish article. Check console for details.");
    } finally {
      setPublishing(false);
      setUploadProgress(0);
    }
  };

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
          <Link 
            href="/admin?tab=dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg font-medium transition-colors hover:bg-[#1C2438]/20"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </Link>
          
          <Link 
            href="/admin/generator"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left bg-[#1C2438]/50 text-white border border-[#C5A059]/20 shadow-lg"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            AI News Generator
          </Link>

          <Link 
            href="/admin?tab=articles"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg font-medium transition-colors hover:bg-[#1C2438]/20"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            Articles Queue
          </Link>

          <Link 
            href="/admin?tab=reporters"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg font-medium transition-colors hover:bg-[#1C2438]/20"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Reporters Desk
          </Link>
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
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            <h1 className="text-lg font-black tracking-wider text-white">ADVANCED NEWS CREATOR</h1>
          </div>
          <div className="flex gap-3">
             <button disabled className="px-4 py-2 bg-[#1C2438] text-gray-400 font-bold rounded-lg text-sm">Save Draft</button>
             <button 
               onClick={handlePublish}
               disabled={publishing || success}
               className="px-6 py-2 bg-gradient-to-r from-[#C5A059] to-[#996515] hover:from-[#d4b06a] hover:to-[#a87422] text-[#0A0F1C] font-black rounded-lg text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#C5A059]/20 flex items-center gap-2"
             >
               {publishing ? "Publishing..." : success ? "Published!" : "Publish Live ⚡"}
             </button>
          </div>
        </header>

        {success && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 p-4 text-center font-bold">
             Article successfully published! Redirecting to Dashboard...
          </div>
        )}

        {publishing && uploadProgress > 0 && (
          <div className="bg-[#050810] border-b border-[#1C2438] p-1">
            <div className="h-1 bg-[#C5A059] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main Editors */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* AI Prompt Block */}
              <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                   <h2 className="text-sm font-black uppercase tracking-wider text-[#C5A059] flex items-center gap-2">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg>
                     AI Master Prompt
                   </h2>
                </div>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3} 
                  className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none mb-4"
                  placeholder="Enter raw facts, a press release, or short bullet points here..."
                />
                <button 
                  onClick={handleGenerateAI}
                  disabled={loading}
                  className="w-full py-3 bg-[#1C2438] hover:bg-[#2A344A] text-white font-bold rounded-lg transition-colors border border-[#C5A059]/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating Content...</>
                  ) : (
                    <>✨ Generate Full Article, Translations & SEO</>
                  )}
                </button>
              </div>

              {/* Dual Headlines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">English Headline</label>
                  <textarea rows={2} value={engHeadline} onChange={e => setEngHeadline(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white font-serif text-lg font-bold focus:border-[#C5A059] focus:outline-none"></textarea>
                </div>
                <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Odia Headline</label>
                  <textarea rows={2} value={odiaHeadline} onChange={e => setOdiaHeadline(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white font-serif text-lg font-bold focus:border-[#C5A059] focus:outline-none"></textarea>
                </div>
              </div>

              {/* Dual Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>English Article</span>
                    <span className="text-blue-400 cursor-pointer hover:underline">Rich Editor</span>
                  </label>
                  <textarea rows={12} value={engContent} onChange={e => setEngContent(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-gray-300 font-serif leading-relaxed focus:border-[#C5A059] focus:outline-none"></textarea>
                </div>
                <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Odia Article</span>
                    <span className="text-blue-400 cursor-pointer hover:underline">Rich Editor</span>
                  </label>
                  <textarea rows={12} value={odiaContent} onChange={e => setOdiaContent(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-gray-300 font-serif leading-relaxed focus:border-[#C5A059] focus:outline-none"></textarea>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Sidebar Tools */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Location Taxonomy */}
              <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C2438] pb-2">Granular Taxonomy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none">
                      <option>Politics</option><option>Crime</option><option>Business</option><option>Sports</option><option>Entertainment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Scope</label>
                    <select value={locationScope} onChange={e => setLocationScope(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none">
                      <option>International</option><option>India</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
                    <input value={state} onChange={e => setState(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
                    <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Optional" className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Block</label>
                      <input value={block} onChange={e => setBlock(e.target.value)} placeholder="Optional" className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Town</label>
                      <input value={town} onChange={e => setTown(e.target.value)} placeholder="Optional" className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-white text-sm focus:border-[#C5A059] focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Overrides */}
              <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C2438] pb-2 flex justify-between">
                  Manual SEO Overrides
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Google Optimized</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex justify-between">
                      <span>Meta Description</span>
                      <span className={seoMetaDesc.length > 160 ? "text-red-400" : "text-gray-500"}>{seoMetaDesc.length}/160</span>
                    </label>
                    <textarea rows={3} value={seoMetaDesc} onChange={e => setSeoMetaDesc(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-gray-300 text-sm focus:border-[#C5A059] focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Keywords (Comma Separated)</label>
                    <input value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-blue-400 text-sm focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Hashtags</label>
                    <input value={hashtags} onChange={e => setHashtags(e.target.value)} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-md px-3 py-2 text-[#C5A059] text-sm focus:border-[#C5A059] focus:outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="bg-[#050810] border border-[#1C2438] rounded-xl p-6 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C2438] pb-2">Media & Thumbnail</h3>
                
                {aiImagePrompt && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">AI Image Generation Prompt</label>
                    <textarea 
                      value={aiImagePrompt} 
                      onChange={e => setAiImagePrompt(e.target.value)} 
                      rows={3} 
                      className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg p-2 text-xs text-white focus:border-[#C5A059] focus:outline-none leading-relaxed font-mono"
                      placeholder="Enter prompt to generate an image..."
                    />
                  </div>
                )}

                <div className="aspect-video w-full bg-[#0A0F1C] border-2 border-dashed border-[#1C2438] rounded-lg overflow-hidden relative group flex flex-col items-center justify-center">
                   {thumbnailPreview ? (
                     <>
                       <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-sm font-bold bg-[#1C2438] px-4 py-2 rounded-lg cursor-pointer">Change Image</span>
                       </div>
                     </>
                   ) : (
                     <div className="text-center p-4">
                       <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       <p className="text-xs text-gray-400 font-bold mb-1">Upload Real Photo</p>
                       <p className="text-[10px] text-gray-600">JPG, PNG (Max 5MB)</p>
                     </div>
                   )}
                   <input type="file" accept="image/*" onChange={handlePhotoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                 <button 
                   type="button"
                   onClick={handleGenerateAIImage}
                   disabled={!aiImagePrompt && !prompt}
                   className="w-full mt-3 py-2 bg-[#1C2438] text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-[#2A344A] transition-colors border border-gray-700 disabled:opacity-50"
                 >
                    <svg className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg>
                    Generate AI Thumbnail
                 </button>
               </div>

             </div>
           </div>
         </div>
      </main>
    </div>
  );
 }
