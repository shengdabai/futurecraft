# 🎮 FutureCraft

> **Turn career exploration into an RPG.** Scan your soul, discover your archetype, simulate jobs before you commit, and level up the skills that actually matter.

`English | [中文](#中文)`

![Last commit](https://img.shields.io/github/last-commit/shengdabai/futurecraft)
![Stars](https://img.shields.io/github/stars/shengdabai/futurecraft?style=social)
![Follow @shengdabai](https://img.shields.io/github/followers/shengdabai?style=social)

**Live demo:** https://zturnsgo.com

---

## Why FutureCraft

Most career advice is a wall of text and a personality test you forget five minutes later. FutureCraft makes the question *"what should I do with my life?"* playable. You answer a short Soul Scan, an AI turns it into an RPG character sheet, and from there you explore real career paths, role-play a day on the job, and build a personalized skill tree — all gamified with XP and boss battles.

Built for Gen Z, bilingual (中文 / English) from the ground up, with a one-tap language switch.

## What it is

An AI-powered, RPG-style career-crafting platform. You move through six connected phases — Soul Scan → Multiverse → Simulation → Skill Tree → Tutor → Life Sim — each one building on your generated profile.

## ✨ Features

- **🔮 Soul Scan** — AI personality and aptitude analysis that generates a unique RPG archetype (e.g. "Cyber Mystic", "Data Mercenary") with stats for Intelligence, Creativity, Charisma, Stamina, and Technical Skill.
- **🌌 Multiverse Explorer** — Career paths matched to your archetype, each with required skills, compensation, and a match score.
- **🎲 Job Simulation** — Interactive, choice-driven scenarios for a chosen path, with real-time consequences and adaptability scoring.
- **🌳 Skill Tree** — A personalized learning path built from books, videos, GitHub repos, and missions, with XP-based progression.
- **🤖 AI Tutor** — Chat with an AI career mentor, including a "boss battle" mode for tougher scenarios, all grounded in your goals.
- **🛤️ Life Simulator** — Play out life scenarios before they happen, to make decisions you won't regret.
- **🌐 Bilingual** — Full 中文 / English support with an in-app language toggle.

## 🧱 Tech stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Build:** Vite 6
- **AI:** Google Gemini (`@google/genai`) via a backend proxy
- **Deploy:** Vercel (static frontend + serverless API routes)
- **Icons:** Lucide React

The app uses a **frontend → backend proxy → Gemini** architecture so API keys live only in server-side environment variables, never in the browser. The proxy layer adds auth, rate limiting, and content filtering.

## 🚀 Quick start

```bash
git clone https://github.com/shengdabai/futurecraft.git
cd futurecraft
npm install
npm run dev
```

The frontend talks to the backend API. For local development, point it at your API base URL via `.env.local`:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
```

Then open the dev server URL printed by Vite. To produce a production build:

```bash
npm run build    # builds the frontend and installs the api workspace
npm run preview  # preview the production build locally
```

## 📖 Usage

1. **Soul Scan** — fill in your background, hobbies, and a hidden talent.
2. **AI analysis** — the AI turns your answers into an RPG profile with stats and an archetype.
3. **Explore** — browse career paths matched to your profile.
4. **Simulate** — role-play scenarios for a path and get adaptability feedback.
5. **Level up** — work through a personalized skill tree and chat with the AI tutor.

Key API routes (all proxied to keep keys server-side):

- `POST /api/ai/soul-scan` — analyze profile, generate archetype
- `POST /api/ai/simulation` — generate simulation scenarios
- `POST /api/ai/skill-tree` — build a personalized learning path
- `POST /api/ai/chat` — AI tutor conversation

## 🗺️ Status

FutureCraft is in **active beta**. The six-phase core loop is implemented and the app is live at [zturnsgo.com](https://zturnsgo.com). Expect rapid iteration on simulations, the skill tree, and the AI tutor.

## 🤝 Connect / About

Built in public by **Tony (Sheng)** — a Chinese-language teacher with 6,000+ students, building AI tools at the intersection of education and Chinese teaching.

If FutureCraft is interesting to you, **⭐ star the repo and [follow @shengdabai](https://github.com/shengdabai)** to see what ships next.

More projects in the same direction:

- [gaokao-600](https://github.com/shengdabai/gaokao-600) — gaokao study tooling
- [gaokao-study-materials](https://github.com/shengdabai/gaokao-study-materials) — curated exam-prep materials
- [chinese-mission](https://github.com/shengdabai/chinese-mission) — gamified Chinese-language learning

## License

Released under the MIT License. (Add a `LICENSE` file to the repo to make the terms explicit.)

---

<a name="中文"></a>

# 🎮 FutureCraft（中文）

> **把职业探索变成一场 RPG。** 扫描你的灵魂、发现你的角色原型、在做决定之前先模拟职业，并升级真正重要的技能。

`[English](#-futurecraft) | 中文`

**在线体验：** https://zturnsgo.com

## 为什么是 FutureCraft

大多数职业建议无非是一大段文字加一个五分钟后就忘的性格测试。FutureCraft 把"我这辈子该做什么？"这个问题变得**可玩**：你完成一段简短的"灵魂扫描"，AI 把它变成一张 RPG 角色卡，然后你可以探索真实的职业路径、角色扮演一天的工作、构建专属技能树——全程配合 XP 与 Boss 战的游戏化机制。

为 Z 世代而生，**中文 / English 双语**原生支持，一键切换语言。

## 这是什么

一个由 AI 驱动、RPG 风格的职业塑造平台。你会依次经过六个相互衔接的阶段——灵魂扫描 → 多元宇宙 → 职业模拟 → 技能树 → AI 导师 → 人生模拟——每一步都基于你生成的角色档案展开。

## ✨ 功能特点

- **🔮 灵魂扫描** — AI 性格与能力分析，生成独特 RPG 角色原型（如"赛博神秘师""数据雇佣兵"），并给出智力、创造力、魅力、耐力、技术力等属性。
- **🌌 多元宇宙探索** — 匹配你原型的职业路径，附所需技能、薪酬与匹配度评分。
- **🎲 职业模拟** — 针对所选路径的互动式选择场景，实时反馈后果并进行适应性评分。
- **🌳 技能树** — 由图书、视频、GitHub 仓库和任务构成的个性化学习路径，基于 XP 进阶。
- **🤖 AI 导师** — 与 AI 职业导师对话，含挑战性场景的"Boss 战"模式，全程围绕你的目标。
- **🛤️ 人生模拟器** — 在事情发生之前先体验人生场景，做出不会后悔的决定。
- **🌐 双语支持** — 完整的中文 / English 支持，应用内一键切换。

## 🧱 技术栈

- **前端：** React 19 + TypeScript + Tailwind CSS 4
- **构建：** Vite 6
- **AI：** Google Gemini（`@google/genai`），通过后端代理调用
- **部署：** Vercel（静态前端 + Serverless API 路由）
- **图标：** Lucide React

应用采用 **前端 → 后端代理 → Gemini** 架构，API 密钥只存在于服务端环境变量中，绝不暴露在浏览器里。代理层额外提供鉴权、限流与内容过滤。

## 🚀 快速开始

```bash
git clone https://github.com/shengdabai/futurecraft.git
cd futurecraft
npm install
npm run dev
```

前端通过后端 API 通信。本地开发时，在 `.env.local` 中指定 API 地址：

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
```

随后打开 Vite 输出的开发地址。生产构建：

```bash
npm run build    # 构建前端并安装 api 工作区依赖
npm run preview  # 本地预览生产构建
```

## 📖 使用流程

1. **灵魂扫描** — 填写背景、爱好和一项隐藏才能。
2. **AI 分析** — AI 将回答转化为带属性和原型的 RPG 档案。
3. **探索** — 浏览与档案匹配的职业路径。
4. **模拟** — 角色扮演该路径的场景并获得适应性反馈。
5. **升级** — 沿个性化技能树成长，并与 AI 导师对话。

核心 API 路由（均经代理转发以保护密钥）：

- `POST /api/ai/soul-scan` — 分析档案、生成原型
- `POST /api/ai/simulation` — 生成模拟场景
- `POST /api/ai/skill-tree` — 构建个性化学习路径
- `POST /api/ai/chat` — AI 导师对话

## 🗺️ 项目状态

FutureCraft 处于**活跃 Beta** 阶段。六阶段核心流程已实现，应用已上线 [zturnsgo.com](https://zturnsgo.com)。模拟、技能树与 AI 导师仍在快速迭代中。

## 🤝 关于与联系

由 **Tony（盛）** 公开构建——一位拥有 6000+ 学员的中文老师，专注于打造教育与中文教学交叉的 AI 工具。

如果你对 FutureCraft 感兴趣，欢迎 **⭐ Star 本仓库并 [关注 @shengdabai](https://github.com/shengdabai)**，第一时间看到后续更新。

同方向的更多项目：

- [gaokao-600](https://github.com/shengdabai/gaokao-600) — 高考学习工具
- [gaokao-study-materials](https://github.com/shengdabai/gaokao-study-materials) — 精选备考资料
- [chinese-mission](https://github.com/shengdabai/chinese-mission) — 游戏化中文学习

## 许可证

基于 MIT 许可证发布。（建议在仓库中添加 `LICENSE` 文件以明确条款。）
