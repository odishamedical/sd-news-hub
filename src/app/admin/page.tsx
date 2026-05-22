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

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("sd_current_user_role");
      if (role !== "super_admin") {
        router.push("/");
      } else {
        setIsAdmin(true);
        fetchReporters();
      }
    }
  }, [router]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const reporterRef = doc(db, "news_reporters", id);
      await updateDoc(reporterRef, { status: newStatus });
      setReporters(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating reporter status", error);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Admin Header */}
      <header className="bg-[#0A1C16] text-[#C5A059] h-16 flex items-center px-6 justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold tracking-wider text-white hover:text-[#C5A059]">SD NEWS HUB</Link>
          <span className="text-sm font-semibold px-2 py-1 bg-[#1a3d35] rounded text-[#C5A059]">ADMIN PORTAL</span>
        </div>
        <div className="flex gap-4">
          <Link href="https://sd-auth-center.vercel.app/launcher" className="text-sm hover:text-white transition-colors">Back to Launchpad</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-serif text-[#0B2B26]">Reporter Management</h1>
          <div className="text-sm font-bold bg-white px-4 py-2 rounded shadow">
            Total Applications: {reporters.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B2B26]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0B2B26] text-white">
                    <th className="p-4 font-semibold text-sm">Applicant Name</th>
                    <th className="p-4 font-semibold text-sm">Agency / Channel</th>
                    <th className="p-4 font-semibold text-sm">Coverage Area</th>
                    <th className="p-4 font-semibold text-sm">Press ID</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reporters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No reporter applications found.</td>
                    </tr>
                  ) : (
                    reporters.map((reporter) => (
                      <tr key={reporter.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#0A1C16]">{reporter.fullName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{reporter.agencyName}</div>
                          <a href={reporter.channelLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View Channel
                          </a>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{reporter.coverageArea}</td>
                        <td className="p-4 text-sm font-mono text-gray-500">{reporter.pressIdNumber || "N/A"}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            reporter.status === "approved" ? "bg-green-100 text-green-700" :
                            reporter.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {reporter.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          {reporter.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(reporter.id, "approved")}
                                className="bg-[#0B2B26] hover:bg-[#1a3d35] text-[#C5A059] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(reporter.id, "rejected")}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {reporter.status === "approved" && (
                            <button 
                              onClick={() => handleUpdateStatus(reporter.id, "rejected")}
                              className="text-gray-400 hover:text-red-500 text-xs font-semibold px-2 py-1"
                            >
                              Revoke Access
                            </button>
                          )}
                          {reporter.status === "rejected" && (
                            <button 
                              onClick={() => handleUpdateStatus(reporter.id, "approved")}
                              className="text-gray-400 hover:text-green-600 text-xs font-semibold px-2 py-1"
                            >
                              Re-Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
