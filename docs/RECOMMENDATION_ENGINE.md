# Hybrid AI Recommendation Engine

CineVerse combines algorithmic taste vector scoring with Large Language Model (Groq LLaMA 3.3 70B) reasoning to deliver personalized, explainable movie recommendations.

---

## ⚙️ Recommendation Pipeline Diagram

```mermaid
graph TD
    UserWatchlist[User Ratings & Watchlist History] --> TasteCalc[Taste Vector Calculator]
    TasteCalc --> Vector[5-Dimensional Movie DNA Vector]
    
    Query[User Context / Request] --> GroqPrompt[Groq Prompt Engineering Engine]
    Vector --> GroqPrompt
    TMDBData[TMDB Trending & Candidate Pool] --> Filter[Content Similarity Pre-Filter]
    
    Filter --> CandidateSet[Filtered 50 Candidate Movies]
    CandidateSet --> GroqPrompt
    
    GroqPrompt --> GroqInference[Groq LLaMA 3.3 70B LLM Inference]
    GroqInference --> ZodParse[Zod Output Parser & Validator]
    ZodParse --> FinalRecs[Top Recommended Movies + AI Explanation]
```

---

## 🧮 Taste Vector Weighting Formula

The recommendation engine calculates match confidence \(M\) between a user's Movie DNA vector \(\vec{U}\) and a candidate movie's feature vector \(\vec{M}\):

\[
M(\vec{U}, \vec{M}) = w_1 \cdot \text{CosineSimilarity}(\vec{U}_{\text{genre}}, \vec{M}_{\text{genre}}) + w_2 \cdot (1 - |\vec{U}_{\text{tempo}} - \vec{M}_{\text{tempo}}|) + w_3 \cdot S_{\text{mood}}
\]

Where:
- \(w_1 = 0.40\) (Genre affinity weight)
- \(w_2 = 0.30\) (Pacing / Tempo weight)
- \(w_3 = 0.30\) (Mood & visual complexity weight)

---

## 🤖 LLM Explanation Synthesis
Groq LLaMA 3.3 evaluates the candidate set alongside the user's recent highly rated films to output a structured JSON response containing:
- `movieId`: Unique identifier.
- `matchPercentage`: Calculated match score (80% - 99%).
- `aiReasoning`: Human-readable 2-sentence explanation of why this movie fits their current taste profile.
