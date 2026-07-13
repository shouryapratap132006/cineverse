"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export interface UserProfileData {
  username: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  favoriteGenres: string[];
  favoriteMovies: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  language: string;
  country: string;
}

// Lazy Sync function to ensure user and profile exist in database
export async function syncUserAccount(mockUserData?: { id: string; email: string; username: string }) {
  let userId: string | null = null;
  let email: string | null = null;
  let defaultUsername: string = "cinephile";

  if (hasClerkKey) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      if (clerkUser) {
        userId = clerkUser.id;
        email = clerkUser.emailAddresses[0]?.emailAddress || null;
        defaultUsername = clerkUser.username || email?.split("@")[0] || "cinephile";
      }
    } catch (e) {
      console.error("Failed fetching Clerk current user:", e);
    }
  } else {
    // Read from sandbox cookie or parameter
    const cookieStore = await cookies();
    const mockSession = cookieStore.get("cineverse_session");
    if (mockSession) {
      try {
        const data = JSON.parse(mockSession.value);
        userId = data.id;
        email = data.email;
        defaultUsername = data.username || email?.split("@")[0] || "cinephile";
      } catch (e) {
        // Fallback to params
      }
    }

    if (!userId && mockUserData) {
      userId = mockUserData.id;
      email = mockUserData.email;
      defaultUsername = mockUserData.username;
    }
  }

  if (!userId || !email) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    // Check database
    let userRecord = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    let isNewUser = false;
    if (!userRecord) {
      isNewUser = true;
      // 1. Check if username is unique
      let finalUsername = defaultUsername;
      const existingProfile = await db.profile.findUnique({
        where: { username: finalUsername },
      });
      if (existingProfile) {
        finalUsername = `${defaultUsername}_${Math.floor(Math.random() * 1000)}`;
      }

      // 2. Create User and Profile in transaction
      userRecord = await db.user.create({
        data: {
          id: userId,
          email: email,
          profile: {
            create: {
              username: finalUsername,
              bio: "Cinephile reviewing the classics.",
              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
              bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
              favoriteGenres: [],
              favoriteMovies: [],
              favoriteActors: [],
              favoriteDirectors: [],
            },
          },
        },
        include: { profile: true },
      });
    }

    return { success: true, user: userRecord, isNewUser };
  } catch (error: any) {
    console.error("Database sync user error:", error);
    return { success: false, error: error.message };
  }
}

// Update profile config
export async function updateProfile(data: UserProfileData) {
  let userId: string | null = null;

  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      userId = session.userId;
    } catch (e) {}
  } else {
    const cookieStore = await cookies();
    const mockSession = cookieStore.get("cineverse_session");
    if (mockSession) {
      userId = JSON.parse(mockSession.value).id;
    }
  }

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify username uniqueness if it changed
    const currentProfile = await db.profile.findUnique({ where: { id: userId } });
    if (currentProfile && currentProfile.username !== data.username) {
      const exists = await db.profile.findUnique({ where: { username: data.username } });
      if (exists) {
        return { success: false, error: "Username is already taken" };
      }
    }

    const updated = await db.profile.update({
      where: { id: userId },
      data: {
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        favoriteGenres: data.favoriteGenres,
        favoriteMovies: data.favoriteMovies,
        favoriteActors: data.favoriteActors,
        favoriteDirectors: data.favoriteDirectors,
        language: data.language,
        country: data.country,
      },
    });

    return { success: true, profile: updated };
  } catch (error: any) {
    console.error("Update profile DB error:", error);
    return { success: false, error: error.message };
  }
}

// Retrieve profile
export async function getUserProfile(username: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { username },
      include: {
        user: {
          include: {
            reviews: true,
            watchlists: true,
            favorites: true,
          },
        },
      },
    });
    return profile;
  } catch (error) {
    console.error("Get user profile DB error:", error);
    return null;
  }
}

// Save top 5 favourite movies (stores TMDB IDs in favoriteMovies string[])
export async function updateTopFavoriteMovies(movieIds: string[]) {
  const { cookies } = await import("next/headers");
  let userId: string | null = null;

  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      userId = session.userId;
    } catch (e) {}
  } else {
    const cookieStore = await cookies();
    const mockSession = cookieStore.get("cineverse_session");
    if (mockSession) {
      userId = JSON.parse(mockSession.value).id;
    }
  }

  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Ensure movies exist in the Movie table (upsert stubs)
    // The actual movie data is stored in TMDB; we just need the IDs
    const updated = await db.profile.update({
      where: { id: userId },
      data: { favoriteMovies: movieIds.slice(0, 5) },
    });
    return { success: true, profile: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
