"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/nextjs";

// React Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Mock Auth Context
interface MockUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  favoriteGenres?: string[];
  favoriteMovies?: string[];
  favoriteActors?: string[];
  favoriteDirectors?: string[];
  isOnboarded?: boolean;
}

interface MockAuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: MockUser | null;
  signIn: (email: string) => boolean;
  signUp: (username: string, email: string) => boolean;
  signOut: () => void;
  updateUser: (data: Partial<MockUser>) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}

// Wrapper to check if Clerk is configured
const hasClerkKey = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem("cineverse_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoaded(true);
  }, []);

  const signIn = (email: string) => {
    // Basic mock authentication
    const mockUser: MockUser = {
      id: "usr_mock123",
      username: email.split("@")[0] || "cinephile",
      email: email,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      isOnboarded: localStorage.getItem("cineverse_onboarded") === "true",
    };
    
    // Check if onboarding data is stored
    const storedProfile = localStorage.getItem("cineverse_profile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      mockUser.username = profile.username || mockUser.username;
      mockUser.avatarUrl = profile.avatarUrl || mockUser.avatarUrl;
      mockUser.bannerUrl = profile.bannerUrl;
      mockUser.bio = profile.bio;
      mockUser.favoriteGenres = profile.favoriteGenres;
      mockUser.favoriteMovies = profile.favoriteMovies;
      mockUser.favoriteActors = profile.favoriteActors;
      mockUser.favoriteDirectors = profile.favoriteDirectors;
      mockUser.isOnboarded = true;
    }

    setUser(mockUser);
    localStorage.setItem("cineverse_user", JSON.stringify(mockUser));
    return true;
  };

  const signUp = (username: string, email: string) => {
    const mockUser: MockUser = {
      id: "usr_mock123",
      username: username,
      email: email,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      isOnboarded: false,
    };
    setUser(mockUser);
    localStorage.setItem("cineverse_user", JSON.stringify(mockUser));
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("cineverse_user");
  };

  const updateUser = (data: Partial<MockUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("cineverse_user", JSON.stringify(updated));
  };

  const value = {
    isSignedIn: !!user,
    isLoaded,
    user,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

// Global Auth hook that abstracts Clerk vs Mock
export function useCineverseAuth() {
  const mockContext = useContext(MockAuthContext);
  
  // If Mock Auth is active, use it
  if (mockContext) {
    return {
      isClerk: false,
      isLoaded: mockContext.isLoaded,
      isSignedIn: mockContext.isSignedIn,
      user: mockContext.user,
      signIn: mockContext.signIn,
      signUp: mockContext.signUp,
      signOut: mockContext.signOut,
      updateUser: mockContext.updateUser,
    };
  }

  // Fallback signature for when we're just matching Clerk's hook (placeholder if not using mock)
  return {
    isClerk: true,
    isLoaded: true,
    isSignedIn: false,
    user: null,
    signIn: () => false,
    signUp: () => false,
    signOut: () => {},
    updateUser: () => {},
  };
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>{children}</MockAuthProvider>
    </QueryClientProvider>
  );

  // If Clerk Publishable key exists, wrap in ClerkProvider, else use the normal chain
  if (hasClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
