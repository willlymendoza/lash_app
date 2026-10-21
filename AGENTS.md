<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Read the relevant related skill (if available).

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->

# AGENTS.md

## 🧠 Project Overview

lash_app is a fullstack internal management system for a lash studio.

The app handles:

- appointments (core of the business)
- clients
- services
- sales (POS)
- deposits
- inventory (products and supplies)
- expenses and cash flow
- lashist payments and commissions

This system is NOT public-facing.
It is an internal operational tool.

---

## ⚙️ Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: TailwindCSS + shadcn/ui
- Forms: React Hook Form + Zod
- Database: PostgreSQL (Supabase)
- ORM: Drizzle ORM
- Auth: Better Auth

---

## 🧱 Architecture

### Folder Structure

- `src/app` → routing (App Router)
- `src/modules` → business logic per domain
- `src/components` → reusable UI components
- `src/db` → schema and database logic
- `src/lib` → shared utilities
- `src/hooks` → custom hooks

### Module Pattern

Each module follows:

- components/
- server/actions/
- server/queries/
- schemas/
- types/

---

## 📌 Core Business Rules

### Appointments

- Appointments cannot overlap per lashist
- Duration is defined per appointment (not strictly tied to service)
- Services provide default duration, but it is editable
- Appointment status must be tracked (pending → completed, etc.)

### Deposits

- Deposits are linked to appointments and clients
- Deposits must be resolved on:
  - cancellation
  - no-show

- Resolution must distribute amount into:
  - refund
  - studio
  - lashist

### Sales (POS)

- Sales can be:
  - walk-in
  - appointment checkout

- Sales must:
  - support multiple payment methods
  - support discounts
  - apply deposits automatically

- All prices must be SNAPSHOTTED at time of sale

### Inventory

- Products and supplies are separate systems
- Inventory is managed via movements (not direct edits)
- Stock is a derived value

### Lashists

- Each lashist has a default commission
- Commissions can be:
  - percentage
  - fixed

- Payouts must consider:
  - generated revenue
  - commission
  - advances

### Financial Integrity

- Transactions are NEVER deleted
- They are voided instead
- All operations must be traceable

---

## 🔐 Permissions & Security

- The system uses role-based access control (RBAC)
- Roles are dynamic (not hardcoded)
- Permissions are granular (per action and module)
- Users can have permission overrides

DO NOT hardcode access logic in UI.
Always rely on permission checks.

---

## 🧭 Development Rules

### General

- Use Server Components by default
- Use Client Components ONLY when necessary
- Prefer Server Actions over API routes when possible
- Keep the /src/app pages (page.tsx) clean and minimal using components for the module and avoid using "page_content" components to keep props drilling to a minimum

### Validation

- Use Zod for all validation
- Validation must exist both:
  - frontend
  - backend

### Data Access

- Use Drizzle ORM
- Keep queries inside module `server/queries`
- Keep mutations inside module `server/actions`

### Naming

- Use kebab-case for files and folders
- Use descriptive names:
  - create-client.ts
  - get-appointments.ts

---

## 🧩 UI Guidelines

- Use shadcn/ui components
- Keep UI clean and minimal
- Avoid overengineering components
- Prioritize operational speed over visual complexity

---

## 🚫 Things to Avoid

- Do NOT introduce unnecessary abstractions
- Do NOT overuse global state
- Do NOT duplicate business logic across modules
- Do NOT bypass validation layers
- Do NOT mutate financial data without traceability

---

## 📚 Project Context Files

These files contain deeper context and MUST be respected:

- /docs/lash_studio_features_V3.md
- /docs/lashista_db_design_V1.md
- /docs/project_structure_V1.md
- /docs/lashista_tech_stack_V2.md
- /docs/development_roadmap_V1.md
- /docs/md_file_rules_V1.md
- /docs/color_palette_V2.md

If any implementation conflicts with these documents:
→ The documents are the source of truth

---

## 🧠 Mental Model for the System

Think of the system in flows:

### Core Flow

clients → appointments → deposits → sales

### Financial Flow

sales → payments → expenses → cash flow

### Lashist Flow

appointments → revenue → payouts

### Inventory Flow

products/supplies → inventory movements

---

## 🚀 Development Priority

Follow this order:

1. authentication
2. users / roles / permissions
3. clients / services
4. appointments
5. deposits
6. sales (POS)
7. inventory
8. expenses / cash
9. lashist payouts
10. reports

---

## 🧠 Final Instruction for Agents - Development guide

When implementing features:

- ALWAYS use Guatemala timezone (America/Guatemala) for date create/edits/reads.
- ALWAYS consult relevant available skills before starting a new task
- ALWAYS align with business rules
- ALWAYS preserve financial integrity
- ALWAYS prefer simplicity over cleverness
- ALWAYS follow existing patterns in the codebase
- WHEN we need to install or run a command, always ask the user to execute it themselves
- Don't implement unnecessary optimizations when they're not needed or don't provide clear value
- Create/edit only one file at a time, always ask for confirmation before creating the next one
- After creating/editing a file, show the user a brief summary of the changes and the next step brief description
- Only the user can run commands like pnpm, git, etc.
- You can create/edit files and folders
- You can execute commands to explore/gather context information
- Don't change in-line tailwind classes order, keep them as they are
- You can add/remove/edit classes to adjust the UI as needed
- Keep application text, validation messages, comments, and documentation in English.
- Keep files, variables, functions, folders names in English
- Keep table fields ordered with audit fields always at the end (`createdAt`, `updatedAt`, `deletedAt`, `createdByUserId`, `updatedByUserId`, `deletedByUserId`)
- Only use shadcn components.
- Before implementing a new UI component, check if we need to install new shadcn/ui components for the current feature
- Let the user know when a complete feature flow is ready to be tested manually in the UI
- When asked to provide a commit message, provide it in list format with bullet points and text in English, properly formatted. Also, provide it with the title relate to the changes made without list style.
- Do not include the edits to /docs files in the commit messages
- Keep the UTF-8 encoding for all files
- Always use useActionState for form actions
- Always try to not fill out a component with functionality that can be placed in the src/lib folder.
- Follow the formating rules based on the default prettier config.
- Avoid using mojibake for Spanish words with accent marks.
- DO NOT CREATE migrations by hand, we should always follow the db:generate and db:migrate pattern. Ask the user to execute those commands when needed.
- For dates, use the following order to show them: day, month, year. The presentation will depend on the view we're working on.

If unsure:
→ prioritize consistency over innovation
→ prioritize clarity over optimization

<!-- END:project-context -->
