# LangGraph Multi-Agent Workflow

CineVerse uses **LangGraph** to coordinate multi-agent conversations, complex multi-step film research, and intent-based agent routing.

---

## 🤖 Agent Topology & Graph Diagram

```mermaid
graph TD
    Start([User Input Message]) --> Router[Intent Classifier Node]
    
    Router -->|General Film Chat| AssistantNode[Movie Assistant Agent]
    Router -->|Taste Query| TasteNode[Movie DNA Taste Agent]
    Router -->|Watch Party Request| PartyNode[Watch Party Host Agent]
    Router -->|Moderation Alert| ModNode[Content Moderation Node]
    
    AssistantNode --> FetchContext[TMDB Metadata Lookup]
    FetchContext --> Synthesize[LLM Response Generation]
    
    TasteNode --> FetchVector[Prisma DB Vector Fetch]
    FetchVector --> Synthesize
    
    PartyNode --> CheckRoom[Socket Room Inspector]
    CheckRoom --> Synthesize
    
    ModNode --> SafetyResponse[Safety Warning Output]
    
    Synthesize --> End([Stream Response to Client])
    SafetyResponse --> End
```

---

## ⚙️ LangGraph State Schema (`src/ai/orchestrator.ts`)

```typescript
import { StateGraph, END } from '@langchain/langgraph';

export interface AgentState {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  userId: string;
  intent?: 'recommend' | 'taste' | 'watchparty' | 'general';
  movieContext?: any[];
  safetyCheckPassed: boolean;
}
```
