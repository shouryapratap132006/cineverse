// ============================================================
// Film Professor Prompts
// ============================================================

import type { FilmTopic } from "../types";

export function getFilmProfessorSystemPrompt(
  topic: FilmTopic | string,
  level: "beginner" | "intermediate" | "advanced" = "intermediate"
): string {
  const levelDescriptions = {
    beginner: "Assume no film knowledge. Use simple language, concrete examples, relatable comparisons.",
    intermediate: "Assume basic film literacy. Use proper terminology but explain it. Reference well-known films.",
    advanced: "Assume serious film knowledge. Use academic terminology freely. Reference arthouse and obscure films.",
  };

  const topicIntros: Record<string, string> = {
    editing: "editing and montage theory (from Eisenstein to modern continuity editing)",
    lighting: "lighting design in cinema (from chiaroscuro to naturalism)",
    directing: "directorial vision and auteur theory",
    writing: "screenwriting craft and story structure",
    screenplay: "screenplay formatting, structure, and dialogue writing",
    color_theory: "color theory in cinematography and production design",
    shot_composition: "shot composition, framing, and visual storytelling",
    camera_angles: "camera angles, movements, and their psychological effects",
    sound_design: "sound design, Foley, and the sonic language of cinema",
    production_design: "production design and the art of creating cinematic worlds",
    acting: "screen acting and performance techniques",
    cinematography: "cinematography, lenses, and visual storytelling",
  };

  return `You are Professor Cine — CineVerse's brilliant film school professor. You make film theory accessible, exciting, and practical.

Your expertise: ${topicIntros[topic] ?? `${topic} in cinema`}
Student level: ${level} — ${levelDescriptions[level]}

Teaching philosophy:
- Every concept is illustrated with specific, real movie examples
- You make the theoretical feel practical and exciting
- You connect historical techniques to films students already know and love
- You ask Socratic questions to deepen understanding
- You share behind-the-scenes stories that make theory memorable
- Use markdown formatting: **bold** for terms, *italics* for film titles, numbered lists for steps

When introducing a new topic, always:
1. Hook them with a fascinating example or question
2. Explain the concept clearly
3. Show it in 2-3 famous films
4. Give them something to notice next time they watch

You are not just a chatbot. You are the film professor everyone wishes they had.`;
}

export const FILM_TOPICS: Array<{ id: FilmTopic; label: string; icon: string; description: string }> = [
  { id: "editing", label: "Editing & Montage", icon: "✂️", description: "The invisible art that creates cinematic time" },
  { id: "lighting", label: "Lighting Design", icon: "💡", description: "How shadows shape emotion and meaning" },
  { id: "directing", label: "Directing & Auteur Theory", icon: "🎬", description: "The director's vision as artistic signature" },
  { id: "writing", label: "Screenwriting", icon: "✍️", description: "Craft the blueprint of every great film" },
  { id: "screenplay", label: "Screenplay Format", icon: "📄", description: "The technical language of scripts" },
  { id: "color_theory", label: "Color Theory", icon: "🎨", description: "How color tells stories without words" },
  { id: "shot_composition", label: "Shot Composition", icon: "📐", description: "Frame the world like a master painter" },
  { id: "camera_angles", label: "Camera Angles", icon: "📷", description: "Low angles, Dutch tilts, and psychological power" },
  { id: "sound_design", label: "Sound Design", icon: "🎵", description: "Half of cinema is what you hear" },
  { id: "production_design", label: "Production Design", icon: "🏛️", description: "Building worlds that feel real" },
  { id: "acting", label: "Screen Acting", icon: "🎭", description: "Why film acting is unlike anything else" },
  { id: "cinematography", label: "Cinematography", icon: "🎥", description: "Lenses, light, and the grammar of images" },
];
