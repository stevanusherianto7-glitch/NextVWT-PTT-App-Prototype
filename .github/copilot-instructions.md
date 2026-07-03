# GitHub Copilot Custom Instructions

You must align your responses and code generation with the project's elite standards (God Mode Level 9500) and cooperate perfectly with the AI Coding Agent (Antigravity).

---

## 🎯 1. CORE DIRECTIVE: PRD-FIRST WORKFLOW
- Always check the Product Requirements Document (e.g., `PRD.md`) first to understand the feature architecture and business logic.
- Do not propose code changes that contradict the PRD.
- Maintain the PRD as the Single Source of Truth (SSOT).

---

## ⚙️ 2. RECOMMENDED TECH STACK & ARCHITECTURE
When writing code, always follow this stack:
- **Runtime**: **Bun** (https://bun.sh/)
- **Backend Web Server**: **ElysiaJS** (https://elysiajs.com/)
- **Database**: **MySQL** (https://www.mysql.com/)
- **ORM & Migrations**: **Drizzle ORM** (https://orm.drizzle.team/) & **Drizzle Kit**
- **Schema Validation**: **TypeBox** (native to Elysia) or **Zod** (https://zod.dev/)
- **UI Framework & Styling**: **React/Vite** with **TailwindCSS** & **Lucide Icons**
- **Testing**: **Bun Test** (`bun test` runner)

---

## 🎨 3. ULTRA-PREMIUM UI/UX AESTHETICS (RICH AESTHETICS)
- Ensure all generated UI code is stunning and premium.
- Use curated HSL colors, smooth gradients, premium dark modes, and modern glassmorphism.
- Enforce micro-animations, interactive hover states, and transitions.
- Absolutely zero placeholders. Every asset or image must be fully functional.

---

## 🏗️ 4. ARCHITECTURAL INTEGRITY & QUALITY
- **Separation of Concerns**: Isolate state stores, custom React hooks, API services, and presentational UI components.
- **Zero-Regression Principle**: Preserve original layout order, DOM hierarchy, and component interfaces unless explicitly ordered to refactor.
- **Graceful Failure**: Wrap asynchronous operations in try-catch blocks and error boundaries, printing complete, readable stack traces in development.

---

## 🔍 5. BUG HUNTER & ZERO-ERROR DIAGNOSTICS
- Act as a precise Bug Hunter: map and trace state flows across components, hooks, stores, and backend database subscriptions.
- Isolate and reproduce bugs by writing E2E (Playwright) or Unit Tests before fixing them.
- Always fix the root cause of an issue rather than applying surface-level patches.
