# StudyHub 🚀

A gamified study planner for competitive exam preparation ("concursos públicos"). Built with Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth v5, and next-intl.

**English** · [Português](#português)

## ✨ Features

- 🎮 **Gamification** — XP system, levels, achievements, and progress tracking
- 📚 **Subject Management** — Hierarchical topics with study sessions
- 🔄 **Study Cycles** — Plan and track study sessions on a calendar
- 📊 **Dashboard** — Real-time analytics and performance insights
- 🌍 **Multi-language** — Portuguese (default), English, Spanish
- 🤖 **AI PDF Parser** — Auto-extract syllabus from exam PDFs using Google Gemini
- ⏱️ **Pomodoro Timer** — Focused study sessions with XP rewards
- 🔐 **Authentication** — Secure login/register with NextAuth v5
- 📱 **Responsive Design** — Mobile-first UI with Tailwind CSS
- 🔀 **The Alchemist** — Find overlapping topics across multiple exams

## 🛠 Tech Stack

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

## 🚀 Getting Started

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

## 🌍 Environment Variables

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

## 🧪 Testing

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

## 🐳 Docker

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

## 📦 Available Scripts

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

## 📂 Project Structure

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

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Running tests locally
- Submitting pull requests
- Code style and conventions

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## ⚠️ Known Limitations

- **NextAuth v5 Beta**: This project uses NextAuth v5.0.0-beta.30, which is pre-release. Expect potential API changes before v5.0.0 stable.
- **Tests in Progress**: Tests are setup in this repository but require implementation for existing features. New features follow TDD practices.

---

## 🔗 Resources

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [next-intl Docs](https://next-intl-docs.vercel.app)
