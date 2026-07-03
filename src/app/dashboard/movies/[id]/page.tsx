import React from "react";
import MovieDetailsClient from "./MovieDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailsPage({ params }: PageProps) {
  // Await params promise in compliance with Next.js 15 App Router specifications
  const { id } = await params;

  return <MovieDetailsClient id={id} />;
}
