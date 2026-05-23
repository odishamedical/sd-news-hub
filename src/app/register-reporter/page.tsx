"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db, collection, addDoc, serverTimestamp } from "@/lib/firebase";
import NewsAuthHeader from "@/components/NewsAuthHeader";

export default function RegisterReporter() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    organizationName: "",
    type: "Reporter",
    email: "",
    phone: "",
    whatsapp: "",
    country: "India",
    state: "",
    district: "",
    address: "",
    passportPhotoBase64: "",
    // Step 2
    idPhotoUrl: "",
    affiliation: "",
    experience: "",
    portfolio: "",
    // Step 3
    preferredLanguage: "English & Odia",
    coverageArea: "Odisha State",
    categories: [] as string[],
    // Step 4
    agreementOriginal: false,
    agreementTerms: false
  });

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  // For demonstration, a simple district list for Odisha. In a full app, this would be dynamic based on the state.
  const odishaDistricts = [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", 
    "Ganjam", "Jagatsinghapur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", 
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", 
    "Subarnapur", "Sundargarh"
  ];

  const handleCategoryToggle = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, passportPhotoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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
      <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
        {/* Primary Header */}
        <header className="bg-[#0B2B26] text-white">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
                <span className="text-[#C5A059] font-bold text-sm">NP</span>
              </div>
              <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
            </Link>
            <nav className="hidden md:flex gap-8 text-sm font-semibold">
              <Link href="/" className="hover:text-[#C5A059] transition-colors py-5">Home</Link>
              <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Odisha</Link>
              <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Politics</Link>
              <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Business</Link>
            </nav>
            <NewsAuthHeader lang="en" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-10 rounded-xl shadow-xl max-w-lg w-full border-t-4 border-[#C5A059]">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-black font-serif mb-4 text-[#0A1C16]">Application Received</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Thank you, {formData.fullName}. Your professional profile has been submitted securely. Our editorial team will review your application and generate your Digital ID Card upon approval.
            </p>
            <Link href="/" className="bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold py-4 px-6 rounded w-full block transition-colors shadow-lg hover:shadow-xl">
              Return to News Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
      {/* Exact Primary Header from page.tsx */}
      <header className="bg-[#0B2B26] text-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-[#C5A059] flex items-center justify-center rounded">
              <span className="text-[#C5A059] font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">SD NEWS HUB</h1>
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold">
            <Link href="/" className="hover:text-[#C5A059] transition-colors py-5">Home</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Odisha</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Politics</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Business</Link>
          </nav>
          
          <NewsAuthHeader lang="en" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#0B2B26] mb-4">Official Contributor Application</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Complete this 4-step professional verification to receive your Digital ID Card and publish directly to the SD News Hub.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          
          {/* Progress Bar Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-bold text-[#0B2B26] uppercase tracking-wider">
              Step {step} of 4: 
              {step === 1 && " Personal Details"}
              {step === 2 && " Credentials"}
              {step === 3 && " Preferences"}
              {step === 4 && " Compliance"}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-2 w-12 rounded-full transition-colors ${step >= s ? 'bg-[#C5A059]' : 'bg-gray-300'}`}></div>
              ))}
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. Shyam Dash" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Organization Name <span className="text-gray-400 font-normal ml-1">(If applicable)</span></label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} placeholder="e.g. Odisha Daily" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Applicant Type <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>Reporter</option>
                        <option>Freelancer</option>
                        <option>Newspaper</option>
                        <option>TV / YouTube Channel</option>
                        <option>News Website</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Contact Email <span className="text-red-500">*</span></label>
                      <input required type="email" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <input required type="tel" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">WhatsApp Number</label>
                      <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+91..." />
                    </div>
                  </div>

                  {/* Location Dropdowns */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-bold text-[#0B2B26] border-b border-gray-200 pb-2 mb-4">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#0A1C16] mb-2">Country <span className="text-red-500">*</span></label>
                        <select className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#C5A059]" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}>
                          <option>India</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0A1C16] mb-2">State <span className="text-red-500">*</span></label>
                        <select required className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#C5A059]" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: ""})}>
                          <option value="">Select State</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0A1C16] mb-2">District / City <span className="text-red-500">*</span></label>
                        {formData.state === "Odisha" ? (
                           <select required className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#C5A059]" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                             <option value="">Select District</option>
                             {odishaDistricts.map(dist => (
                               <option key={dist} value={dist}>{dist}</option>
                             ))}
                           </select>
                        ) : (
                          <input required type="text" className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#C5A059]" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="Enter District/City" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Detailed Address <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-white border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, landmark, PIN code" />
                    </div>
                  </div>

                  {/* Active Photo Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1C16] mb-2">Passport Size Photo (For ID Card) <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-[#C5A059] rounded-lg bg-yellow-50/30 p-6 flex flex-col items-center justify-center transition-colors hover:bg-yellow-50 relative overflow-hidden group">
                      {formData.passportPhotoBase64 ? (
                         <div className="flex flex-col items-center">
                           <img src={formData.passportPhotoBase64} alt="Passport Preview" className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md mb-3" />
                           <span className="text-sm text-green-600 font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Photo Captured</span>
                           <span className="text-xs text-gray-500 mt-1 cursor-pointer hover:underline">Click below to retake</span>
                         </div>
                      ) : (
                        <>
                          <div className="bg-[#0B2B26] text-[#C5A059] p-3 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          </div>
                          <span className="text-sm font-bold text-[#0B2B26]">Take Photo or Upload</span>
                          <span className="text-xs text-gray-500 mt-1 text-center max-w-xs">Face the camera directly in good lighting. This will be used for your Digital Press ID.</span>
                        </>
                      )}
                      
                      <input 
                        required={!formData.passportPhotoBase64}
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Take a photo or upload"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1C16] mb-2">Adhar / Voter / Press ID Upload <span className="text-gray-400 font-normal ml-2">Upload later</span></label>
                    <div className="border-2 border-dashed border-gray-300 rounded bg-gray-50 p-6 flex flex-col items-center justify-center cursor-not-allowed opacity-70">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <span className="text-sm font-bold text-gray-600">ID Verification securely unlocks upon approval</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Affiliation (if any)</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} placeholder="News Agency Name..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Years of Experience <span className="text-red-500">*</span></label>
                      <input required type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0A1C16] mb-2">Portfolio / Sample Work Links</label>
                    <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} placeholder="Paste YouTube links, article links, or website URLs here..."></textarea>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Preferred Language(s) <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.preferredLanguage} onChange={e => setFormData({...formData, preferredLanguage: e.target.value})}>
                        <option>Odia Only</option>
                        <option>English Only</option>
                        <option>Hindi Only</option>
                        <option>English & Odia</option>
                        <option>Multilingual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1C16] mb-2">Coverage Area <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 focus:outline-none focus:border-[#C5A059]" value={formData.coverageArea} onChange={e => setFormData({...formData, coverageArea: e.target.value})}>
                        <option>District Level</option>
                        <option>State Level (Odisha)</option>
                        <option>National Level</option>
                        <option>International</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0A1C16] mb-3">Preferred News Categories <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Politics', 'Sports', 'Business', 'Entertainment', 'Education', 'Health', 'Crime', 'Tech'].map(cat => (
                        <label key={cat} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${formData.categories.includes(cat) ? 'bg-[#0B2B26] text-white border-[#0B2B26]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                          <input type="checkbox" className="hidden" checked={formData.categories.includes(cat)} onChange={() => handleCategoryToggle(cat)} />
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${formData.categories.includes(cat) ? 'border-white bg-[#C5A059]' : 'border-gray-400 bg-white'}`}>
                            {formData.categories.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </div>
                          <span className="font-bold text-sm">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
                    <h3 className="font-bold font-serif text-lg text-orange-900 mb-2">Compliance & Agreement</h3>
                    <p className="text-sm text-orange-800 mb-6">By submitting this application, you are requesting official verification within the SD News Hub Ecosystem. Please read and agree to the following terms.</p>
                    
                    <div className="space-y-4">
                      <label className="flex items-start gap-4 cursor-pointer">
                        <div className="mt-1">
                          <input required type="checkbox" className="w-5 h-5 text-[#C5A059] focus:ring-[#C5A059] rounded border-gray-300" checked={formData.agreementOriginal} onChange={e => setFormData({...formData, agreementOriginal: e.target.checked})} />
                        </div>
                        <div>
                          <span className="font-bold text-[#0A1C16] block">Originality Declaration</span>
                          <span className="text-sm text-gray-600 block mt-1">I confirm that all news submitted by me is original, factually verified, or properly attributed to the original source. Plagiarism is strictly prohibited.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-4 cursor-pointer">
                        <div className="mt-1">
                          <input required type="checkbox" className="w-5 h-5 text-[#C5A059] focus:ring-[#C5A059] rounded border-gray-300" checked={formData.agreementTerms} onChange={e => setFormData({...formData, agreementTerms: e.target.checked})} />
                        </div>
                        <div>
                          <span className="font-bold text-[#0A1C16] block">Terms & Conditions Consent</span>
                          <span className="text-sm text-gray-600 block mt-1">I grant SD News Hub editorial rights to review, fact-check, and distribute my submissions. I agree to comply with all media broadcasting laws and SD Ecosystem guidelines.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="bg-red-50 text-red-600 p-4 rounded text-sm font-semibold border border-red-200">
                      There was an error connecting to the database. Please try again.
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between gap-4">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                ) : <div></div>}

                {step < 4 ? (
                  <button type="submit" className="px-8 py-3 bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-bold rounded transition-colors shadow-md">
                    Continue to Step {step + 1}
                  </button>
                ) : (
                  <button type="submit" disabled={status === "submitting"} className="px-10 py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] font-black rounded transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2">
                    {status === "submitting" ? (
                      <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A1C16]"></span> Processing...</>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
