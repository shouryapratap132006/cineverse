import React from "react";
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import WhyCineVerse from "@/components/landing/WhyCineVerse";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import MovieCategories from "@/components/landing/MovieCategories";
import AIRecommendationShowcase from "@/components/landing/AIRecommendationShowcase";
import CommunitySection from "@/components/landing/CommunitySection";
import Statistics from "@/components/landing/Statistics";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative flex-grow flex flex-col">
        {/* Hero Section */}
        <Hero />
        
        {/* Trusted By Studio Marquee */}
        <TrustedBy />
        
        {/* Why CineVerse (Feature Grid) */}
        <WhyCineVerse />
        
        {/* Interactive Dashboard Demo Playground */}
        <InteractiveDemo />
        
        {/* Movie Categories Collage Grid */}
        <MovieCategories />
        
        {/* AI Recommendation Showcase (Chat Simulation) */}
        <AIRecommendationShowcase />
        
        {/* Social Community discussions & Poll panels */}
        <CommunitySection />
        
        {/* Statistics Counters */}
        <Statistics />
        
        {/* Auto-sliding Testimonials Carousel */}
        <Testimonials />
        
        {/* FAQ Accordions */}
        <FAQ />
        
        {/* Final Cinematic Call-to-Action */}
        <CTA />
      </main>
      <Footer />
    </>
  );
}
