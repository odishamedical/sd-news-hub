"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, getDocs, doc, updateDoc, addDoc, query, orderBy, limit, serverTimestamp } from "@/lib/firebase";

interface Invitation {
  id: string;
  inviteId: string;
  recipientName: string;
  phone: string;
  status: "pending" | "sent" | "registered" | "failed";
  createdAt: any;
}

interface ParsedContact {
  name: string;
  phone: string;
  status: "valid" | "invalid";
  reason?: string;
}

export default function BulkInvitesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkText, setBulkText] = useState("");
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  
  // Stats and History
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sendingProgress, setSendingProgress] = useState<number | null>(null);
  const [currentSendingName, setCurrentSendingName] = useState("");

  // Auth check
  useEffect(() => {
    const role = localStorage.getItem("sd_current_user_role");
    if (role !== "super_admin" && role !== "admin") {
      router.push("/");
    } else {
      setIsAdmin(true);
      fetchHistory();
    }
  }, [router]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "reporter_invitations"), orderBy("createdAt", "desc"), limit(100));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invitation[];
      setInvitations(data);
    } catch (err) {
      console.error("Error fetching invitation history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Parse Excel (Tab separated) or CSV (Comma separated)
  const handleParseData = () => {
    if (!bulkText.trim()) {
      alert("Please paste some data first!");
      return;
    }

    const lines = bulkText.split(/\r?\n/);
    const contacts: ParsedContact[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;

      // Split by tab (Excel copy-paste) or comma (CSV)
      let parts = line.split("\t");
      if (parts.length < 2) {
        parts = line.split(",");
      }

      if (parts.length >= 2) {
        const rawName = parts[0].trim();
        const rawPhone = parts[1].trim().replace(/[^0-9]/g, ""); // Strip non-numeric

        let status: "valid" | "invalid" = "valid";
        let reason = "";

        if (!rawName) {
          status = "invalid";
          reason = "Missing Name";
        } else if (rawPhone.length < 10) {
          status = "invalid";
          reason = "Invalid Phone Number (too short)";
        }

        contacts.push({
          name: rawName || "Unknown",
          phone: rawPhone,
          status,
          reason
        });
      }
    });

    setParsedContacts(contacts);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkText(text);
    };
    reader.readAsText(file);
  };

  const handleBroadcast = async () => {
    const validContacts = parsedContacts.filter(c => c.status === "valid");
    if (validContacts.length === 0) {
      alert("No valid contacts to broadcast to!");
      return;
    }

    setSendingProgress(0);

    for (let i = 0; i < validContacts.length; i++) {
      const contact = validContacts[i];
      setCurrentSendingName(contact.name);

      // Generate verification details
      const inviteId = "inv_" + Math.random().toString(36).substring(2, 10);
      const inviteUrl = `${window.location.origin}/invite/${inviteId}`;

      try {
        // 1. Write Invitation record to Firestore
        await addDoc(collection(db, "reporter_invitations"), {
          inviteId,
          recipientName: contact.name,
          phone: contact.phone,
          status: "pending", // Starts as pending, ready for WhatsApp sender engine
          createdAt: serverTimestamp()
        });

        // 2. Here is where the WhatsApp API will trigger in the future.
        // For now, we simulate the webhook/api latency.
        await new Promise(r => setTimeout(r, 600));

      } catch (err) {
        console.error("Failed to queue invite:", err);
      }

      setSendingProgress(Math.round(((i + 1) / validContacts.length) * 100));
    }

    alert("Bulk Invitations queued successfully in Firestore! Once the WhatsApp API is active, they will broadcast automatically.");
    setSendingProgress(null);
    setParsedContacts([]);
    setBulkText("");
    fetchHistory();
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
          <Link 
            href="/admin?tab=dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg font-medium transition-colors hover:bg-[#1C2438]/20"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </Link>
          
          <Link 
            href="/admin/generator"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg font-medium transition-colors hover:bg-[#1C2438]/20"
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

          <Link 
            href="/admin/bulk-invites"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left bg-[#1C2438]/50 text-white border border-[#C5A059]/20 shadow-lg"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            WhatsApp Bulk Invites
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
          <h1 className="text-xl font-bold text-white">WhatsApp Bulk Invitations</h1>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-[#1C2438] border border-[#C5A059] flex items-center justify-center text-xs font-bold text-[#C5A059]">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Panel */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-4 shadow-lg">
              <div>
                <h2 className="text-lg font-bold text-white">Excel Onboarding Console</h2>
                <p className="text-xs text-gray-400">Copy & paste rows directly from Excel, or upload a CSV file</p>
              </div>

              <div className="flex items-center justify-center border-2 border-dashed border-[#1C2438] hover:border-[#C5A059] rounded-lg p-4 cursor-pointer transition-colors bg-[#050810]/30 relative">
                <input 
                  type="file" 
                  accept=".csv,.txt" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <div className="text-center text-xs text-gray-400">
                  <svg className="w-6 h-6 text-[#C5A059] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <span>Click to Upload CSV / Text File</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">Or Paste Excel Rows (Format: Name [Tab/Comma] Phone)</label>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="e.g.&#10;Ramesh Kumar&#9;919876543210&#10;Sita Pradhan&#9;919988776655"
                  className="w-full bg-[#0A0F1C] border border-[#1C2438] rounded-lg p-3 text-sm text-white focus:border-[#C5A059] focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleParseData}
                  className="flex-1 bg-[#1C2438] hover:bg-[#2A344A] text-white border border-[#C5A059]/30 font-bold py-3 rounded-lg text-sm transition-all"
                >
                  Parse & Validate
                </button>
                {parsedContacts.length > 0 && (
                  <button
                    onClick={handleBroadcast}
                    disabled={sendingProgress !== null}
                    className="flex-1 bg-gradient-to-r from-[#C5A059] to-[#996515] hover:from-[#d4b06a] hover:to-[#a87422] text-[#0A0F1C] font-black py-3 rounded-lg text-sm shadow-lg hover:shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2"
                  >
                    Broadcast Queued Invites 🚀
                  </button>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-lg flex flex-col max-h-[500px]">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">Parsed Contacts Preview</h2>
                <p className="text-xs text-gray-400">Review contacts and formatting status before queueing</p>
              </div>

              <div className="flex-1 overflow-y-auto border border-[#1C2438] rounded-lg bg-[#050810]/50 divide-y divide-[#1F2937]">
                {parsedContacts.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-8 text-sm text-gray-500">
                    No contacts parsed yet. Paste rows or upload a file.
                  </div>
                ) : (
                  parsedContacts.map((contact, index) => (
                    <div key={index} className="p-3 flex items-center justify-between text-xs hover:bg-[#1F2937]/30">
                      <div>
                        <div className="font-bold text-white">{contact.name}</div>
                        <div className="text-gray-400 font-mono mt-0.5">{contact.phone}</div>
                      </div>
                      <div>
                        {contact.status === "valid" ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">Ready</span>
                        ) : (
                          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase title={contact.reason}">Invalid</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Broadcast Progress Bar */}
          {sendingProgress !== null && (
            <div className="bg-[#111827] border border-[#C5A059]/30 rounded-xl p-6 shadow-lg animate-pulse">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-bold text-white">Sending Broadcast Invite to {currentSendingName}...</span>
                <span className="font-mono text-[#C5A059] font-bold">{sendingProgress}%</span>
              </div>
              <div className="w-full bg-[#0A0F1C] border border-[#1F2937] rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#996515] h-full transition-all duration-300" style={{ width: `${sendingProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* Invitation History Logs */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1F2937] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Broadcast Logs & Onboarding Registry</h2>
                <p className="text-xs text-gray-400">Total queued or registered VIP invitations</p>
              </div>
              <button 
                onClick={fetchHistory}
                className="text-xs text-[#C5A059] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 px-3 py-1.5 rounded transition-all font-bold"
              >
                Refresh Log
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#050810] border-b border-[#1F2937] text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Phone / WhatsApp</th>
                    <th className="p-4">Invite ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Queued Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-gray-500 animate-pulse">Loading broadcast history...</td>
                    </tr>
                  ) : invitations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No invitations queued. Use the onboarding console above to start.</td>
                    </tr>
                  ) : (
                    invitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-[#1F2937]/30 transition-colors">
                        <td className="p-4 font-bold text-white">{invite.recipientName}</td>
                        <td className="p-4 text-gray-300 font-mono">{invite.phone}</td>
                        <td className="p-4 text-gray-400 font-mono">{invite.inviteId}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                            invite.status === "registered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            invite.status === "sent" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {invite.status || "pending"}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {invite.createdAt?.toDate ? invite.createdAt.toDate().toLocaleDateString() : 'Just Now'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
