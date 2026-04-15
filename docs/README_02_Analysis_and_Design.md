# Chapter 2: System Analysis and Design

---

## 2.1 Overview

This chapter presents the formal requirements analysis, system constraints, and data flow design for the ZenLearn platform. The analysis follows the IEEE 830 Software Requirements Specification (SRS) methodology, distinguishing between functional requirements (what the system must do) and non-functional requirements (how well it must perform). The requirements were derived from a combination of pedagogical research, user persona analysis, and technical feasibility assessment.

---

## 2.2 Functional Requirements

### 2.2.1 Core Functional Requirements Table

| FR-ID | Requirement | Description | Priority | Module |
|---|---|---|---|---|
| FR-01 | User Registration | Users shall register via Google OAuth 2.0. The system shall create a user record in PostgreSQL with a hashed identifier. | High | Authentication |
| FR-02 | User Login | Authenticated users shall receive a JWT token (HS256, 30-day expiry) enabling subsequent API access. | High | Authentication |
| FR-03 | Goal Input | Users shall input a learning goal as free-text (e.g., "Learn Full Stack Development") via the frontend form. | High | UI / API |
| FR-04 | Course Generation | The system shall generate a structured JSON course containing ≥2 modules, each with ≥2 topics, each with subtopics, based on the user's goal. | Critical | Course Pipeline |
| FR-05 | Mock Test Generation | The system shall generate a 5-question MCQ test derived from the generated course content, with 4 options per question, a correct answer, an explanation, and a difficulty tag. | Critical | Assessment Agent |
| FR-06 | Resource Attachment | The system shall attach YouTube video URLs and/or article links to the top 3 course topics using the YouTube Data API v3. | High | Resource Agent |
| FR-07 | AI Mentor Chat | Users shall interact with a conversational AI mentor that classifies intent (learning/coding/mentor/motivation/reasoning/chat) and routes to specialized agents. | High | Orchestrator |
| FR-08 | Personality Selection | Users shall select an AI personality mode (Mentor, Coach, Chill) that modifies the tone of generated content. | Medium | UI / Orchestrator |
| FR-09 | Progress Tracking | The system shall track topic-level completion status (completed/in-progress/pending) per learning path, persisted in localStorage. | Medium | UI State |
| FR-10 | XP and Leveling | Users shall earn 50 XP per course generation, with level progression (Level = floor(XP / 250) + 1). | Medium | Gamification |
| FR-11 | Deep Recall Quiz | After course generation, the system shall prompt a mini recall question derived from the generated content to reinforce retention. | Low | Engagement Loop |
| FR-12 | Export Functionality | Users shall be able to copy course content and download course JSON. | Low | UI |
| FR-13 | Resume Builder | Users shall generate AI-powered resumes with customizable sections and PDF export. | Medium | Resume Module |
| FR-14 | Adaptive Assessment | Users shall take standalone mock tests on any topic with configurable question counts (5, 10, 15). | High | Mock Test Page |
| FR-15 | Wellness Monitoring | The system shall assess learner fatigue/stress and recommend session adjustments. | Medium | Wellness Agent |

### 2.2.2 Detailed Functional Requirement Descriptions

#### FR-04: Course Generation (Critical)

**Input:** A natural language string representing the user's learning goal (e.g., "Machine Learning for Beginners").

**Processing:** The Course Pipeline Agent constructs a structured prompt with explicit JSON schema instructions and sends it to the Google Gemini 2.0 Flash model. The response is parsed using a custom JSON extraction function that handles markdown code fences and extraneous text. The parsed output is validated against the `CourseSchema` Pydantic model, which enforces:
- `course_name`: non-empty string
- `difficulty`: one of Beginner/Intermediate/Advanced
- `estimated_duration`: non-empty string
- `modules`: list with minimum length 2, each containing `module_title`, `description`, and `topics`
- Each `topic`: `topic_name`, `difficulty`, `subtopics` (list of strings, min length 1)

**Retry Logic:** If validation fails (e.g., the LLM returns <2 modules or empty topic lists), the system retries up to 3 times with the identical prompt. If all retries fail, a deterministic fallback course structure is returned containing generic module titles.

**Output:** A validated JSON object conforming to `CourseSchema`.

#### FR-05: Mock Test Generation (Critical)

**Input:** The learning goal string and the list of module titles from the generated course.

**Processing:** The Assessment Agent constructs a prompt that explicitly references the course modules, ensuring assessment-content alignment. The prompt specifies exactly 5 questions, 4 options each, with correct answers and explanations. The response is validated against `MockTestSchema`.

**Parallelism:** Mock test generation executes **in parallel** with resource attachment (FR-06) using `asyncio.gather()`, reducing total pipeline latency by 30–40%.

**Output:** A validated JSON object conforming to `MockTestSchema`.

---

## 2.3 Non-Functional Requirements

### 2.3.1 Performance Requirements

| NFR-ID | Requirement | Target | Measurement Method |
|---|---|---|---|
| NFR-01 | Pipeline Response Time | ≤20 seconds for full course + mock test + resources | Server-side `time.time()` instrumentation |
| NFR-02 | Cached Response Time | ≤500ms for previously generated goals | Redis GET latency measurement |
| NFR-03 | Intent Classification Latency | ≤2 seconds for qwen2.5:3b routing | Ollama inference timer |
| NFR-04 | Frontend Time to Interactive | ≤3 seconds on 4G connection | Lighthouse Performance Score |
| NFR-05 | Concurrent User Support | ≥50 simultaneous users | Uvicorn worker pool capacity |

### 2.3.2 Scalability Requirements

| NFR-ID | Requirement | Description |
|---|---|---|
| NFR-06 | Horizontal Scaling | The FastAPI backend shall support horizontal scaling through Docker container replication behind a load balancer. |
| NFR-07 | Ollama Mesh Architecture | The system shall support multiple Ollama inference nodes behind an HAProxy load balancer for distributed LLM inference. |
| NFR-08 | Stateless API Design | All API endpoints shall be stateless (no server-side session storage), enabling request routing to any backend instance. |

### 2.3.3 Security Requirements

| NFR-ID | Requirement | Description |
|---|---|---|
| NFR-09 | Authentication | All protected API endpoints shall require a valid JWT token in the Authorization header. |
| NFR-10 | Token Security | JWT tokens shall use HS256 signing with a server-side secret key. Token expiry shall not exceed 30 days. |
| NFR-11 | CORS Policy | The backend shall enforce an allowlist-based CORS policy, permitting requests only from configured frontend origins. |
| NFR-12 | Input Sanitization | All user inputs (learning goals, chat messages) shall be sanitized before inclusion in LLM prompts to prevent prompt injection. |
| NFR-13 | API Key Protection | All API keys (Google AI, YouTube, JWT Secrets) shall be stored in environment variables, never in source code. |

### 2.3.4 Reliability Requirements

| NFR-ID | Requirement | Description |
|---|---|---|
| NFR-14 | Zero-Crash Guarantee | The backend shall not crash on any user input. All exceptions shall be caught and returned as structured error responses. |
| NFR-15 | Graceful Degradation | If the LLM provider fails after all retries, the system shall return a deterministic fallback response rather than an empty result. |
| NFR-16 | Timeout Protection | The full pipeline shall be wrapped in a 20-second `asyncio.wait_for()` timeout. Partial data generated before timeout shall be preserved. |

---

## 2.4 System Constraints

### 2.4.1 Technical Constraints

| Constraint | Description | Mitigation |
|---|---|---|
| LLM Output Non-Determinism | LLMs do not guarantee structurally valid JSON output. | Pydantic validation + 3-retry loop + fallback responses |
| YouTube API Quota | YouTube Data API v3 imposes a daily quota of 10,000 units. Each search costs 100 units. | Limit to top 3 topics; cache results in Redis |
| Ollama Hardware Dependency | Local Ollama inference requires a GPU-equipped machine. | Automatic Gemini cloud fallback when Ollama is unavailable |
| Redis Volatility | Redis is an in-memory store; data is lost on restart. | Critical data persisted in PostgreSQL; Redis used only for caching |
| Browser Storage Limits | localStorage is limited to ~5MB per origin. | Only lightweight state (XP, paths metadata) stored client-side |

### 2.4.2 Operational Constraints

- The system requires an active internet connection for Google Gemini API calls and YouTube Data API access.
- PostgreSQL (NeonDB) must be provisioned with valid connection credentials.
- The frontend development server (Vite) requires Node.js ≥18 and npm ≥9.
- The backend requires Python ≥3.10 with asyncio support.

---

## 2.5 Assumptions

| # | Assumption | Justification |
|---|---|---|
| A1 | Users have a stable internet connection (≥1 Mbps). | Required for API calls to Google Gemini and YouTube. |
| A2 | Users interact with the system through a modern web browser (Chrome 90+, Firefox 90+, Edge 90+). | The frontend uses ES2020+ JavaScript features and CSS Grid/Flexbox. |
| A3 | Learning goals are expressed in English. | The LLM prompts and system instructions are authored in English. |
| A4 | The Google Gemini API key has sufficient quota for development and demo usage. | Free-tier Gemini keys support up to 15 requests/minute. |
| A5 | Users authenticate via Google accounts. | Google OAuth 2.0 is the exclusive authentication mechanism. |

---

## 2.6 Data Flow Explanation

### 2.6.1 Primary Pipeline Data Flow

The core learning pipeline follows a strictly defined data flow:

**Stage 1: User Input Capture**  
The user enters a learning goal (e.g., "Full Stack Development") in the frontend form. The React component captures this input and optionally injects a personality modifier based on the selected AI mode (Mentor/Coach/Chill). The combined string is transmitted to the backend via an HTTP POST request to `/api/full-learning-pipeline`.

**Stage 2: Cache Check**  
The backend computes a SHA-256 hash of the normalized goal string and queries Redis for a cached response. If found, the cached JSON is returned immediately with `cached: true`, bypassing all LLM inference. This reduces response time from ~15 seconds to <500ms for repeated goals.

**Stage 3: Course Generation (Sequential)**  
If no cache hit, the Course Pipeline Agent constructs a structured prompt and invokes Google Gemini 2.0 Flash. The raw text response is parsed to extract JSON (handling markdown code fences, truncated outputs, and extraneous text). The extracted JSON is validated against `CourseSchema`. On validation failure, the process retries (up to 3 attempts). On total failure, a deterministic fallback course is substituted.

**Stage 4: Parallel Execution (Mock Test + Resources)**  
After course generation succeeds, two tasks execute concurrently via `asyncio.gather()`:
- **Mock Test Generation:** The Assessment Agent receives the goal and module titles, generates a 5-question MCQ test, and validates against `MockTestSchema`.
- **Resource Attachment:** The Resource Agent queries YouTube Data API v3 for the top 3 course topics, attaching video URLs to the corresponding topic objects. Remaining topics receive fallback article links (FreeCodeCamp search URLs).

**Stage 5: Response Assembly**  
The pipeline assembles a unified response object:
```json
{
  "status": "success",
  "data": {
    "course": { ... },
    "mock_test": { ... }
  },
  "cached": false,
  "warning": "",
  "meta": {
    "generation_time": "12.4s",
    "retry_count": 0
  }
}
```
This response is cached in Redis (keyed by SHA-256 hash) and returned to the frontend.

**Stage 6: Frontend Rendering**  
The `UnifiedLearningView` component receives the pipeline response and renders the course (expandable modules with checkbox-based completion tracking), mock test (interactive MCQ interface with scoring), confidence indicators, and engagement triggers (Deep Recall quiz).

### 2.6.2 AI Mentor Chat Data Flow

The conversational mentor follows a distinct pipeline:

1. User types a message in the chat interface.
2. The frontend service constructs a system instruction incorporating the selected domain context.
3. The message is sent to the backend `/api/ask` endpoint.
4. The Orchestrator Agent classifies intent using the local Ollama model (qwen2.5:3b).
5. Based on classified intent, the orchestrator routes to specialized agents:
   - `learning` → Memory Agent → Learning Agent → Evaluation Agent
   - `coding` → Memory Agent → Coding Agent → Evaluation Agent
   - `mentor` → Memory Agent → Mentor Agent
   - `motivation` → Memory Agent → Mentor Agent
   - `reasoning` → Memory Agent → Learning Agent
   - `chat` → Learning Agent (lightweight)
6. Agent outputs are aggregated into a structured `PipelineResult`.
7. The result is returned to the frontend and displayed in the chat interface.

### 2.6.3 LangGraph State Machine Data Flow

The full 11-agent LangGraph workflow operates as a stateful directed graph:

1. **Intent Detection** → Classifies user intent from input text.
2. **Emotion Analysis** → Detects emotional tone (stress, enthusiasm, confusion).
3. **Personalization** → Adjusts difficulty and style based on learner profile.
4. **Skill Graph Reasoning** → Identifies skill dependencies, gaps, and optimal learning sequences.
5. **Learning Resource Generation** → Produces curated content for identified skill gaps.
6. **Assessment Creation** → Generates quizzes targeting generated content.
7. **Wellness Check** → Evaluates fatigue and burnout risk.
8. **Schedule Planning** → Proposes optimal study times and session lengths.
9. **Reflection** → Evaluates the quality of the generated plan; may trigger **replanning** (conditional edge back to Skill Graph).
10. **Motivation** → Generates milestone celebrations and encouragement.
11. **Memory Update** → Persists interaction context to long-term storage.
12. **Explainability** → Generates human-readable reasoning chains for all decisions.

---

## 2.7 User Persona Analysis

### Persona 1: Priya — The Career Switcher
- **Age:** 24 | **Background:** B.Com graduate | **Goal:** Transition to software development
- **Needs:** Structured roadmap, beginner-friendly content, career-aligned resource curation
- **Pain Points:** Overwhelmed by the volume of free content; doesn't know what to learn first

### Persona 2: Arjun — The Competitive Exam Preparer
- **Age:** 21 | **Background:** B.Tech CSE, 3rd year | **Goal:** Crack GATE exam
- **Needs:** Adaptive mock tests, performance analytics, targeted revision of weak areas
- **Pain Points:** Generic test banks that don't adapt to his specific knowledge gaps

### Persona 3: Meera — The Self-Directed Lifelong Learner
- **Age:** 35 | **Background:** Working professional | **Goal:** Learn AI/ML without formal enrollment
- **Needs:** Time-aware scheduling, burnout prevention, curated resources (not 100-hour courses)
- **Pain Points:** Limited study time; needs efficient, high-density learning sessions

---

## 2.8 Section Summary

This chapter established the formal requirements foundation for ZenLearn:
- **15 functional requirements** covering authentication, course generation, assessment, mentoring, gamification, and export.
- **16 non-functional requirements** addressing performance, scalability, security, and reliability.
- **5 system constraints** with explicit mitigation strategies.
- **Comprehensive data flow analysis** covering the learning pipeline, mentor chat, and full LangGraph workflow.
- **3 user personas** grounding the requirements in real-world usage scenarios.
