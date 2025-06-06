# ClearCareHQ - Search App

[![Vercel](https://vercelbadge.vercel.app/api/clearcarehq/clearcare-search-app)](https://app.clearcarehq.com/)

**ClearCareHQ Search App** is a modern, responsive web application for searching healthcare pricing transparency data.
It enables healthcare consumers, providers, and payers to explore and compare healthcare service costs through an intuitive search experience.

👉 Live app: [https://app.clearcarehq.com](https://app.clearcarehq.com)

---

## ✨ Features

* 🔍 **Full-text search** for healthcare pricing data
* 🏷️ **Faceted filtering** (provider, payer, service type, location, etc.)
* 💾 **Saved searches** and **search history**
* 💡 **Auto-suggestions** and intelligent search hints
* 🖥️ **Responsive design** — works great on desktop & mobile
* ⚡ **Fast and scalable** — powered by Next.js and optimized queries
* 🌐 **Deployed via Vercel** for zero-downtime CI/CD

---

## 🏗 Tech Stack

* **Frontend Framework**: [Next.js](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **State Management**: React Context API / Hooks
* **Search Backend**: (Specify if using Algolia, Firestore, or other search index — Firestore is implied via `firestore.rules`)
* **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) **v18+**
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/) — choose one

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/clearcare-search-app.git
cd clearcare-search-app

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Running locally

```bash
# Start the local dev server
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🛠 Project Structure

```plaintext
__tests__/          → Unit and integration tests
app/                → App configuration / higher-level logic
components/         → Reusable React components (SearchBar, ResultList, etc.)
contexts/           → React Contexts for state management
hooks/              → Custom React Hooks
lib/                → Utility functions, API clients, helpers
pages/              → Next.js pages (main app routes)
public/             → Static assets (images, favicon, etc.)
styles/             → Tailwind CSS configuration
```

---

## ⚙️ Configuration

The app can be configured using environment variables.
Create a `.env.local` file for local development.

Example:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 🧪 Testing

```bash
npm run test
# or
yarn test
# or
pnpm test
```

Tests are located in the `__tests__/` directory.

---

## 🚀 Deployment

The app is deployed via [Vercel](https://vercel.com/).

Every push to `main` triggers a deployment to production:

👉 **Production:** [https://app.clearcarehq.com](https://app.clearcarehq.com)

---

## 📝 Contributing

We welcome contributions from internal team members!

* Fork this repo
* Create a new branch
* Submit a Pull Request with clear description

Please follow existing code style (TypeScript + Tailwind CSS conventions).

---

## 📄 License

This project is proprietary to **ClearCareHQ**. All rights reserved.

---

## 📞 Contact

* Project Lead: Richard Joy
* Internal Slack: #clearcarehq-search
* Main site: [https://clearcarehq.com](https://clearcarehq.com)

