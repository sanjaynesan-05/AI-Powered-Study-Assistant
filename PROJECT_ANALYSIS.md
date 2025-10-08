# 🔍 AI-Powered Study Assistant - Comprehensive Project Analysis

**Project Name**: AI-Powered Study Assistant
**Repository**: AI-Powered-Study-Assistant
**Owner**: sanjaynesan-05
**Branch**: agents
**Analysis Date**: October 8, 2025

---

## 📊 Executive Summary

The AI-Powered Study Assistant is a sophisticated, full-stack educational platform that leverages artificial intelligence to provide personalized learning experiences. It combines modern web technologies with advanced AI capabilities to create an intelligent mentoring system for students and professionals.

### 🎯 Core Objectives

* **Personalized Learning**: AI-driven adaptive learning paths tailored to individual needs
* **Intelligent Mentoring**: Real-time AI assistance for academic and career guidance
* **Resume Optimization**: AI-powered resume analysis and enhancement
* **Progress Tracking**: Comprehensive learning analytics and progress monitoring
* **Multi-Modal Learning**: Support for videos, articles, assessments, and interactive content

---

## 🏗️ System Architecture Overview

### High-Level Architecture Diagram

```mermaid
flowchart LR
  %% =============== STYLES ===============
  classDef ui fill:#d6eaff,stroke:#0056b3,stroke-width:2px,rx:8,ry:8,color:#000000,font-weight:bold
  classDef core fill:#d1f7f5,stroke:#00796b,stroke-width:2px,rx:10,ry:10,color:#000000,font-weight:bold
  classDef agent fill:#ffe5b4,stroke:#cc7000,stroke-width:2px,rx:10,ry:10,color:#000000,font-weight:bold
  classDef store fill:#ffd6e0,stroke:#b30059,stroke-width:2px,rx:8,ry:8,color:#000000,font-weight:bold
  classDef api fill:#e5d6ff,stroke:#5a00b3,stroke-width:2px,rx:8,ry:8,color:#000000,font-weight:bold

  %% =============== USER TO BACKEND ===============
  U([User]):::ui --> FE[Frontend\nReact + MUI]:::ui
  FE --> GW[Backend\nFastAPI Gateway]:::core
  GW --> ORC[Hybrid Orchestrator\nLangGraph]:::core

  %% =============== AGENTS ===============
  ORC --> L[Learning Agent]:::agent
  ORC --> SCH[Schedule Agent]:::agent
  ORC --> W[Wellness Agent]:::agent
  ORC --> T[Assessment Agent - Gemini]:::agent
  ORC --> P[Personalization Agent]:::agent
  ORC --> M[Motivation Agent - Gemini]:::agent

  %% =============== DATA SOURCES & APIs ===============
  P --> FB[(Firebase\nUser Prefs)]:::store
  P --> BQ[(BigQuery\nAnalytics)]:::store
  L --> RS[(Resources)]:::store
  SCH --> GWS[(Google Workspace\nCalendar / Fit)]:::api
  W --> Hume[(Hume AI\nEmotion Signals)]:::api
  T --> GeminiAssess[(Gemini API\nQuiz / Assessments)]:::api
  M --> GeminiMotiv[(Gemini API\nMotivation / NLG)]:::api

  %% =============== RESPONSE MERGE ===============
  L --> ST[(Shared State)]:::core
  SCH --> ST
  W --> ST
  T --> ST
  P --> ST
  M --> ST
  ST --> CMP[Composer\nMerge Plan + Output]:::core
  CMP --> FE
  FE --> U
```

---

## 🔄 Data Flow Architecture

### 1. User Interaction Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend (React + MUI)
    participant BE as Backend (FastAPI)
    participant ORC as Orchestrator (LangGraph)
    participant L as Learning Agent
    participant SCH as Schedule Agent
    participant W as Wellness Agent
    participant T as Assessment Agent - Gemini
    participant P as Personalization Agent
    participant M as Motivation Agent - Gemini
    participant S as Data/APIs
    participant CMP as Composer

    U->>FE: Request (e.g., "Help me study ML")
    FE->>BE: API call
    BE->>ORC: Dispatch task

    par Agent Coordination
        ORC->>P: Personalization check
        ORC->>L: Retrieve learning resources
        ORC->>SCH: Build study plan
        ORC->>W: Check wellness signals
        ORC->>T: Generate quizzes (Gemini)
        ORC->>M: Craft motivation (Gemini)
    end

    P->>S: Firebase / BigQuery
    L->>S: LangGraph State Memory
    SCH->>S: Google Workspace (Calendar / Fit)
    W->>S: Hume AI (emotion)
    T->>S: Gemini (assessments)
    M->>S: Gemini (motivation)

    S-->>L: Data
    S-->>SCH: Data
    S-->>W: Data
    S-->>T: Data
    S-->>P: Data
    S-->>M: Data

    L-->>ORC: Resources
    SCH-->>ORC: Plan + breaks
    W-->>ORC: Wellness score
    T-->>ORC: Quiz items + rubric
    P-->>ORC: Persona + pacing
    M-->>ORC: Motivation text

    ORC->>CMP: Merge outputs
    CMP-->>BE: Final response
    BE-->>FE: Return results
    FE-->>U: Display personalized plan
```
