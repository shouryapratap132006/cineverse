"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Star, MessageSquare, Flame } from "lucide-react";
import { MOCK_MOVIES } from "@/lib/mockData";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [customReviews] = useLocalStorage<Record<string, any[]>>("cineverse_movie_reviews", {});

  useEffect(() => {
    // Gather all default reviews in mock data
    const allMockReviews: any[] = [];
    MOCK_MOVIES.forEach((movie) => {
      movie.reviews.forEach((rev) => {
        allMockReviews.push({
          ...rev,
          movieId: movie.id,
          movieTitle: movie.title,
          posterUrl: movie.posterUrl
        });
      });
    });

    // Gather custom reviews in localStorage
    const allCustomReviews: any[] = [];
    Object.keys(customReviews).forEach((movieId) => {
      const movie = MOCK_MOVIES.find((m) => m.id === movieId);
      const mReviews = customReviews[movieId] || [];
      mReviews.forEach((rev) => {
        allCustomReviews.push({
          ...rev,
          movieId: movieId,
          movieTitle: movie?.title || "Unknown Movie",
          posterUrl: movie?.posterUrl || ""
        });
      });
    });

    // Combine and sort by date/id
    const combined = [...allCustomReviews, ...allMockReviews];
    setReviews(combined);
  }, [customReviews]);

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
          Cinephile Critiques
        </h1>
        <p className="text-xs text-slate-400">
          Browse comprehensive reviews, scores, and critiques written by the CineVerse community.
        </p>
      </div>

      {/* Reviews feed list */}
      <div className="space-y-5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 border border-white/5 bg-white/2 rounded-2xl flex flex-col md:flex-row items-start md:space-x-5 gap-4 hover:border-white/10 transition group"
          >
            {/* Movie Poster */}
            {rev.posterUrl && (
              <img
                src={rev.posterUrl}
                alt={rev.movieTitle}
                className="w-16 h-24 object-cover rounded-xl border border-white/10 flex-shrink-0 group-hover:scale-102 transition"
              />
            )}

            {/* Critique Details */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">
                    {rev.user} <span className="text-[10px] text-slate-500 font-medium">on</span>{" "}
                    <Link href={`/dashboard/movies/${rev.movieId}`} className="text-brand-purple hover:underline font-bold">
                      {rev.movieTitle}
                    </Link>
                  </h4>
                  <span className="text-[9px] text-slate-500 font-semibold block">{rev.date}</span>
                </div>

                <div className="flex items-center text-brand-gold text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-brand-gold mr-0.5" />
                  <span>{rev.rating} / 10</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {rev.content}
              </p>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-20 text-xs text-slate-500">
            No critiques are active. Log reviews inside movie pages to populate this feed.
          </div>
        )}
      </div>
    </div>
  );
}
