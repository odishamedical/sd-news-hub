"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, serverTimestamp, query, getDocs, where } from "@/lib/firebase";
import NewsAuthHeader from "@/components/NewsAuthHeader";

const SD_PORTALS = [
  {
    name: "SD IT Hub",
    tagline: "Domain, Hosting & Digital Services",
    url: "https://sd-it-hub-w3sk.vercel.app/",
    icon: "💻",
    color: "from-blue-900 to-blue-700",
    badge: "Tech"
  },
  {
    name: "SD Gold Hub",
    tagline: "Live Gold & Silver Market Rates",
    url: "https://sd-gold-hub.vercel.app/",
    icon: "🏅",
    color: "from-yellow-800 to-yellow-600",
    badge: "Finance"
  },
  {
    name: "Bhulia Hub",
    tagline: "Authentic Sambalpuri Sarees & Handloom",
    url: "https://sd-bhulia-hub.vercel.app/",
    icon: "🧵",
    color: "from-red-900 to-red-700",
    badge: "Handloom"
  },
  {
    name: "Dehapa Health",
    tagline: "Consult Doctors via Video Call",
    url: "https://sd-dehapa-hub.vercel.app/",
    icon: "🩺",
    color: "from-teal-900 to-teal-700",
    badge: "Health"
  },
  {
    name: "SD Directory",
    tagline: "Find Local Businesses & Services",
    url: "https://sd-directory.vercel.app/",
    icon: "📋",
    color: "from-purple-900 to-purple-700",
    badge: "Directory"
  },
  {
    name: "SD News Hub",
    tagline: "Odisha & India Breaking News",
    url: "https://sd-news-hub.vercel.app/",
    icon: "📰",
    color: "from-[#0B2B26] to-[#1a4a40]",
    badge: "News"
  },
];

type ReporterStatus = "none" | "pending" | "approved";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [reporterStatus, setReporterStatus] = useState<ReporterStatus>("none");
  const [loading, setLoading] = useState(true);

  const getProjectUrl = (baseUrl: string) => {
    if (!user) return baseUrl;
    const url = new URL(baseUrl);
    url.searchParams.set("token", "sso_jump");
    url.searchParams.set("sso_email", user.email);
    url.searchParams.set("sso_name", user.name);
    if (typeof window !== "undefined") {
      const avatar = localStorage.getItem("sd_current_user_avatar");
      if (avatar) url.searchParams.set("sso_avatar", avatar);
      const role = localStorage.getItem("sd_current_user_role");
      if (role) url.searchParams.set("sso_role", role);
    }
    return url.toString();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      if (!email) {
        window.location.href = `https://sd-auth-center.vercel.app?redirect_uri=${encodeURIComponent(window.location.href)}`;
        return;
      }
      const name = localStorage.getItem("sd_current_user_name") || "User";
      setUser({ email, name });
      checkReporterStatus(email);
    }
  }, []);

  const checkReporterStatus = async (email: string) => {
    try {
      const role = localStorage.getItem("sd_current_user_role");
      if (role === "super_admin") {
        setReporterStatus("approved");
        setLoading(false);
        return;
      }

      const q = query(collection(db, "news_reporters"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const application = snapshot.docs[0].data();
        setReporterStatus(application.status === "approved" ? "approved" : "pending");
      } else {
        setReporterStatus("none");
      }
    } catch (e) {
      console.error(e);
      setReporterStatus("none");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sd_current_user_email");
    localStorage.removeItem("sd_current_user_name");
    localStorage.removeItem("sd_current_user_role");
    router.push("/");
  };

  const initials = user?.name?.substring(0, 2).toUpperCase() || "SD";

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
          <nav className="hidden md:flex gap-8 text-sm font-semibold">
            <Link href="/" className="hover:text-[#C5A059] transition-colors py-5">Home</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Odisha</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Politics</Link>
            <Link href="#" className="hover:text-[#C5A059] transition-colors py-5">Business</Link>
          </nav>
          <NewsAuthHeader lang="en" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0B2B26] to-[#1a4a40] rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#C5A059] flex items-center justify-center text-[#0A1C16] text-3xl font-black shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <p className="text-[#C5A059] text-sm font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h2 className="text-white text-3xl font-black font-serif mb-1">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="border border-gray-600 text-gray-400 hover:text-white hover:border-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* SD Ecosystem Portals */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 bg-[#C5A059] rounded-full"></div>
                <h3 className="text-xl font-black text-[#0B2B26]">SD Ecosystem Portals</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SD_PORTALS.map((portal) => (
                  <a
                    key={portal.name}
                    href={getProjectUrl(portal.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gradient-to-br ${portal.color} rounded-xl p-5 text-white group hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex items-center gap-4`}
                  >
                    <div className="text-4xl flex-shrink-0">{portal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">{portal.badge}</span>
                      <h4 className="font-black text-lg mt-1 leading-tight">{portal.name}</h4>
                      <p className="text-white/70 text-xs mt-0.5 leading-snug">{portal.tagline}</p>
                    </div>
                    <svg className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </a>
                ))}
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">

            {/* Reporter Status Card */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden p-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Checking Status...</p>
              </div>
            ) : reporterStatus === "none" ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0B2B26] to-[#1a4a40] px-5 py-4">
                  <h4 className="text-white font-black text-lg">Become a Contributor</h4>
                  <p className="text-gray-300 text-xs mt-1">Join the SD News Hub editorial network</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-[#C5A059] text-lg">✔</span>
                    <span>Publish news directly to the live feed</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-[#C5A059] text-lg">✔</span>
                    <span>Get your Digital Press ID Card</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-[#C5A059] text-lg">✔</span>
                    <span>Access editorial tools & analytics</span>
                  </div>
                  <Link href="/register-reporter" className="block w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A1C16] font-black text-center py-3 rounded-lg mt-2 transition-colors shadow-md">
                    Apply Now →
                  </Link>
                </div>
              </div>
            ) : reporterStatus === "pending" ? (
              <div className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-200 px-5 py-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h4 className="font-black text-amber-800">Application Pending</h4>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed">Your contributor application is currently under review by our editorial team. We will notify you once it's approved and your Digital ID Card is ready.</p>
                </div>
              </div>
            ) : reporterStatus === "approved" && (
              <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 px-5 py-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h4 className="font-black text-green-800">Verified Contributor</h4>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-600">You have full access to the Reporter Desk. Publish news directly to the live feed.</p>
                  <Link href="/reporter-desk" className="block w-full bg-[#0B2B26] hover:bg-[#051815] text-[#C5A059] font-black text-center py-3 rounded-lg transition-colors">
                    Open Reporter Desk →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <h4 className="font-black text-[#0B2B26] mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors">
                  <span>🏠</span> SD News Hub Home
                </Link>
                <a href="https://sd-auth-center.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors">
                  <span>🔐</span> Manage My Account
                </a>
                <Link href="/register-reporter" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors">
                  <span>📝</span> Contributor Application
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
