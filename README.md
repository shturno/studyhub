# StudyHub 🚀

> **A Focus-First Study Management Platform for Neurodivergent Minds.**

StudyHub is a modern, gamified study planner and content analyzer designed specifically for high-level students and users with ADHD. It combines radical minimalism, AI-powered document parsing, and powerful gamification to reduce cognitive load and maximize focus. Instead of selling courses, it helps you master your own study routine and strategically plan your syllabus.

⚠️ **Note: This is a proprietary, closed-source application. Unauthorized distribution or copying of this repository is prohibited.**

## ✨ Key Capabilities

### 1. The Alchemist (Content Crossing)
A strategic engine that analyzes multiple "Editais" (Exam Syllabuses) simultaneously. It identifies intersections, overlapping topics, and redundancies, allowing users to study once for multiple exams and highlighting high-yield subjects.

### 2. AI Edital Parser (Scanner IA)
Powered by **Google Gemini 1.5 Flash**, the platform allows users to upload raw PDF syllabuses. The AI automatically digests hundreds of pages to extract a clean, structured JSON of all Subjects and Topics, instantly building the user's study database without any manual data entry.

### 3. Radical Minimalism & Gamification
- **Visual Clarity:** A retro-arcade, high-contrast, cyberpunk aesthetic designed to prevent overwhelm.
- **Reward Systems:** XP points, levels, and dynamic feedback (like confetti and pixel-art elements) for every completed session.
- **Adaptive Timer:** Flow-state timers with built-in mechanics designed specifically for neurodivergent focus retention.

## 🛠️ Tech Stack & Architecture

Built with a **Bleeding Edge** React ecosystem:

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Arcade/Cyberpunk theming
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (v5)
- **AI Integration**: `@google/generative-ai` (Gemini API for document intelligence)
- **Validation**: [Zod](https://zod.dev/)

### Feature-Based Architecture
The codebase is structured around features (Domain-Driven) rather than technical roles:

```bash
src/
├── app/                  # Next.js App Router (Routes & Core Layouts)
├── features/             # Business Logic Domains
│   ├── ai/               # AI Services (Gemini Parser)
│   ├── auth/             # Session Management
│   ├── contests/         # Exams and Fusion Mechanics
│   ├── dashboard/        # Stats and Analytics
│   ├── editorials/       # Document Management & The Alchemist
│   ├── gamification/     # XP, Levels Formula
│   ├── planner/          # Calendar and Scheduling
│   ├── settings/         # Profile and Preferences
│   ├── study-cycle/      # Cycles and Tracks
│   ├── subjects/         # Syllabuses Content
│   └── timer/            # Pomodoro and Focus logic
└── components/           # Shared UI elements
```

## 🛡️ Security

- **AI Sandbox**: Document parsing happens purely in-memory via buffers to prevent filesystem vulnerabilities.
- **IDOR Prevention**: Server Actions inherently validate the session's `userId` against database records across all mutations.
- **Strict Typing**: Full end-to-end type safety from the Prisma Schema up to the UI Components.

---

Proprietary Software. Internal Use Only.
