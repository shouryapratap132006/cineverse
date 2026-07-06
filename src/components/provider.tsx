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

import { useAuth, useUser, useClerk } from "@clerk/nextjs";

export interface UnifiedUser {
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

interface CineverseAuthContextType {
  isClerk: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: UnifiedUser | null;
  signIn: (email: string) => boolean;
  signUp: (username: string, email: string) => boolean;
  signOut: () => void;
  updateUser: (data: Partial<UnifiedUser>) => void;
}

const CineverseAuthContext = createContext<CineverseAuthContextType | undefined>(undefined);

export function useCineverseAuth() {
  const context = useContext(CineverseAuthContext);
  if (!context) {
    throw new Error("useCineverseAuth must be used within AppProviders");
  }
  return context;
}

// Wrapper to check if Clerk is configured
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      setLoadingDb(true);
      // Lazy sync & fetch the user from database
      import("@/actions/user").then(({ syncUserAccount }) => {
        syncUserAccount()
          .then((res) => {
            if (res.success && res.user) {
              setDbUser(res.user);
            }
            setLoadingDb(false);
          })
          .catch(() => setLoadingDb(false));
      });
    } else {
      setDbUser(null);
      setLoadingDb(false);
    }
  }, [isSignedIn, userId]);

  const value: CineverseAuthContextType = {
    isClerk: true,
    isLoaded: authLoaded && userLoaded && !loadingDb,
    isSignedIn: !!isSignedIn,
    user: clerkUser ? {
      id: clerkUser.id,
      username: dbUser?.profile?.username || clerkUser.username || clerkUser.firstName || "cinephile",
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      avatarUrl: dbUser?.profile?.avatarUrl || clerkUser.imageUrl,
      bannerUrl: dbUser?.profile?.bannerUrl,
      bio: dbUser?.profile?.bio,
      favoriteGenres: dbUser?.profile?.favoriteGenres,
      favoriteMovies: dbUser?.profile?.favoriteMovies,
      isOnboarded: !!(dbUser?.profile?.favoriteGenres?.length),
    } : null,
    signIn: () => false,
    signUp: () => false,
    signOut: () => {
      signOut();
    },
    updateUser: (data) => {
      if (dbUser) {
        setDbUser({
          ...dbUser,
          profile: {
            ...dbUser.profile,
            ...data
          }
        });
      }
    }
  };

  return <CineverseAuthContext.Provider value={value}>{children}</CineverseAuthContext.Provider>;
}

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(null);
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
    const mockUser: UnifiedUser = {
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
    const mockUser: UnifiedUser = {
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

  const updateUser = (data: Partial<UnifiedUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("cineverse_user", JSON.stringify(updated));
  };

  const value = {
    isClerk: false,
    isLoaded,
    isSignedIn: !!user,
    user,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <CineverseAuthContext.Provider value={value}>{children}</CineverseAuthContext.Provider>;
}

import { dark, experimental_createTheme } from "@clerk/themes";

const cineverseTheme = experimental_createTheme({
  baseTheme: dark,
  variables: { colorPrimary: "#7C3AED", colorBackground: "#0c0f1d" },
});

export default function AppProviders({ children }: { children: React.ReactNode }) {
  // If Clerk Publishable key exists, wrap in ClerkProvider, else use the normal chain
  if (hasClerkKey) {
    return (
      <ClerkProvider 
        appearance={cineverseTheme}
      >
        <QueryClientProvider client={queryClient}>
          <ClerkAuthProvider>{children}</ClerkAuthProvider>
        </QueryClientProvider>
      </ClerkProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>{children}</MockAuthProvider>
    </QueryClientProvider>
  );
}
