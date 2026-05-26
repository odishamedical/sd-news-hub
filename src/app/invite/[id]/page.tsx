"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { db, collection, query, where, getDocs } from "@/lib/firebase";

export default function VipInvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    async function verifyInvite() {
      if (!inviteId) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "reporter_invitations"), where("inviteId", "==", inviteId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          // Verify it's not already used or rejected
          if (docData.status === "pending") {
            setRecipientName(docData.recipientName || "VIP Contributor");
            setIsValid(true);
          } else {
            setIsValid(false);
          }
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error verifying invitation:", error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    }
    verifyInvite();
  }, [inviteId]);

  const handleAcceptInvite = () => {
    // Save invite intent to sessionStorage so we know they came from an invite
    sessionStorage.setItem("sd_vip_invite", "true");
    sessionStorage.setItem("sd_vip_recipient_name", recipientName);
    sessionStorage.setItem("sd_vip_invite_id", inviteId);
    
    // Redirect to Auth Center with a special token/param if needed
    // For now, redirect to the centralized Auth Center Launcher which handles SSO
    window.location.href = `https://sd-auth-center.vercel.app/launcher?invite_name=${encodeURIComponent(recipientName)}&invite_id=${inviteId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#C5A059] border-t-transparent animate-spin mb-4"></div>
          <p className="text-[#C5A059] font-bold tracking-widest text-sm uppercase">Verifying Invitation...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-500/5 to-transparent"></div>
        <div className="max-w-md w-full bg-[#050810]/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 md:p-10 text-center relative z-10 shadow-2xl shadow-black/50">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h1 className="text-2xl font-black font-serif text-white mb-2">Invitation Expired</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            This invitation link is invalid, expired, or has already been used to register. Please contact the administrator for a new invite.
          </p>
          <Link href="/" className="w-full bg-[#1C2438] hover:bg-[#2A344A] text-white font-bold py-3.5 rounded-lg border border-gray-700 block transition-all">
            Return to News Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#C5A059]/10 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full bg-[#050810]/80 backdrop-blur-md border border-[#C5A059]/30 rounded-2xl p-8 md:p-10 text-center relative z-10 shadow-2xl shadow-black/50">
        
        {/* VIP Icon */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FFE082] to-[#996515] rounded-full p-1 mb-6 shadow-lg shadow-[#C5A059]/20">
          <div className="w-full h-full bg-[#0A0F1C] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          </div>
        </div>

        <h1 className="text-3xl font-black font-serif text-white mb-2">You're Invited!</h1>
        <div className="h-1 w-12 bg-[#C5A059] mx-auto mb-6 rounded-full"></div>
        
        <p className="text-gray-300 text-sm leading-relaxed mb-8">
          Hi <span className="font-black text-[#FFE082]">{recipientName}</span>! You are exclusively invited to join <span className="font-bold text-white">SD News Hub</span> as a Verified News Contributor. Connect your Gmail account to begin the onboarding process.
        </p>

        <button 
          onClick={handleAcceptInvite}
          className="w-full bg-gradient-to-r from-[#C5A059] to-[#996515] hover:from-[#d4b06a] hover:to-[#a87422] text-[#0A0F1C] font-black tracking-wider py-4 rounded-xl transition-all shadow-lg hover:shadow-[#C5A059]/20 transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
          </svg>
          ACCEPT & LOGIN VIA GMAIL
        </button>

        <p className="text-xs text-gray-500 mt-6">
          By accepting, you agree to our Editorial Guidelines and Terms of Service.
        </p>
      </div>
    </div>
  );
}
