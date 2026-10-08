<div align="center">
  <a href="https://www.codechefvit.com" target="_blank">
    <img src="https://i.ibb.co/4J9LXxS/cclogo.png" width="160" title="CodeChef-VIT" alt="CodeChef-VIT">
  </a>

  <h1>CookOff 11.0 Portal</h1>

  <p>
    The official participant portal for CookOff 11.0, the 11th edition of
    CodeChef-VIT's premier competitive programming contest. The platform
    provides participants with a seamless contest experience, from
    authentication and round progression to problem solving, code execution,
    submissions, and real-time result tracking.
  </p>

  <p>
    <a href="https://cookoff.codechefvit.com/">
      <img src="https://img.shields.io/badge/STATUS-LIVE-green?style=for-the-badge" alt="Live">
    </a>
    <a href="https://github.com/CodeChefVIT/cookoff-portal-11.0/pulls">
      <img src="https://img.shields.io/badge/PRs-WELCOME-blue?style=for-the-badge" alt="PRs Welcome">
    </a>
  </p>
</div>

---

## 🚀 Deploy

The CookOff 11.0 participant portal is deployed and accessible at:

**[https://cookoff.codechefvit.com/](https://cookoff.codechefvit.com/)**

---

## 🛠️ Tech Stack

The portal is built using a modern and scalable web stack:

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Server State:** [TanStack Query](https://tanstack.com/query)
- **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Drag & Drop:** [dnd-kit](https://dndkit.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **URL State:** [nuqs](https://nuqs.47ng.com/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Testing:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

---

## ✨ Features

### 🔐 Authentication

- Google OAuth-based participant authentication.
- Secure session handling through the backend.
- Automatic redirection between authentication and protected contest routes.

### 🏠 Participant Dashboard

- Participant session information.
- Current score and contest progress.
- Round availability and progression.
- Contest state retrieved directly from the backend.

### 🏁 Multi-Round Contest Flow

CookOff 11.0 consists of multiple rounds with different problem-solving formats.

- **Round 1:** Visual/block-based programming questions.
- **Round 2:** Competitive programming problems with an integrated code editor.
- **Round 3:** Competitive programming problems with an integrated code editor.
- Round access is controlled through contest state and round gating.

### 🧩 Visual Programming

Round 1 introduces a block-based problem-solving interface:

- Drag-and-drop programming blocks.
- Block chain construction.
- Dynamic visual question interaction.
- Submission of constructed solutions to the backend.

### 💻 Code Editor

Rounds 2 and 3 provide an integrated coding environment powered by Monaco Editor.

- Syntax highlighting.
- Multiple programming languages.
- Code persistence while solving questions.
- Custom input execution.
- Public testcase execution.
- Compilation and execution feedback.

### 📤 Code Submission

- Submit solutions directly from the contest portal.
- Backend-powered judging.
- Submission status tracking.
- Result polling for submitted solutions.
- Compiler and testcase feedback.

### 🧪 Custom Run

Participants can test their solutions before submitting:

- Execute code against custom input.
- Run against public testcases.
- View execution results directly inside the portal.

### ⏱️ Contest Timer

- Contest timing is synchronized with the backend.
- Countdown information is retrieved from the contest server.
- Contest state is reflected throughout the participant interface.

### 💾 Progress Persistence

Important participant state is persisted locally, including:

- Code drafts.
- Selected languages.
- Custom input.
- Question-specific progress.

This allows participants to recover their work after refreshing the page.

---

## 🏛️ Frontend Architecture

The CookOff 11.0 portal is built using the Next.js App Router and follows a component-based architecture.

### Application Structure

The application is broadly divided into:

- **App Routes** — Authentication, dashboard, rounds and question pages.
- **API Layer** — Centralized communication with the CookOff backend.
- **Components** — Reusable UI and contest-specific components.
- **Hooks** — Reusable client-side logic.
- **Stores** — Global client-side state using Zustand.
- **Schemas** — Runtime validation using Zod.
- **Types** — Shared TypeScript types.
- **Utilities** — Common helper functions.

### Route Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── round/
│   │   └── loading.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
│
├── api/
│   ├── attempts.ts
│   ├── blocks.ts
│   ├── client.ts
│   ├── questions.ts
│   ├── session.ts
│   ├── submissions.ts
│   ├── testcases.ts
│   ├── timer.ts
│   ├── visual-submissions.ts
│   └── wire.ts
│
├── components/
├── constants/
├── hooks/
├── lib/
├── schemas/
├── stores/
├── styles/
├── test/
├── types/
└── utils/
```

---

## 🔌 Backend Communication

The participant portal communicates with a separate backend service responsible for authentication, contest state, questions, submissions and judging.

The backend URL is configured through:

```env
NEXT_PUBLIC_API_URL=
```

The frontend communicates with APIs including:

```text
GET  /dashboard
POST /logout

GET  /question/round
GET  /question/:id
GET  /question/:id/blocks

POST /submit
GET  /result/:id

POST /runcode
POST /runcustom

GET  /getTime

POST /submit/visual
```

The authentication flow begins through:

```text
/auth/google
```

The backend handles Google OAuth and establishes the participant session before redirecting the user back to the portal.

---

## 🧪 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- pnpm
- A running CookOff 11.0 backend

### Installation

Clone the repository:

```bash
git clone https://github.com/CodeChefVIT/cookoff-portal-11.0.git
cd cookoff-portal-11.0
```

Install dependencies:

```bash
pnpm install
```

### Environment Variables

Create a local environment file:

```bash
cp example.env .env.local
```

Set the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run the Development Server

```bash
pnpm dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 📜 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Create production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format the project
pnpm format:check # Check formatting
pnpm type-check   # Run TypeScript checks
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

---

## 🔗 Related Projects

- **Backend:** [CookOff 11.0 Backend](https://github.com/CodeChefVIT/cookoff-11.0-be)
- **Admin Portal:** [CookOff 11.0 Admin Portal](https://github.com/CodeChefVIT/cookoff-admin-11.0)

---

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repository.
2. Create your feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m "Add AmazingFeature"
```

4. Push the branch:

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request.

---

## 🚀 Contributors

<table align="center">
<tr align="center">

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/mharshil1234" width="120" height="120" alt="Harshil Maheshwari" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/mharshil1234" target="_blank">Harshil Maheshwari</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/upayanmazumder" width="120" height="120" alt="Upayan Mazumder" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/upayanmazumder" target="_blank">Upayan Mazumder</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/atharvaSharma17" width="120" height="120" alt="Atharva Sharma" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/atharvaSharma17" target="_blank">Atharva Sharma</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/YOGESH-08" width="120" height="120" alt="YOGESH-08" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/YOGESH-08" target="_blank">Yogesh Kumar</a>
</p>
</td>

</tr>

<tr align="center">

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/Rithish-2914" width="120" height="120" alt="Rithish-2914" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/Rithish-2914" target="_blank">Rithish Bajjuri</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/Radical-11" width="120" height="120" alt="Radical-11" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/Radical-11" target="_blank">Vihaan Jain</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/VPK570" width="120" height="120" alt="VPK570" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/VPK570" target="_blank">VP Krishna</a>
</p>
</td>

<td>
<p align="center">
<img src="https://avatars.githubusercontent.com/Dragon-Rage" width="120" height="120" alt="Dragon-Rage" style="border-radius:50%">
</p>
<p align="center">
<a href="https://github.com/Dragon-Rage" target="_blank">Ayman Raza Naqvi</a>
</p>
</td>

</tr>
</table>

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <a href="https://www.codechefvit.com" target="_blank">CodeChef-VIT</a>
</p>
