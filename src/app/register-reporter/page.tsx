"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, collection, addDoc, serverTimestamp, storage, query, where, getDocs, doc, updateDoc } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import NewsAuthHeader from "@/components/NewsAuthHeader";

export default function RegisterReporter() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Auth Checks
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem("sd_current_user_email") || "";
      setUserEmail(email);
      
      const isVip = sessionStorage.getItem("sd_vip_invite") === "true";
      const vipName = sessionStorage.getItem("sd_vip_recipient_name") || "";
      
      setFormData(prev => ({ 
        ...prev, 
        email,
        fullName: prev.fullName || vipName
      }));
    }
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    state: "Odisha",
    district: "",
    address: "",
    // Step 2: Agency
    organizationName: "",
    affiliation: "",
    preferredLanguage: "English & Odia",
    categories: [] as string[],
    // Step 3: Files
    photoUrl: "",
    idUrl: ""
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const categoriesList = ["Politics", "Crime", "Business", "Entertainment", "Sports", "Odisha"];

  const handleCategoryToggle = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileRef = ref(storage, `reporters/${folder}/${Date.now()}_${file.name}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setStatus("submitting");

    try {
      let finalPhotoUrl = "";
      let finalIdUrl = "";

      if (photoFile) finalPhotoUrl = await uploadFile(photoFile, "photos");
      if (idFile) finalIdUrl = await uploadFile(idFile, "ids");

      // Force explicitly pulling the email from storage at the exact moment of submission
      const currentEmail = localStorage.getItem("sd_current_user_email") || formData.email;

      await addDoc(collection(db, "news_reporters"), {
        ...formData,
        email: currentEmail, // Explicitly enforce email
        photoUrl: finalPhotoUrl,
        idUrl: finalIdUrl,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Update invitation status if registering via VIP invite link
      if (typeof window !== "undefined") {
        const inviteId = sessionStorage.getItem("sd_vip_invite_id");
        if (inviteId) {
          try {
            const q = query(collection(db, "reporter_invitations"), where("inviteId", "==", inviteId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const inviteRef = doc(db, "reporter_invitations", snapshot.docs[0].id);
              await updateDoc(inviteRef, { status: "registered" });
            }
            // Clear invite info from sessionStorage upon successful registration
            sessionStorage.removeItem("sd_vip_invite");
            sessionStorage.removeItem("sd_vip_recipient_name");
            sessionStorage.removeItem("sd_vip_invite_id");
          } catch (inviteErr) {
            console.error("Failed to update invitation status:", inviteErr);
          }
        }
      }

      setStatus("success");
    } catch (error) {
      console.error("Registration failed:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 font-sans">
         <div className="max-w-md w-full bg-[#050810] border border-[#1C2438] p-10 rounded-2xl text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Application Received</h2>
            <p className="text-gray-400 text-sm mb-8">
              Thank you, {formData.fullName}. Your application and documents have been uploaded to our secure servers. We will review it shortly.
            </p>
            <Link href="/" className="bg-[#C5A059] text-[#0A0F1C] font-black py-3 px-6 rounded-lg w-full block transition-transform hover:-translate-y-1">
              Return to News Hub
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col font-sans">
      <header className="bg-[#050810] border-b border-[#1C2438] text-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center rounded font-bold text-[#0A0F1C]">SD</div>
            <h1 className="text-lg font-bold tracking-wider">News Hub</h1>
          </Link>
          <NewsAuthHeader lang="en" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12">
        
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= num ? 'bg-[#C5A059] text-[#0A0F1C] shadow-lg shadow-[#C5A059]/50' : 'bg-[#1C2438] text-gray-500'
              }`}>
                {num}
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#1C2438] -mt-5 relative z-0">
             <div className="h-full bg-[#C5A059] transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span className={step >= 1 ? "text-[#C5A059]" : ""}>Personal</span>
            <span className={step >= 2 ? "text-[#C5A059]" : ""}>Agency</span>
            <span className={step >= 3 ? "text-[#C5A059]" : ""}>Documents</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#050810] border border-[#1C2438] rounded-2xl p-8 shadow-xl">
          
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-white mb-6">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Legal Name *</label>
                  <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address *</label>
                  <input readOnly value={formData.email} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone Number *</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">WhatsApp Number</label>
                  <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">State / District *</label>
                  <input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. Khordha" className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Address *</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-white mb-6">Media & Coverage</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">News Agency / Publication Name *</label>
                  <input required value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} placeholder="e.g. Independent Reporter" className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Coverage Categories *</label>
                  <div className="flex flex-wrap gap-3">
                    {categoriesList.map(cat => (
                      <button 
                        type="button" 
                        key={cat} 
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${formData.categories.includes(cat) ? 'bg-[#C5A059] text-[#0A0F1C] border-[#C5A059]' : 'bg-[#0A0F1C] text-gray-400 border-[#1C2438] hover:border-gray-500'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-white mb-6">Identity Verification</h2>
              
              <div className="bg-[#0A0F1C] border border-[#1C2438] rounded-xl p-6">
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-[#1C2438] rounded-full overflow-hidden border-2 border-[#C5A059]/30 flex items-center justify-center shrink-0 relative group">
                       {photoFile ? (
                         <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                       )}
                       <input required type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div>
                       <h3 className="font-bold text-white mb-1">Professional Photo *</h3>
                       <p className="text-xs text-gray-500 mb-3">This will appear on your Digital Press ID Card. Please upload a clear headshot.</p>
                       <label className="text-xs font-bold text-[#C5A059] border border-[#C5A059] px-4 py-2 rounded hover:bg-[#C5A059]/10 cursor-pointer inline-block">
                          Choose Photo
                          <input required type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="hidden" />
                       </label>
                    </div>
                 </div>
              </div>

              <div className="bg-[#0A0F1C] border border-[#1C2438] rounded-xl p-6">
                 <h3 className="font-bold text-white mb-1">Government ID (Aadhar/Voter) *</h3>
                 <p className="text-xs text-gray-500 mb-4">Required for official media accreditation and verification.</p>
                 
                 <label className="border-2 border-dashed border-[#1C2438] hover:border-[#C5A059] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#050810]">
                    <svg className="w-10 h-10 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="text-sm font-bold text-gray-300">Click to upload ID Document</span>
                    <span className="text-xs text-gray-500 mt-1">{idFile ? idFile.name : 'JPG, PNG or PDF (Max 5MB)'}</span>
                    <input required type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} className="hidden" />
                 </label>
              </div>

              {status === "submitting" && (
                <div className="w-full bg-[#1C2438] rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-[#C5A059] h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 flex gap-4 pt-6 border-t border-[#1C2438]">
             {step > 1 && (
               <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-lg font-bold text-gray-400 bg-[#1C2438] hover:bg-[#2A344A] transition-colors">
                 Back
               </button>
             )}
             <button type="submit" disabled={status === "submitting"} className="flex-1 bg-gradient-to-r from-[#C5A059] to-[#996515] hover:from-[#d4b06a] hover:to-[#a87422] text-[#0A0F1C] font-black py-3 rounded-lg transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
               {status === "submitting" ? "Uploading Securely..." : step === 3 ? "Submit Application" : "Continue"}
             </button>
          </div>

        </form>
      </main>
    </div>
  );
}
