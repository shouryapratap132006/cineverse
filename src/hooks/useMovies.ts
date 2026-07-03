"use client";

import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, getTrendingMovies, searchMovies } from "@/lib/tmdb";
import { Movie } from "@/lib/mockData";

export function useTrendingMovies() {
  return useQuery<Movie[]>({
    queryKey: ["movies", "trending"],
    queryFn: () => getTrendingMovies(),
  });
}

export function useSearchMovies(query: string) {
  return useQuery<Movie[]>({
    queryKey: ["movies", "search", query],
    queryFn: () => searchMovies(query),
    enabled: true, // Let it run initially with empty query to load MOCK_MOVIES
  });
}

export function useMovieDetails(id: string) {
  return useQuery<Movie | null>({
    queryKey: ["movies", "details", id],
    queryFn: () => getMovieDetails(id),
    enabled: !!id,
  });
}
