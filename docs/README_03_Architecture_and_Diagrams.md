# Chapter 3: Architecture and Diagrams

---

## 3.1 System Architecture Overview

ZenLearn employs a **three-tier architecture** augmented with an AI orchestration layer, designed for modularity, fault tolerance, and horizontal scalability. Each tier operates independently and communicates through well-defined interfaces (HTTP REST, WebSocket, and internal Python function calls). This separation of concerns ensures that changes to the frontend UI do not require backend modifications, and that AI agents can be added, removed, or replaced without affecting the API gateway layer.

### 3.1.1 Tier Breakdown

| Tier | Responsibility | Technologies |
|---|---|---|
| **Presentation Tier** | User interface rendering, client-side state management, theme management | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Application Tier** | API gateway, request routing, authentication, caching, pipeline orchestration | FastAPI, Uvicorn, Pydantic v2, Redis, JWT, Celery |
| **Intelligence Tier** | AI reasoning, content generation, assessment creation, personalization | LangGraph, Google Gemini 2.0 Flash, Ollama (qwen2.5:3b), ChromaDB |
| **Data Tier** | Persistent storage, user management, memory persistence | PostgreSQL (NeonDB), Redis, localStorage |

---

## 3.2 Architecture Diagram

```mermaid
flowchart TD
    subgraph Presentation["🖥️ Presentation Tier (Browser)"]
        UI["React + Vite SPA"]
        LS["localStorage (XP, Paths, Stats)"]
        UI <--> LS
    end

    subgraph Application["⚙️ Application Tier (FastAPI)"]
        GW["API Gateway (FastAPI + Uvicorn)"]
        AUTH["Auth Middleware (JWT + Google OAuth)"]
        CACHE["Redis Cache (SHA-256 Keys)"]
        RL["Rate Limiter"]
        MON["Monitoring Middleware"]
    end

    subgraph Intelligence["🧠 Intelligence Tier"]
        ORCH["Orchestrator Agent"]
        CP["Course Pipeline Agent"]
        ASSESS["Assessment Agent"]
        RES["Resource Agent"]
        WELL["Wellness Agent"]
        SCHED["Scheduler Agent"]
        MOTIV["Motivation Agent"]
        PERS["Personalization Agent"]
        SKG["Skill Graph Agent"]
        REFL["Reflection Agent"]
        EXPL["Explainability Agent"]
        MEM["Memory Agent"]
    end

    subgraph External["🌐 External Services"]
        GEMINI["Google Gemini 2.0 Flash"]
        OLLAMA["Ollama (qwen2.5:3b)"]
        YT["YouTube Data API v3"]
    end

    subgraph Data["💾 Data Tier"]
        PG["PostgreSQL (NeonDB)"]
        REDIS["Redis (Cache + Broker)"]
        CHROMA["ChromaDB (Vectors)"]
    end

    UI -->|"HTTPS/REST"| GW
    GW --> AUTH
    AUTH --> CACHE
    CACHE -->|"Cache Miss"| ORCH
    ORCH --> CP
    ORCH --> ASSESS
    ORCH --> RES
    CP --> GEMINI
    ASSESS --> GEMINI
    ORCH --> OLLAMA
    RES --> YT
    ORCH --> WELL
    ORCH --> SCHED
    ORCH --> MOTIV
    ORCH --> PERS
    ORCH --> SKG
    ORCH --> REFL
    ORCH --> EXPL
    ORCH --> MEM
    MEM --> PG
    MEM --> CHROMA
    CACHE --> REDIS
    GW --> RL
    GW --> MON
```

---

## 3.3 Detailed Layer Descriptions

### 3.3.1 Presentation Layer (Frontend)

The frontend is a **single-page application (SPA)** built with React 18 and TypeScript, bundled by Vite for sub-second hot module replacement during development. The component architecture follows a hierarchical pattern:

**Page Components** (top-level routes):
- `AILearningHub.tsx` (87 KB) — The primary learning interface containing course generation, saved paths, progress tracking, and the gamification dashboard.
- `AIMentorPage.tsx` (23 KB) — Conversational AI mentor with multi-domain expertise and intent routing.
- `MockTestPage.tsx` (15 KB) — Standalone adaptive assessment interface.
- `ProfilePage.tsx` (23 KB) — User profile with skill analytics and settings.
- `ResumeBuilderPage.tsx` (39 KB) — AI-powered resume generation and PDF export.

**Shared Components**:
- `UnifiedLearningView.tsx` (29 KB) — Renders the complete pipeline output (course + mock test) with expandable modules, confidence scores, and engagement triggers.
- `ErrorBoundary.tsx` — React error boundary preventing full-application crashes from component-level errors.
- `SkeletonLearningView.tsx` — Animated placeholder UI displayed during pipeline generation.
- `Layout.tsx` + `Sidebar.tsx` — Application shell with navigation and responsive sidebar.

**State Management**: The application uses React Context API (`AIAgentContext.tsx`) for global state, with selective `localStorage` persistence for:
- AI Mentor chat history
- Enhanced learning paths
- Active assessment state
- XP and level progression

### 3.3.2 Application Layer (Backend)

The backend is a **FastAPI** application served by **Uvicorn** (ASGI server) with the following middleware stack:

1. **CORS Middleware** — Enforces allowlist-based cross-origin request policies.
2. **Rate Limiting Middleware** — Prevents abuse by throttling requests per IP address.
3. **Monitoring Middleware** — Logs request latency, status codes, and error rates.

**Key API Endpoints**:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/full-learning-pipeline` | Triggers the full course + mock test + resource generation pipeline |
| POST | `/api/ask` | Sends a message to the AI mentor orchestrator |
| POST | `/api/ai-agents/generate-learning-path` | Generates a basic learning path |
| POST | `/api/ai-agents/generate-assessment` | Generates an adaptive assessment |
| GET | `/api/ai-agents/recommendations` | Retrieves personalized recommendations |
| POST | `/api/auth/google` | Handles Google OAuth authentication |
| GET | `/health` | Returns system health status |
| GET | `/metrics` | Returns operational metrics |

### 3.3.3 Intelligence Layer (AI Engine)

This is the core differentiator of ZenLearn. The intelligence layer comprises 11 autonomous agents organized into a LangGraph `StateGraph`:

| Agent | File | Responsibility |
|---|---|---|
| Orchestrator | `orchestrator.py` (15.5 KB) | Intent classification, pipeline routing, agent coordination |
| Course Pipeline | `course_pipeline.py` (11.4 KB) | Full curriculum generation with validation and retry |
| Assessment | `assessment.py` (5.4 KB) | MCQ quiz generation and answer evaluation |
| Learning Resource | `learning_resource.py` (10.5 KB) | YouTube video discovery and article curation |
| Personalization | `personalization.py` (2.4 KB) | Learner profile adaptation (style, difficulty, pace) |
| Skill Graph | `skill_graph.py` (5.3 KB) | Dependency analysis, gap identification, path sequencing |
| Wellness | `wellness.py` (5.0 KB) | Fatigue/stress monitoring, burnout prevention |
| Scheduler | `scheduler.py` (5.2 KB) | Optimal study time and session planning |
| Reflection | `reflection.py` (3.4 KB) | Plan quality evaluation with conditional replanning |
| Motivation | `motivation.py` (5.4 KB) | Milestone celebration, encouragement generation |
| Explainability | `explainability.py` (2.1 KB) | Reasoning chain generation for transparency |
| Memory | `memory_agent.py` (1.3 KB) | Long-term interaction storage and retrieval |

### 3.3.4 Data Layer

**PostgreSQL (NeonDB):** Stores user accounts, authentication tokens, and long-term memory. Accessed via SQLAlchemy async engine with automatic table creation on startup.

**Redis:** Dual-purpose deployment:
- **Caching:** Pipeline responses cached with SHA-256 hash keys (TTL configurable).
- **Task Broker:** Celery task queue for background job processing.

**ChromaDB:** Vector database for semantic search over interaction history and resource embeddings. Deployed as a Docker container with persistent volume storage.

---

## 3.4 Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        S["👨‍🎓 Student"]
        A["👨‍💼 Admin"]
    end

    subgraph Core["Core Use Cases"]
        UC1["🔐 Login via Google OAuth"]
        UC2["📝 Enter Learning Goal"]
        UC3["📚 Generate AI Course"]
        UC4["📋 Take Mock Test"]
        UC5["💬 Chat with AI Mentor"]
        UC6["📊 Track Progress"]
        UC7["🏆 Earn XP & Level Up"]
        UC8["📄 Generate Resume"]
        UC9["🔍 View Saved Paths"]
        UC10["⬇️ Export Course Data"]
    end

    subgraph Admin["Admin Use Cases"]
        UC11["📈 Monitor System Health"]
        UC12["📊 View Metrics Dashboard"]
        UC13["⚙️ Configure AI Models"]
    end

    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5
    S --> UC6
    S --> UC7
    S --> UC8
    S --> UC9
    S --> UC10

    A --> UC11
    A --> UC12
    A --> UC13

    UC2 --> UC3
    UC3 --> UC4
    UC3 --> UC10
```

---

## 3.5 Sequence Diagram: Full Learning Pipeline

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as FastAPI Gateway
    participant Redis as Redis Cache
    participant CP as Course Pipeline Agent
    participant Gemini as Google Gemini LLM
    participant YT as YouTube Data API
    participant Assess as Assessment Agent

    User->>FE: Enter "Machine Learning" + Click Generate
    FE->>API: POST /api/full-learning-pipeline {goal: "Machine Learning"}
    API->>Redis: GET cache:sha256("machine learning")
    Redis-->>API: MISS (null)

    Note over API,CP: Stage 1: Sequential Course Generation
    API->>CP: generate_full_learning("Machine Learning")
    CP->>Gemini: Prompt: "Generate course structure for Machine Learning..."
    Gemini-->>CP: Raw JSON Response
    CP->>CP: parse_json_response() + CourseSchema validation
    alt Validation Passes
        CP-->>CP: Course data ready
    else Validation Fails
        CP->>Gemini: Retry (attempt 2/3)
        Gemini-->>CP: Retried Response
    end

    Note over CP,Assess: Stage 2: Parallel Mock Test + Resources
    par Mock Test Generation
        CP->>Assess: generate_mock_test(goal, modules)
        Assess->>Gemini: Prompt: "Generate 5 MCQ questions for..."
        Gemini-->>Assess: Mock Test JSON
        Assess->>Assess: MockTestSchema validation
        Assess-->>CP: Validated mock test
    and Resource Attachment
        CP->>YT: search_learning_videos("Core Principles", max=1)
        YT-->>CP: [{title, url}]
        CP->>YT: search_learning_videos("Setting Up", max=1)
        YT-->>CP: [{title, url}]
        CP->>CP: Attach resources to topic objects
    end

    CP-->>API: {course, mock_test, warnings}
    API->>Redis: SET cache:sha256("machine learning") = response
    API-->>FE: {status: "success", data: {course, mock_test}, cached: false}
    FE->>FE: Render UnifiedLearningView
    FE-->>User: Display course + mock test + confidence score
```

---

## 3.6 Sequence Diagram: AI Mentor Chat

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as FastAPI Gateway
    participant Orch as Orchestrator
    participant Ollama as Ollama (qwen2.5:3b)
    participant Mem as Memory Agent
    participant Agent as Specialist Agent
    participant Eval as Evaluation Agent

    User->>FE: Type "Explain transformers in NLP"
    FE->>API: POST /api/ask {message, topic}
    API->>Orch: orchestrate(message, user_id)
    Orch->>Ollama: classify_intent("Explain transformers in NLP")
    Ollama-->>Orch: "learning"

    Orch->>Mem: recall_context(user_id)
    Mem-->>Orch: {past_topics: ["python", "ml basics"]}

    Orch->>Agent: LearningAgent.generate(prompt + context)
    Agent-->>Orch: Detailed explanation of transformers

    Orch->>Eval: evaluate(response_quality)
    Eval-->>Orch: {score: 0.92, suggestions: []}

    Orch-->>API: PipelineResult{intent, response, agents_used}
    API-->>FE: {response, intent: "learning", confidence: 0.92}
    FE-->>User: Display formatted AI response
```

---

## 3.7 LangGraph Workflow Diagram

```mermaid
flowchart TD
    START(("🟢 START")) --> ID["Intent Detection"]
    ID --> EA["Emotion Analysis"]
    EA --> P["Personalization"]
    P --> SG["Skill Graph Reasoning"]
    SG --> LR["Learning Resource Generation"]
    LR --> AS["Assessment Creation"]
    AS --> WC["Wellness Check"]
    WC --> SP["Schedule Planning"]
    SP --> RF["Reflection"]

    RF -->|"confidence ≥ 0.7"| M["Motivation"]
    RF -->|"confidence < 0.7"| SG

    M --> MU["Memory Update"]
    MU --> EX["Explainability"]
    EX --> STOP(("🔴 END"))

    style START fill:#10b981,stroke:#059669,color:white
    style STOP fill:#ef4444,stroke:#dc2626,color:white
    style RF fill:#f59e0b,stroke:#d97706,color:white
```

---

## 3.8 Component Interaction Explanation

### 3.8.1 Agent Communication Protocol

All agents in ZenLearn communicate through a **shared state dictionary** (`AgentState`), implemented as a Python `TypedDict` with 40+ typed fields. This pattern follows the **blackboard architecture** in multi-agent systems, where agents read from and write to a shared knowledge store.

Each agent function accepts an `AgentState` dictionary and returns a partial dictionary containing only the fields it modifies. LangGraph handles state merging automatically, ensuring that an agent's output does not inadvertently overwrite fields set by preceding agents.

**Example: Wellness Agent Interaction**

```
Input State (from Schedule Planning):
  - study_plan: {sessions: [...], total_hours: 8}
  - emotional_state: "stressed"
  - fatigue_level: 0.7

Wellness Agent Processing:
  1. Detects high fatigue (0.7 > threshold 0.5)
  2. Identifies "stressed" emotional state
  3. Generates wellness recommendations

Output State (merged back):
  - wellness_recommendations: [{type: "break", message: "Take 15 min rest"}]
  - burnout_risk: "high"
  - optimal_session_length: "25 min (Pomodoro)"
```

### 3.8.2 Error Propagation

Errors in individual agents do not terminate the pipeline. Each agent is wrapped in a try-catch block that:
1. Logs the error with full context (agent name, input state key values, exception trace).
2. Appends an error record to `state["errors"]`.
3. Passes the state forward to the next agent without the failed agent's modifications.

This design ensures that a failure in the Wellness Agent (e.g., LLM timeout during stress analysis) does not prevent the Motivation Agent from generating encouragement messages based on the data already available in the state.

---

## 3.9 Deployment Architecture

```mermaid
flowchart LR
    subgraph Docker["Docker Compose Network"]
        BE["FastAPI Backend :8000"]
        WK["Celery Worker"]
        RD["Redis :6379"]
        CH["ChromaDB :8001"]
        OL["Ollama Worker :11434"]
        LB["HAProxy Load Balancer"]
    end

    subgraph Cloud["Cloud Services"]
        NG["NeonDB PostgreSQL"]
        GE["Google Gemini API"]
        YT["YouTube Data API"]
    end

    subgraph Client["Client"]
        BR["Browser (React SPA)"]
    end

    BR -->|"HTTPS"| BE
    BE --> RD
    BE --> CH
    BE -->|"async"| WK
    WK --> RD
    BE --> LB
    LB --> OL
    BE --> NG
    BE --> GE
    BE --> YT
```

---

## 3.10 Section Summary

This chapter presented the complete architectural blueprint of ZenLearn through:
- **System Architecture Diagram** illustrating the four-tier design with 11 AI agents.
- **Use Case Diagram** mapping student and admin interactions.
- **Sequence Diagrams** tracing the full learning pipeline and mentor chat flows.
- **LangGraph Workflow Diagram** showing the 11-agent directed graph with conditional replanning.
- **Deployment Architecture** depicting the Docker Compose service topology.
- **Component interaction analysis** explaining the blackboard-pattern state sharing protocol and error propagation strategy.
