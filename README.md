# StudyHub 🚀

> **A Focus-First Study Management Platform for Neurodivergent Minds.**

StudyHub is a modern, gamified study planner designed specifically for users with ADHD. It combines radical minimalism with powerful gamification to reduce cognitive load and dopamine-driven engagement. Instead of selling courses, it helps you master your own study routine.

## ✨ Key Philosophy

- **Radical Minimalism**: Interface designed to prevent overwhelm. Constant feedback loops (toasts, sounds) without visual clutter.
- **Gamification**: XP points, levels, streaks, and confetti rewards for every completed session.
- **Physical Interaction**: Satisfying Drag & Drop study planner that feels tactile.
- **Adaptive Timer**: Breathing animations and dynamic gradients to help maintain flow state.

## 🛠️ Tech Stack

Built with the **Bleeding Edge** React ecosystem:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (v5 Beta)
- **State**: [Zustand](https://github.com/pmndrs/zustand) (Client) + Server Actions (Mutations)
- **Animation**: `framer-motion`, `canvas-confetti`, `tailwindcss-animate`
- **Validation**: [Zod](https://zod.dev/)

## 📂 Project Architecture

We follow a strictly **Feature-Based Architecture**. Code is organized by **Domain**, not by technical role.

```bash
src/
├── app/                  # Next.js App Router (Routes & Layouts ONLY)
│   ├── (authenticated)/  # Protected Routes (Dashboard, Planner, etc.)
│   └── login/            # Public Routes
├── features/             # Business Logic (The Core)
│   ├── dashboard/        # Stats, Recent Activity, Greeting Logic
│   ├── study-cycle/      # Planner, Lessons, Tracks
│   ├── timer/            # Pomodoro logic, Session Persistence
│   ├── gamification/     # XP, Levels, Achievements
│   └── auth/             # Login Forms, Session Management
├── components/           # Shared UI Kit (Buttons, Cards, Inputs)
├── lib/                  # Global Singletons (Prisma, Auth, Utils)
└── hooks/                # Global Hooks (useToast, etc.)
```

### Why this structure?
- **Scalability**: New features don't clutter global folders.
- **Co-location**: A feature's hook, component, and server action live together.
- **Maintainability**: Deleting a feature is as simple as deleting one folder.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shturno/studyhub.git
   cd studyhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/studyhub"
   AUTH_SECRET="your-secret-key-openssl-rand-base64-32"
   ```

4. **Database Setup**
   Push the schema to your database:
   ```bash
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## ⚡ Key Features Implementation

### The Planner (Drag & Drop)
Uses `@dnd-kit` for a physics-based interaction.
- **Optimistic UI**: Moving a card updates the interface immediately.
- **Persistence**: Drops trigger Server Actions to sync with PostgreSQL effortlessly.

### The Timer (Focus Mode)
- **Breathing Effect**: A Tailwind animation mimics a 4-7-8 breathing rhythm.
- **Confetti**: `canvas-confetti` triggers on server response success.
- **No IDORs**: All actions derive `userId` securely from the server session.

## 🛡️ Security

- **IDOR Prevention**: Server Actions never trust client `userId`.
- **Rate Limiting**: Middleware protects auth routes (10 req/min).
- **Security Headers**: HSTS, X-Frame-Options configured in Middleware.
- **Input Validation**: Critical mutations validated with Zod schemas.

---

By Kai.
