"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCineverseAuth } from "@/components/provider";
import { Film, Search, Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, user, signOut } = useCineverseAuth();
  
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Monitor scroll for show/hide behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Glass background activation
      setIsScrolled(currentScrollY > 20);
      
      // Auto-hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Home", href: "/#hero" },
    { name: "Discover", href: "/dashboard/discover" },
    { name: "Features", href: "/#features" },
    { name: "Community", href: "/#community" },
    { name: "Pricing", href: "#", comingSoon: true },
    { name: "About", href: "#" },
  ];

  const isAuthPage = pathname.startsWith("/auth") || pathname.startsWith("/onboarding");
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isAuthPage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
            isScrolled 
              ? "bg-slate-950/70 border-b border-white/5 backdrop-blur-md py-4" 
              : "bg-transparent py-6"
          )}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple opacity-40 blur-md group-hover:opacity-75 transition duration-300" />
                <div className="relative bg-slate-950 border border-white/15 p-2 rounded-lg text-white">
                  <Film className="w-5 h-5 text-brand-purple group-hover:text-brand-blue transition duration-300" />
                </div>
              </div>
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group flex items-center">
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-300 hover:text-white transition duration-200"
                  >
                    {link.name}
                  </Link>
                  {link.comingSoon && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                      Soon
                    </span>
                  )}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-blue to-brand-purple"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Buttons / User Panel */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => router.push("/dashboard/discover")} 
                className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded-full transition"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSignedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition"
                  >
                    <img
                      src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={user?.username || "Profile"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-slate-200 pr-2 max-w-[120px] truncate">{user?.username}</span>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 z-50 rounded-xl glass-panel border border-white/10 shadow-2xl p-2"
                        >
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                          >
                            <LayoutDashboard className="w-4.5 h-4.5 text-brand-blue" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                          >
                            <User className="w-4.5 h-4.5 text-brand-purple" />
                            <span>My Profile</span>
                          </Link>
                          <hr className="border-white/5 my-1.5" />
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              signOut();
                              router.push("/");
                            }}
                            className="flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                          >
                            <LogOut className="w-4.5 h-4.5" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="relative text-sm font-semibold text-white px-5 py-2.5 rounded-lg overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-300 group-hover:scale-105" />
                    <span className="relative z-10">Get Started</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-4">
              <button 
                onClick={() => router.push("/dashboard/discover")} 
                className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded-full transition"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2 rounded-lg border border-white/10 bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden w-full glass-panel border-b border-white/5 px-6 py-6 space-y-4"
              >
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span>{link.name}</span>
                      {link.comingSoon && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                          Coming Soon
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
                <hr className="border-white/10 my-4" />
                <div className="flex flex-col space-y-3">
                  {isSignedIn ? (
                    <>
                      <div className="flex items-center space-x-3.5 mb-2">
                        <img
                          src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                          alt={user?.username || "Profile"}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">{user?.username}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                          router.push("/");
                        }}
                        className="w-full text-center py-2.5 rounded-lg text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/20 transition"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-lg text-sm bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold shadow-lg transition"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
