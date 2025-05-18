"use client";

import type React from "react";

import { Inter } from "next/font/google";
import "./globals.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RouteGuard from "@/components/auth/RouteGuard";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // List of public paths that don't use the app layout (login, register, etc)
  const fullScreenPaths = ["/login", "/register", "/forgot-password"];
  const isFullScreenPage = fullScreenPaths.includes(pathname);

  return (
    <div className={inter.className}>
      <RouteGuard>
        {isFullScreenPage ? (
          <div className="min-h-screen bg-gray-50">{children}</div>
        ) : (
          <div className="flex h-screen overflow-hidden bg-gray-50">
            {isAuthenticated && (
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="z-20 md:z-auto"
                  >
                    <Sidebar setSidebarOpen={setSidebarOpen} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
              {isAuthenticated && (
                <Header
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}
              <main
                className={`flex-1 overflow-y-auto bg-gray-50 ${isAuthenticated ? "p-4 md:p-6" : ""}`}
              >
                {children}
              </main>
            </div>
          </div>
        )}
      </RouteGuard>
    </div>
  );
}
