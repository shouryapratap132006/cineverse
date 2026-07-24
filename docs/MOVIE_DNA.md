# Movie DNA Visual Radar Specification

**Movie DNA** is CineVerse's signature visualization tool, transforming complex viewing habits into an intuitive 5-axis radar chart.

---

## 📊 The 5 DNA Axes

1. **Mood (Dark ↔ Uplifting)**: Measures affinity for somber, noir, and psychological themes vs. lighthearted, comedic, and inspirational stories.
2. **Tempo (Contemplative ↔ High-Octane)**: Evaluates preference for slow-burn art-house cinema vs. fast-paced action and thriller pacing.
3. **Narrative Complexity (Linear ↔ Mind-Bending)**: Tracks preference for straightforward storytelling vs. non-linear, multi-timeline, or ambiguous endings.
4. **Visual Style (Minimalist ↔ Spectacle)**: Measures interest in gritty realism vs. visual effects, vibrant cinematography, and grand set design.
5. **Thematic Depth (Escapist ↔ Philosophical)**: Evaluates preference for pure entertainment vs. deep moral, social, and existential commentary.

---

## 🖥️ UI Component Rendering

The Movie DNA radar chart is rendered client-side using SVG path calculations and Framer Motion:

```tsx
// src/components/ai/MovieDNARadar.tsx
export function MovieDNARadar({ tasteVector }: { tasteVector: TasteVector }) {
  // Calculates SVG polygon coordinates for 5 axes
  const points = calculateRadarPolygon(tasteVector);
  return (
    <svg className="w-full h-64 viewBox="0 0 400 400"">
      <polygon points={points} className="fill-purple-500/30 stroke-purple-500 stroke-2" />
    </svg>
  );
}
```
