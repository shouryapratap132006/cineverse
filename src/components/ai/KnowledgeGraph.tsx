"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Sparkles, BookOpen, User, Info, ArrowLeftRight } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "movie" | "person" | "theme" | "genre" | "studio" | "award";
  weight: number;
  color?: string;
  description?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  strength: number;
}

interface KnowledgeGraphData {
  centerNode: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface KnowledgeGraphProps {
  movieId: string;
  movieTitle: string;
}

export default function KnowledgeGraph({ movieId, movieTitle }: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    fetchGraph();
  }, [movieId]);

  const fetchGraph = async () => {
    setIsLoading(true);
    setGraphData(null);
    setSelectedNode(null);

    try {
      const res = await fetch("/api/ai/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, movieTitle })
      });
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        setSelectedNode(data.centerNode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-slate-900/20 rounded-3xl border border-white/5">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <Network className="w-4 h-4 text-brand-purple" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Mapping Cinematic Connections...
        </span>
      </div>
    );
  }

  if (!graphData) return null;

  // Orbit node coordinates generator
  const getCoordinates = (index: number, total: number, radius = 100) => {
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: 180 + radius * Math.cos(angle),
      y: 180 + radius * Math.sin(angle)
    };
  };

  const centerCoords = { x: 180, y: 180 };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Network className="w-4.5 h-4.5 text-brand-purple" />
          Knowledge Graph Map
        </h3>
        <p className="text-[11px] text-slate-400 font-semibold">
          Explore actors, directors, thematic genres, and composer strings connected to this title.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* SVG Node Canvas */}
        <div className="lg:col-span-3 flex justify-center bg-slate-950/40 border border-white/5 rounded-2xl p-4 overflow-hidden relative min-h-[360px]">
          <svg viewBox="0 0 360 360" className="w-[320px] h-[320px] select-none">
            {/* Draw edge lines from center node to peripheral nodes */}
            {graphData.nodes.map((node, index) => {
              const coords = getCoordinates(index, graphData.nodes.length, 110);
              return (
                <g key={`edge-${node.id}`}>
                  <line
                    x1={centerCoords.x}
                    y1={centerCoords.y}
                    x2={coords.x}
                    y2={coords.y}
                    stroke={selectedNode?.id === node.id ? "#8B5CF6" : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth={selectedNode?.id === node.id ? "1.5" : "1"}
                    strokeDasharray={node.type === "theme" ? "4,4" : "0"}
                  />
                  {/* Subtle pulsing animation along selected edge */}
                  {selectedNode?.id === node.id && (
                    <circle r="3" fill="#8B5CF6">
                      <animateMotion
                        path={`M ${centerCoords.x} ${centerCoords.y} L ${coords.x} ${coords.y}`}
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Draw Outer orbit peripheral nodes */}
            {graphData.nodes.map((node, index) => {
              const coords = getCoordinates(index, graphData.nodes.length, 110);
              const nodeColor = node.color ?? "#3B82F6";
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 10 : 8}
                    fill={nodeColor}
                    className="transition-all duration-300 filter drop-shadow-md group-hover:scale-125"
                  />
                  {isSelected && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="15"
                      stroke={nodeColor}
                      strokeWidth="1.5"
                      fill="transparent"
                      className="animate-ping"
                      style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                    />
                  )}
                  {/* Label tag */}
                  <text
                    x={coords.x}
                    y={coords.y > 180 ? coords.y + 16 : coords.y - 12}
                    textAnchor="middle"
                    fill={isSelected ? "#FFF" : "#94A3B8"}
                    fontSize="8"
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="pointer-events-none text-[8px]"
                  >
                    {node.label.length > 12 ? `${node.label.slice(0, 10)}..` : node.label}
                  </text>
                </g>
              );
            })}

            {/* Center Core Node */}
            <g
              onClick={() => setSelectedNode(graphData.centerNode)}
              className="cursor-pointer group"
            >
              <circle
                cx={centerCoords.x}
                cy={centerCoords.y}
                r="18"
                fill="url(#centerGrad)"
                className="filter drop-shadow-lg group-hover:scale-105 transition-transform"
              />
              <text
                x={centerCoords.x}
                y={centerCoords.y + 4}
                textAnchor="middle"
                fill="#FFF"
                fontSize="9"
                fontWeight="black"
                className="pointer-events-none text-[9px]"
              >
                CORE
              </text>
              <defs>
                <radialGradient id="centerGrad">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </radialGradient>
              </defs>
            </g>
          </svg>
        </div>

        {/* Node detail card display */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 min-h-[220px] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedNode.color ?? "#8B5CF6" }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedNode.type} NODE
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {selectedNode.label}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedNode.description ?? "Explore connected thematic links across director styles, scores, and screen motifs."}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <Info className="w-3.5 h-3.5" />
                  <span>Click orbital nodes to pivot mapping</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
