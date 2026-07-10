"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Sparkles, ChevronDown, ChevronUp, Eye, Compass, Music, HelpCircle } from "lucide-react";

interface SceneAnalysis {
  sceneName: string;
  movieTitle: string;
  importance: string;
  cinematography: {
    lighting: string;
    colorPalette: string;
    cameraMovement: string;
    shotTypes: string[];
  };
  editing: string;
  performance: string;
  dialogue: string;
  music: string;
  emotion: string;
  hiddenSymbolism: string[];
  themes: string[];
  funFacts: string[];
  whyIconic: string;
  filmSchoolLesson: string;
}

interface SceneExplorerProps {
  movieId: string;
  movieTitle: string;
}

export default function SceneExplorer({ movieId, movieTitle }: SceneExplorerProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SceneAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fallback iconic scene suggestions based on typical films
  const defaultScenes: Record<string, string[]> = {
    "27205": ["The Rotating Hallway Fight Scene", "The Ending Kick", "Mal's Hotel Confrontation"], // Inception
    "157336": ["The Docking Scene (No Time For Caution)", "The Wormhole Entry", "The Library Tesseract"], // Interstellar
    "120": ["The Bridge of Khazad-dûm (You Shall Not Pass)", "The Mirror of Galadriel", "Concerning Hobbits Opening"] // Fellowship of the Ring
  };

  const scenesList = defaultScenes[movieId] || [
    "The Climax Confrontation Scene",
    "The Inciting Incident Sequence",
    "The Midpoint Mirror Transition Scene"
  ];

  const handleSceneClick = async (sceneName: string) => {
    if (selectedScene === sceneName) {
      setSelectedScene(null);
      setAnalysis(null);
      return;
    }

    setSelectedScene(sceneName);
    setAnalysis(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, movieTitle, sceneName })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-brand-blue" />
          Scene Explorer
        </h3>
        <p className="text-[11px] text-slate-400 font-semibold">
          Select an iconic sequence to dissect its directorial mechanics.
        </p>
      </div>

      {/* Select buttons */}
      <div className="flex flex-wrap gap-2">
        {scenesList.map((scene) => (
          <button
            key={scene}
            onClick={() => handleSceneClick(scene)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
              selectedScene === scene
                ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white border-transparent"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {scene}
            {selectedScene === scene ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Expansion Details */}
      <AnimatePresence>
        {selectedScene && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-slate-500">Deconstructing framing...</span>
              </div>
            ) : (
              analysis && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-6 mt-2 backdrop-blur-xl">
                  {/* Headline summary */}
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <span className="text-[9px] font-bold text-brand-blue tracking-widest uppercase">
                      Scene Importance
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {analysis.importance}
                    </p>
                  </div>

                  {/* Cinematography & Mechanics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                        <Compass className="w-3.5 h-3.5 text-brand-purple" />
                        Cinematic Framing
                      </h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Lighting:</strong> {analysis.cinematography.lighting}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Color Palette:</strong> {analysis.cinematography.colorPalette}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Camera Work:</strong> {analysis.cinematography.cameraMovement}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                        <Music className="w-3.5 h-3.5 text-brand-blue" />
                        Sound & Performance
                      </h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Editing/Rhythm:</strong> {analysis.editing}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Soundtrack/Foley:</strong> {analysis.music}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          <strong className="text-slate-300">Performances:</strong> {analysis.performance}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Symbolism & Film School Lesson */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">
                        Visual Symbolism & Motifs
                      </span>
                      <ul className="space-y-1.5">
                        {analysis.hiddenSymbolism.slice(0, 3).map((sym, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-brand-purple shrink-0 mt-0.5">•</span>
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-brand-purple/10 to-brand-blue/5 border border-brand-purple/20 space-y-2">
                      <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple uppercase tracking-widest">
                        Film Professor Takeaway
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                        "{analysis.filmSchoolLesson}"
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
