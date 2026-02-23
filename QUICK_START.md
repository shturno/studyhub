# StudyHub Quick Start Guide

## Getting Started in 5 Minutes

### 1. Setup Environment Variables
Add to your `.env.local`:
```env
GOOGLE_API_KEY=your_google_ai_key_here
```
Get your key: https://aistudio.google.com/app/apikey

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Migrations
```bash
npx prisma migrate dev --name add-editorial-system
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000

---

## Using the New Features

### Feature 1: Create & Manage Editorials

**Step 1:** Go to "Meus Concursos" → Click on a contest → "Detalhes"

**Step 2:** In the Editorial Manager section, click "Adicionar Edital"

**Step 3:** Fill in:
- **Título do Edital** (required) - e.g., "Edital Banco do Brasil 2026"
- **Descrição** - Key topics from the edital
- **Link do Edital** - URL to the official edital

**Step 4:** Click "Adicionar Edital"

### Feature 2: Map Content to Topics

**Step 1:** After adding editorials, click "Detalhes" on the contest

**Step 2:** In the "Análise de Conteúdo" section, you'll see:
- Coverage percentage of your topics
- High-priority topics (appearing in multiple editorials)
- Content gaps (topics not in any edital)

**Tip:** The system automatically analyzes which topics appear in multiple editorials and marks them as high priority.

### Feature 3: Generate AI Schedule

**Step 1:** Go to "Planner"

**Step 2:** Click the blue "IA Cronograma" button

**Step 3:** Select:
- **Data da Prova** - When is your exam?
- **Horas por semana** - How many hours can you study weekly? (default: 40)

**Step 4:** Click "Gerar Cronograma"

**Step 5:** Review the generated schedule:
- Total study hours needed
- Weekly breakdown
- Key milestones
- Study tips

**Step 6:** Click "Importar para Planner" to add sessions to your planner

---

## Understanding Content Crossing

When you add multiple editorials:

1. **Topics appearing in multiple editorials = HIGH PRIORITY**
   - More important for the exam
   - Allocate more study time
   - Appear prominently in generated schedule

2. **Topics in one edital = MEDIUM PRIORITY**
   - Still important but specialized
   - Less critical for general preparation

3. **Uncovered topics = GAPS**
   - Topics in syllabus but not in your editorials
   - Either use other study materials
   - Or download/upload the missing edital

---

## Common Workflows

### Scenario 1: Preparing for Single Exam
1. Create contest
2. Add main edital
3. Map topics to content sections
4. Generate schedule
5. Follow schedule in planner

### Scenario 2: Comparing Multiple Editorials
1. Create contest
2. Add Edital A (old exam)
3. Add Edital B (new exam)
4. Add Edital C (official announcement)
5. View coverage - identify common topics
6. Generate schedule focusing on overlaps
7. Use gaps analysis to find supplementary material

### Scenario 3: Multi-Contest Preparation
1. Create Contest A (Target exam)
2. Create Contest B (Backup exam)
3. Add editorials to both
4. Go to each contest's planner
5. Switch between using "IA Cronograma" for each
6. Planner combines sessions from both

---

## Tips for Best Results

### With Editorials:
- Add the **official edital** first
- Add **previous years' editorials** for pattern recognition
- Add **corrected version** if edital was updated
- Include **exam notices** and **notifications**

### With Content Mapping:
- The system auto-detects crossings automatically
- You don't need to manually map everything
- Focus on adding editorials; analysis is automatic

### With AI Schedule:
- Realistic weekly hours = more accurate schedule
- Earlier exam date = better long-term planning
- Generate multiple times with different dates to compare
- AI adjusts based on content priorities

---

## Troubleshooting

### "No content mappings found" when generating schedule
- Make sure you've added at least one editorial
- Verify the editorial is linked to your contest
- Wait a moment for the system to process

### Schedule seems too aggressive/relaxed
- Adjust "Horas por semana" and regenerate
- Earlier exam dates require more daily hours
- Try +/-10 hours to see difference

### Can't find the "IA Cronograma" button
- You need a **primary contest** (one marked as "Foco Principal")
- Go to Contests and mark a contest as primary
- Then the button appears in Planner

### Gemini API errors
- Verify GOOGLE_API_KEY is set correctly
- Check quotas in Google AI Studio dashboard
- Try a fresh API key if recurring issues

---

## What's New vs. Old

### Before:
- Empty planner with no guidance
- Mock data cluttering the database
- No way to track editorials
- Manual schedule creation

### After:
- Clean database, user-controlled content
- Multiple editorial management
- Automatic priority detection
- AI-powered schedule generation
- Intelligent gap identification
- One-click schedule import

---

## Next Features Coming Soon

- Extract topics automatically from PDF editorials
- Multi-exam scheduling (prepare for 2+ contests simultaneously)
- Study performance tracking
- Spaced repetition integration
- Social study group features
- Prediction: "Days until readiness"

---

## Questions?

For detailed information, see: `IMPLEMENTATION_SUMMARY.md`

For architecture details, see: `v0_plans/pure-guide.md`
