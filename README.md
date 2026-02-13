# 🏠 Lundedev Hjem

Welcome to **Lundedev Hjem**! This is the modern, interactive frontend for the Lundeberg homelab dashboard. Built with the latest web technologies to provide a slick and responsive experience. ✨

## 🚀 Features

*   **🔐 Secure Authentication**: Integrated with Google OAuth via NextAuth.js.
*   **⛅ Weather Updates**: Real-time weather data for specific locations (Yr.no).
*   **💡 Smart Home Control**: Interactive light controls and status via `lundedev-core`.
*   **🎨 Modern UI**: Clean, dark-mode first design using Tailwind CSS v4.
*   **⚡ Fast & Responsive**: Powered by Next.js 16 and React 19.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/) & [Heroicons](https://heroicons.com/)
*   **Auth**: [NextAuth.js v5](https://authjs.dev/)
*   **Containerization**: Docker 🐳

## 🏃‍♂️ Getting Started

### Prerequisites

*   Node.js 20+
*   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vegardlu/lundedev-hjem.git
    cd lundedev-hjem
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env.local` file in the root directory:
    ```bash
    # Authentication
    AUTH_SECRET="your-super-secret-key"
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"

    # Backend API
    NEXT_PUBLIC_API_URL="http://localhost:8080" # or https://api.lundeberg.cc
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🐳 Docker Deployment

This project is designed to run in a Docker container on the server.

```bash
# Build the image
docker build -t lundedev-hjem .

# Run the container
docker run -p 3000:3000 --env-file .env.local lundedev-hjem
```

Refer to the root `compose.yaml` in the homelab repository for the full production stack.

## 🤝 Workflow

1.  **Develop**: Work on your local machine (MacBook).
2.  **Push**: Push changes to GitHub.
3.  **Deploy**: Pull changes on the server (`lundeberg.cc`) and restart the Docker container.

---

Made with ❤️ by internal developers at Lundeberg.cc
