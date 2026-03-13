# Contributing to StudyHub

Thank you for your interest in contributing to StudyHub! This document provides guidelines for getting involved with the project.

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/shturno/studyhub.git
cd studyhub
```

### 2. Setup Development Environment

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Setup your database (PostgreSQL required)
# Update DATABASE_URL in .env.local, then run:
pnpm db:migrate
```

### 3. Start Development Server

```bash
pnpm dev
```

App will be available at `http://localhost:3000`

---

## 📋 Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:

- `feature/add-leaderboard` ✅
- `fix/auth-session-timeout` ✅
- `docs/update-readme` ✅
- `refactor/simplify-xp-calculator` ✅

### Making Changes

1. **Write code following existing patterns** in the codebase
2. **Format code** before committing:

   ```bash
   pnpm format
   ```

3. **Run linting** to catch errors:

   ```bash
   pnpm lint
   ```

4. **Type-check** your changes:
   ```bash
   pnpm tsc --noEmit
   ```

### Testing

For new features, write tests following TDD patterns:

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Watch mode (during development)
pnpm test:watch

# Coverage report
pnpm coverage
```

---

## 📝 Commit Messages

Follow conventional commits for clear, meaningful history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that don't affect code meaning (formatting, semicolons)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Code change that improves performance
- `test:` Adding missing tests or fixing tests
- `chore:` Build process, dependencies, tooling

### Examples

```
feat: add achievement system for milestone levels
```

```
fix: correct XP calculation for extended sessions
```

---

## 🧪 Testing Guidelines

For new features, write tests. See examples in:

- `src/features/gamification/utils/__tests__/` (unit tests)
- `src/features/contests/__tests__/` (integration tests)
- `e2e/auth.spec.ts` (E2E tests)

---

## 🐳 Docker Development

If using Docker for development:

```bash
# Start PostgreSQL container only
docker compose -f docker-compose.dev.yml up

# In another terminal
pnpm dev
```

Or full stack with containerized app:

```bash
docker compose up
```

---

## 🔀 Submitting a Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a PR on GitHub**
   - Use a clear, descriptive title
   - Reference any related issues (#123)
   - Describe what changed and why

3. **PR Checklist**
   - [ ] Code follows project style guidelines
   - [ ] `pnpm lint` passes
   - [ ] `pnpm tsc --noEmit` has no errors
   - [ ] Tests written for new features
   - [ ] `pnpm test` passes locally
   - [ ] Updated relevant documentation

4. **Wait for review**
   - At least one approval required
   - Address feedback and push updates

---

## 📐 Code Style

### TypeScript

- Use **strict mode** (enforced by `tsconfig.json`)
- Prefer `const` over `let`
- Type function parameters and return types explicitly
- No `any` unless absolutely necessary

### React/Components

- Use **functional components** with hooks
- Keep components focused and single-purpose
- Use TypeScript for prop types
- Prefer composition over complex conditional rendering

### Database (Prisma)

- Keep models in `prisma/schema.prisma`
- Document relationships clearly
- Use meaningful field names
- Create migrations for schema changes: `pnpm db:migrate`

### Server Actions

- Always validate input with Zod (from `src/lib/schemas.ts`)
- Re-authenticate with `auth()` at the start
- Validate userId against the database
- Return consistent response objects

---

## 🐛 Issues & Questions

- **Bugs:** Include steps to reproduce and environment info
- **Features:** Explain the use case and propose a solution
- **Questions:** Check existing issues first, then open a discussion

Thank you for contributing! 🙏
