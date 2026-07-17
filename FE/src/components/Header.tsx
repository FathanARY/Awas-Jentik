"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function Header({ leftContent, rightContent }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
      <header className="pointer-events-auto max-w-5xl mx-auto bg-white/50 backdrop-blur-xl border border-white/60 shadow-lg shadow-blue-900/5 rounded-full flex justify-between items-center px-6 py-3 transition-all">
        {leftContent || (
          <Link href="/" className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:-translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-base">water_drop</span>
            </span>
            MalariaWatch
          </Link>
        )}
        
        {rightContent || (
          <div className="flex items-center gap-1 md:gap-3">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-white/60 transition-colors"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            
            {user ? (
              <div className="relative group">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-white/60 transition-colors"
                  aria-label="Account"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-auto">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{user.username || "User"}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role || "user"}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors rounded-b-xl"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="pointer-events-auto px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                Login
              </Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
