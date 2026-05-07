import { defineConfig } from "vitepress";

const basePath = process.env.BASE_PATH;
const base = basePath ? `${basePath.replace(/\/$/, "")}/` : "/";

export default defineConfig({
  title: "ai-rate-queue",
  description: "Redis-backed RPM limiter for AI/LLM API calls.",
  base,
  themeConfig: {
    nav: [
      { text: "Quickstart", link: "/quickstart" },
      { text: "Usage", link: "/usage" },
      { text: "Redis", link: "/redis" },
      { text: "Troubleshooting", link: "/troubleshooting" }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/cap-jmk-real/ai-rate-queue" }]
  }
});

