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
        finalThumbnailUrl = await uploadFile(thumbnailFile);
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
    <div className="min-h-screen bg-[#0A0F1C] text-gray-200 font-sans pb-20">
      {/* Header */}
      <header className="bg-[#050810] border-b border-[#1C2438] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFE082] to-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#050810] font-bold text-sm">SD</span>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
              <button className="w-full mt-3 py-2 bg-[#1C2438] text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-[#2A344A] transition-colors">
                 <svg className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg>
                 Generate AI Thumbnail Instead
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
