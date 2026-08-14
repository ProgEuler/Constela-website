# Constela Admin Dashboard (Website)

This is the web-based administrative dashboard for the **Constela** dating application. Built using **Next.js** (App Router), **Tailwind CSS**, and **Shadcn UI**, it provides administrators, moderators, and support agents with a powerful interface to manage the platform.

The website is fully container-ready and built to be 100% portable, optimized for deployment on PaaS platforms like **Dokploy**.

---

## 🛠 Tech Stack & Services

* **Next.js (App Router):** The core framework powering both the frontend React components and the backend serverless API routes.
* **Tailwind CSS & Shadcn UI:** For highly customizable, accessible, and responsive user interfaces.
* **Zustand:** For lightweight global state management.
* **AG Grid / React Table:** For handling large, complex data tables (e.g., users, transactions, reports).
* **Recharts:** For rendering analytics and statistical graphs.

---

## 🚀 Deployment (Dokploy & Docker)

> [!NOTE]
> **Active Deployment:** This dashboard is currently deployed and running via **Dokploy** on a VPS. All production `.env` variables (like the backend API URL) can be found and managed directly within the Dokploy Environment dashboard.

Because all sensitive configurations and API URLs have been moved to Environment Variables, deploying the app is incredibly simple.

### Setting up the Environment
You must inject the following variables into your Dokploy (or Docker) Environment UI:

* `NEXT_PUBLIC_API_URL`: The full URL to your production backend server. This is used by the frontend to make API calls. 
  *(Example: `https://api.constela.com`)*
* `JWT_SECRET`: A secret string used to verify and decode JWT tokens for user authentication on the frontend. This should match the secret used by your backend.

### Running the Server
Once the environment variables are injected, the server can be built and started:
```bash
npm install
npm run build
npm run start
```
