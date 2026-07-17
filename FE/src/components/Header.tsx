"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/app/api";

interface HeaderProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function Header({ leftContent, rightContent }: HeaderProps) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiFetch<{ count: number }>("/notifications/unread/count")
        .then(r => setUnreadCount(r.count))
        .catch(() => {});
      const interval = setInterval(() => {
        apiFetch<{ count: number }>("/notifications/unread/count")
          .then(r => setUnreadCount(r.count))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
      <header className="pointer-events-auto max-w-5xl mx-auto bg-surface/70 backdrop-blur-xl border border-outline-variant shadow-sm rounded-full flex justify-between items-center px-6 py-3 transition-all">
        {leftContent || (
          <Link href="/" className="font-extrabold tracking-tight text-lg text-on-background flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-on-primary shadow-sm shadow-primary/20 group-hover:-translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-base">water_drop</span>
            </span>
            MalariaWatch
          </Link>
        )}
        
        {rightContent || (
          <div className="flex items-center gap-1 md:gap-3">
            {user && (
              <Link
                href="/notifikasi"
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-subtle transition-colors relative"
                aria-label="Notifikasi"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
                )}
              </Link>
            )}
            
            {user ? (
              <div className="relative group">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-subtle transition-colors"
                  aria-label="Akun"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-auto">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-sm font-bold text-on-background">{user.username || "User"}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{user.role || "user"}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  {(user.role === "kader" || user.role === "admin") && (
                    <Link href="/kader" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                      Kader Dashboard
                    </Link>
                  )}
                  <Link href="/riwayat" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                    Riwayat Laporan
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container transition-colors rounded-b-xl"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="pointer-events-auto px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                Masuk
              </Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
