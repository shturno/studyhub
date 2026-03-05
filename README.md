# StudyHub

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![CI](https://github.com/shturno/studyhub/actions/workflows/ci.yml/badge.svg)](https://github.com/shturno/studyhub/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/shturno/studyhub/actions/workflows/e2e.yml/badge.svg)](https://github.com/shturno/studyhub/actions/workflows/e2e.yml)

A gamified study planner built for **concursos públicos** — Brazil's competitive public-sector exams. Helps candidates organize syllabuses, track study sessions, earn XP, and generate AI-powered study schedules.

Built with Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth v5, and next-intl.

## Features

- **Gamification** — XP system, levels, and achievements tied to real study time
- **Subject Management** — Hierarchical topics synced to your exam syllabuses
- **Study Planner** — Drag-and-drop calendar to schedule and track sessions
- **Dashboard** — Weekly stats, streaks, and next-topic recommendations
- **AI Syllabus Parser** — Upload exam PDFs; Gemini extracts topics automatically
- **AI Schedule Generator** — Generates a prioritized weekly schedule based on your coverage gaps
- **The Alchemist** — Identifies overlapping topics across multiple exams
- **Pomodoro Timer** — Focus sessions that award XP on completion
- **Multi-language** — Portuguese (default), English, Spanish

## Tech Stack

| Layer                    | Tech                                                        |
| ------------------------ | ----------------------------------------------------------- |
| **Frontend**             | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend**              | Next.js Server Actions, Node.js                             |
| **Database**             | PostgreSQL + Prisma ORM                                     |
| **Auth**                 | NextAuth v5 (beta)                                          |
| **Internationalization** | next-intl                                                   |
| **AI**                   | Google Generative AI (Gemini 1.5 Flash)                     |
| **State**                | Zustand, TanStack React Query                               |
| **Testing**              | Vitest (unit/integration), Playwright (E2E)                 |
| **Containerization**     | Docker, Docker Compose                                      |
| **CI/CD**                | GitHub Actions                                              |

---

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (or npm/yarn)
- **PostgreSQL** ≥ 14
- **Docker** & **Docker Compose** (optional, for containerized setup)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shturno/studyhub.git
   cd studyhub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run database migrations**

   ```bash
   pnpm db:migrate
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

---

## Environment Variables

| Variable          | Description                  | Example                                     |
| ----------------- | ---------------------------- | ------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@localhost/studyhub` |
| `NEXTAUTH_SECRET` | JWT secret for NextAuth      | Generated with `openssl rand -base64 32`    |
| `NEXTAUTH_URL`    | App base URL (production)    | `https://studyhub.example.com`              |
| `GEMINI_API_KEY`  | Google Generative AI API key | From Google Cloud Console                   |

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Testing

### Run All Tests

```bash
pnpm test
```

### Unit & Integration Tests

```bash
pnpm test:unit
pnpm test:integration
```

### E2E Tests (Browser)

```bash
pnpm test:e2e
```

### Watch Mode (Development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm coverage
```

---

## Docker

### Using Docker Compose

**Development** (database only):

```bash
docker compose -f docker-compose.dev.yml up
pnpm dev
```

**Production**:

```bash
docker compose up
```

The app will be available at `http://localhost:3000`

---

## Available Scripts

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm dev`              | Start dev server (port 3000) |
| `pnpm build`            | Production build             |
| `pnpm start`            | Start production server      |
| `pnpm lint`             | Run ESLint                   |
| `pnpm format`           | Format code with Prettier    |
| `pnpm test`             | Run all tests                |
| `pnpm test:unit`        | Unit tests only              |
| `pnpm test:integration` | Integration tests only       |
| `pnpm test:e2e`         | E2E tests with Playwright    |
| `pnpm test:watch`       | Watch mode for tests         |
| `pnpm coverage`         | Coverage report              |
| `pnpm db:migrate`       | Run Prisma migrations        |
| `pnpm db:seed`          | Seed database                |
| `pnpm db:studio`        | Open Prisma Studio GUI       |

---

## Project Structure

```
src/
├── app/
│   └── [locale]/              # i18n routing (pt, en, es)
│       ├── (authenticated)/   # Protected routes
│       ├── login/
│       ├── register/
│       └── page.tsx           # Public landing
├── features/                  # Feature-based modules
│   ├── ai/                    # PDF parsing with Gemini
│   ├── auth/                  # Authentication
│   ├── contests/              # Exam/contest management
│   ├── dashboard/             # Analytics
│   ├── gamification/          # XP/levels (xpCalculator.ts)
│   ├── planner/               # Study calendar
│   ├── subjects/              # Topics management
│   ├── timer/                 # Pomodoro timer
│   └── ...
├── lib/                       # Shared utilities
│   ├── auth.ts                # NextAuth setup
│   ├── prisma.ts              # Prisma singleton
│   ├── schemas.ts             # Zod validation schemas
│   └── ...
├── components/                # Shared UI components
│   └── ui/                    # shadcn/ui components
└── middleware.ts              # NextAuth + i18n middleware
messages/                      # i18n translations (pt, en, es)
prisma/                        # Database schema & migrations
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Running tests locally
- Submitting pull requests
- Code style and conventions

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:
- You can freely use, study, modify, and distribute this software
- If you run a **modified version as a network service** (e.g. a hosted SaaS), you must release your modifications under AGPL-3.0
- You **cannot** take this code, build a competing product, and keep your changes proprietary

See [LICENSE](LICENSE) for the full terms. For commercial licensing inquiries, open an issue.

---

## Known Limitations

- **NextAuth v5 Beta**: Uses NextAuth v5.0.0-beta.30. Expect potential API changes before the stable release.

---

## Resources

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [next-intl Docs](https://next-intl-docs.vercel.app)
