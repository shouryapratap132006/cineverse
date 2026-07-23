# RAG (Retrieval-Augmented Generation) Pipeline

CineVerse uses a **RAG Pipeline** to ground AI responses in verified film trivia, cast filmographies, and curated director notes.

---

## 📐 RAG Flow Diagram

```mermaid
graph LR
    UserQuery[User Inquiry] --> Embedder[Text Embedding Generator]
    Embedder --> VectorQuery[Vector Similarity Search]
    VectorQuery --> VectorDB[(FAISS / Embedding Index)]
    VectorDB --> TopK[Top-K Retranslated Chunks]
    
    TopK --> PromptContext[Prompt Context Injector]
    UserQuery --> PromptContext
    PromptContext --> LLM[Groq LLaMA 3.3 70B]
    LLM --> VerifiedResponse[Factually Grounded Response]
```

---

## 💡 Vector Index & Embeddings Strategy
- **Embedding Model**: OpenAI `text-embedding-3-small` / HuggingFace All-MiniLM-L6-v2.
- **Chunking Strategy**: Film trivia and plot summaries are chunked into 512-token segments with 50-token overlap.
- **Context Injection**: Relevant chunks are formatted into markdown blocks inside the system prompt before LLM invocation.
