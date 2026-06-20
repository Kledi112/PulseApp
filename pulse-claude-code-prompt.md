# Claude Code Build Prompt — "Pulse" (Expo App)

> Paste everything below the line into Claude Code, running inside your existing Expo project (`Pulse-App`). It is written as instructions to the agent.

---

## Project context

You are building the front-end of **Pulse**, a two-sided employee-benefits marketplace, as a **React Native app on Expo (SDK 54, TypeScript, Expo Router)**. The project already exists — it was created with `npx create-expo-app@latest --template default@sdk-54`. Build inside it; do not scaffold a new project.

This is a **hackathon MVP**. The goal is a polished, demo-able UI with a working core loop, not production completeness. A teammate is building the real database separately, so **all data must come from a clean, swappable mock data layer** (see "Data layer" below) — never hardcode data inside screens.

**Use the installed skills and tools when building:**
- Use the **`design-taste-frontend`** skill (the taste-skill installed in `.claude/skills/`) as the primary driver of visual quality. This app must NOT look like generic AI SaaS slop — strong typography, spacing rhythm, hierarchy, and intentional motion.
- Use the **21st.dev Magic MCP** (`/ui` command) to generate layout and component **reference / inspiration**. Important: Magic outputs React + Tailwind **web** components — they do not run in React Native. Use them for structure and visual direction, then **re-implement in React Native primitives** (`View`, `Text`, `Pressable`, `StyleSheet`/`expo-linear-gradient`). Do not paste Magic's web output directly into the app.

Before writing screens, briefly confirm the build order with me, then proceed screen by screen.

## The product (one paragraph of context)

Pulse lets companies give employees a welfare budget they actually want to use. **Employees** browse a marketplace of perks (gyms, restaurants, travel, clinics, telecoms), add them to a bundle like an e-commerce cart, and request them. **Managers/employers** approve requests and a simulated payment goes to the provider — the money never passes through the employee. Engagement is a core goal: gamified **Quests** and leaderboards keep people coming back. Architect it to be **international but Albania-first**: default currency **Albanian Lek (ALL / Lekë)**, local providers, and an i18n-ready string structure so it could open in Milan or Madrid later without a rewrite.

## Tech stack & conventions

- **Expo SDK 54, React Native, TypeScript** (strict).
- **Expo Router** for file-based navigation (already in the template).
- **Zustand** for global state (auth/role, bundle cart). Install if not present.
- **expo-linear-gradient** for the brand gradient. Add other Expo-managed libs as needed (e.g. `react-native-reanimated` is already in the template — use it for animation).
- Keep all design tokens (colors, spacing, type scale, radii) in a single `theme/` module and consume them everywhere. No inline magic numbers for colors.
- Components in `components/`, screens via Expo Router in `app/`, mock data + services in `data/` and `services/`, types in `types/`.

## Brand / design system

Dark-first theme built from the logo palette:

- **Primary teal accent:** `#14b8a6`
- **Brand gradient (mint → teal):** `#6ee7b7 → #2dd4bf → #14b8a6` — use for primary CTAs, the logo lockup, highlights, and "delight" moments.
- **Background / near-black:** `#0d1117` (a dark blue-black, not pure black). Use as the base background; layer slightly lighter dark surfaces for cards.
- Derive supporting neutrals, success/error, and category accent colors from this base. Keep contrast strong and accessible in dark mode.

Aesthetic direction: modern marketplace feel — think the **Wolt** app for the perks browsing experience (clean category chips, image-forward cards, smooth scrolling, generous spacing). Apply the `design-taste-frontend` skill to every screen.

## Navigation structure

Auth flow first, then **role-based** tab navigators. Because there are two roles, give me an easy way to demo both: after login route to the correct tabs, and include two clearly-labeled demo login buttons ("Sign in as Employee" / "Sign in as Manager") plus the real login form, so I can switch roles instantly during the demo.

```
app/
  (auth)/
    login            # employee/manager login + "Register your business" CTA at bottom-center
    register-business
    application-success
  (employee)/
    marketplace      # Main Screen (default tab)
    bundle           # cart
    quests           # quests + leaderboard
    assistant        # AI chat (stubbed)
    profile
  (manager)/
    requests         # active requests (default tab)
    quest-management
    profile
```

## Screens — employee

**Login / Register entry**
- Email/username + password fields, sign-in button.
- A **"Register your business"** button at the bottom-center → goes to register-business.
- Include the two demo-role buttons described above.

**Register business**
- Form fields: business name, **NIPT (VAT ID)**, number of employees, contact number, email.
- Validate fields (required, basic email/phone format).
- On submit → call `submitBusinessApplication(payload)` (see Data layer) → navigate to **application-success** screen ("Application received — we'll be in touch.").
- The payload is meant to be emailed to the operator. **Email sending is a backend job (teammate).** Implement `submitBusinessApplication` as an async service stub that logs the payload and resolves, with a clearly-marked `// TODO: wire to backend / email (e.g. EmailJS or API endpoint)` integration point. Do not attempt to send email from the client.

**Profile**
- Shows the employee's **history of claimed perks**.
- Edit credentials: username, password, profile picture (use `expo-image-picker` for the avatar).
- A **log out** button.

**Marketplace (Main Screen)**
- Grid/list of **perks**, each card: title, image, short description, and two buttons — **"Request"** and **"Add to bundle."**
- **Category filtering**: chips/tabs across the top — Health Care, Food, Fun, Wellness, Travel, etc. Grouped and filterable by category (Wolt-style).
- "Request" submits a single-perk request immediately. "Add to bundle" pushes the perk into the bundle store (cart behavior).
- Prices shown in **Lekë (ALL)**.

**Bundle (cart)**
- Lists perks the user added.
- **Discount rule:** each perk in a custom bundle is discounted **10% off its own price**. Show original vs discounted price and the bundle total. *(Confirm with me that this is the intended interpretation — the spec says "10% discount for each perk added to a custom bundle.")*
- A **"Request bundle"** button submits all bundled perks as one request (a package that can span multiple providers — this is the core loop the challenge wants demonstrated).

**Assistant (AI)**
- A chat screen: message list + input box, user bubbles and assistant bubbles, send button, basic "typing" state.
- **Stub the responses** with canned/mock replies (e.g. given "find me something relaxing," return a couple of matching perks as cards). Structure it so a real AI backend can be dropped in behind one `sendAssistantMessage()` service call later. Do not call any external AI API now.

**Quests**
- List of quests created by managers (e.g. "Team that fixes the bug on X by Friday gets a pre-approved dinner at Padam").
- Each quest is **team**, **individual**, or **either**. If "either," show a **dropdown** to pick how you enter (individually / as a team).
- **"Enter quest"** plays a satisfying animation on press (use `react-native-reanimated` — e.g. a celebratory scale/confetti/glow moment). Make it feel like a delight moment, on-brand with the gradient.
- **Leaderboard** section: teams with the most quests completed **this quarter**, and individuals with the most completed **this month** (individual totals include team quests they completed this month).

## Screens — manager

**Login** — same login screen / role routing.

**Profile** — same as employee profile.

**Active Requests**
- List of pending requests from employees (single perks and bundles), each with **Approve** / **Decline**.
- On **Approve** → show a **payment screen**: card or PayPal toggle, with the relevant fields. **Validate the fields are well-formed, then simulate** a successful payment (no real rail). On success, mark the request approved/paid and confirm the benefit is routed to the provider(s).

**Quest Management**
- A button to **create a new quest** (form: title/description, reward, type = team/individual/either, deadline).
- A section listing **finished quests awaiting a winner**, with the ability to **select a winner**.

## Data layer (critical — keep DB-swappable)

The teammate owns the real database, so isolate all data access:

- Define TypeScript types in `types/`: `User` (role: 'employee' | 'manager'), `Provider`, `Perk` (a.k.a. offer), `Bundle`, `Request`, `Quest`, `QuestEntry`, `LeaderboardEntry`, `BusinessApplication`.
- Put seed/mock data in `data/` as typed arrays.
- Expose everything through **async service functions** in `services/` (e.g. `getPerks()`, `getPerksByCategory()`, `submitRequest()`, `getActiveRequests()`, `approveRequest()`, `getQuests()`, `enterQuest()`, `getLeaderboard()`, `createQuest()`, `selectQuestWinner()`, `submitBusinessApplication()`, `sendAssistantMessage()`). Each returns a Promise and reads from the mock layer **today**, so swapping in a real API/DB later means editing only `services/`, not screens or components.
- Seed **Albania-relevant** sample data: Lekë prices; local-flavored providers (gyms, restaurants incl. Padam, telecoms, travel agencies, clinics); a handful of employees, a manager, sample quests, and a populated leaderboard so the demo looks alive.
- Structure copy/strings so they're **i18n-ready** (central strings + a currency formatter), defaulting to Albania/Lek — but don't build a full localization system now.

## Scope guardrails

- Do **not** build a backend, real auth, or a real database — mock everything behind the service layer.
- Do **not** integrate a real payment processor or real AI API — both are simulated/stubbed.
- Favor a **complete, working core loop** (employee browses → bundles → requests → manager approves → simulated payment → confirmation) plus at least one engagement feature shown live (Quests/leaderboard) over breadth.
- Keep components reusable and the file structure clean.

## Suggested build order

1. Theme/design tokens + brand gradient + shared UI primitives (Button, Card, CategoryChip, Screen wrapper).
2. Types + mock data + service stubs.
3. Auth flow (login, register-business, success) with role routing + demo-role buttons.
4. Employee Marketplace + Bundle (the core commerce loop) and Profile.
5. Manager Requests + simulated payment + Quest Management.
6. Quests + leaderboard + the enter-quest animation.
7. Assistant (stubbed chat).
8. Polish pass with the `design-taste-frontend` skill across all screens.

Confirm the build order and the bundle-discount interpretation with me, then start with step 1.
