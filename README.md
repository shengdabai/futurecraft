# FutureCraft

**AI-Powered Career Exploration & RPG-Based Skill Development Platform**

Welcome to FutureCraft - an innovative gamified career platform that transforms career exploration into an epic RPG journey. Discover your unique archetype, explore diverse career paths, and develop skills through immersive simulations.

---

# FutureCraft

**基于 AI 的职业探索与 RPG 技能开发平台**

欢迎来到 FutureCraft - 一个创新的游戏化职业平台，将职业探索转变为史诗级的 RPG 冒险。发现您独特的角色原型，探索多样的职业道路，并通过沉浸式模拟培养技能。

## 🎮 Features

### Soul Scan
- AI-powered personality and aptitude analysis
- Generate your unique RPG archetype (e.g., "Cyber Mystic", "Data Mercenary")
- RPG-style stats: Intelligence, Creativity, Charisma, Stamina, Technical Skills

### Multiverse Explorer
- Explore diverse career paths tailored to your archetype
- Detailed job descriptions with required skills and compensation
- Match scores for each career option

### Job Simulation
- Interactive scenarios for each career path
- Make choices and see real-time consequences
- Adaptability scoring with personalized feedback

### Skill Tree
- Personalized learning resources based on your target career
- Books, videos, GitHub repositories, and missions
- XP-based gamification system

### AI Tutor
- Chat with an AI career mentor
- Boss battle mode for challenging scenarios
- Contextual guidance based on your career goals

### Life Simulator
- Experience life scenarios before they happen
- Make informed decisions about your future

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **AI Integration**: Google Gemini API via backend proxy
- **Deployment**: Vercel with API routes
- **Build Tool**: Vite
- **Styling**: Custom with Tailwind CSS and gradient effects

## 🏗️ Architecture

The platform uses a **frontend-backend separation + backend proxy** architecture to ensure API Key security:

```
[Frontend React App] → [Backend API Server] → [Gemini API]
                          ↓
                   [JWT Authentication + Rate Limiting + Content Filtering]
```

**Security Features:**
- ✅ API Keys stored only in backend server environment variables
- ✅ All AI requests proxied through backend
- ✅ JWT user authentication
- ✅ IP and user-level rate limiting
- ✅ Content safety filtering

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/shengdabai/futurecraft.git
cd futurecraft
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (for backend API):
```bash
# Create .env.local for local development
VITE_API_BASE_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
futurecraft/
├── src/
│   ├── components/          # React components
│   ├── services/           # API service layer
│   ├── types.ts           # TypeScript interfaces
│   ├── App.tsx            # Main application
│   └── index.tsx          # Entry point
├── api/                   # Backend API routes (Vercel)
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## 🌟 How It Works

1. **Soul Scan**: Complete a questionnaire about your background, hobbies, and hidden talents
2. **AI Analysis**: Our AI analyzes your responses to create your unique RPG profile
3. **Career Discovery**: Explore career paths that match your archetype and stats
4. **Skill Development**: Access personalized learning resources
5. **Real-world Practice**: Simulate job scenarios and receive feedback

## 🔧 API Endpoints

The platform uses a proxy architecture to protect API keys:

- `/api/ai/soul-scan` - Analyze user profile and generate archetype
- `/api/ai/simulation` - Generate career simulation scenarios
- `/api/ai/skill-tree` - Create personalized learning paths
- `/api/ai/chat` - AI tutor conversations

## 📱 Responsive Design

- Mobile-first approach
- Dark theme with gradient accents
- Smooth animations and transitions
- Fully responsive navigation

## 🎨 Design System

- Color Palette: Cyan, Purple, gradients on dark background
- Typography: Modern sans-serif with tracking adjustments
- Icons: Lucide React
- Animations: CSS-based with Tailwind utilities

## 🔒 Security

- All API requests proxied through backend
- No API keys exposed in frontend code
- Secure authentication with Bearer tokens
- CORS configured for cross-origin requests

## 📄 License

MIT License - see LICENSE file for details.

---

# FutureCraft

**基于 AI 的职业探索与 RPG 技能开发平台**

欢迎来到 FutureCraft - 一个创新的游戏化职业平台，将职业探索转变为史诗级的 RPG 冒险。发现您独特的角色原型，探索多样的职业道路，并通过沉浸式模拟培养技能。

## 🎮 功能特点

### 灵魂扫描 (Soul Scan)
- AI 驱动的性格和能力分析
- 生成独特的 RPG 角色原型（如"赛博神秘师"、"数据雇佣兵"）
- RPG 风格属性：智力、创造力、魅力、耐力、技术力

### 多元宇宙探索 (Multiverse Explorer)
- 探索符合您原型的多样化职业道路
- 详细的职位描述，包含所需技能和薪酬
- 每个职业选项的匹配度评分

### 职业模拟 (Job Simulation)
- 针对每个职业路径的互动场景
- 做出选择并实时查看后果
- 适应性评分和个性化反馈

### 技能树 (Skill Tree)
- 基于目标职业的个性化学习资源
- 图书、视频、GitHub 仓库和任务
- 基于 XP 的游戏化系统

### AI 导师 (AI Tutor)
- 与 AI 职业导师对话
- 挑战模式的Boss战
- 基于您职业目标的情境化指导

### 人生模拟器 (Life Simulator)
- 在事情发生前体验人生场景
- 为您的未来做出明智决策

## 🚀 技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4
- **AI 集成**: 通过后端代理调用 Google Gemini API
- **部署**: Vercel with API routes
- **构建工具**: Vite
- **样式**: 自定义 Tailwind CSS 和渐变效果

## 📦 安装说明

1. 克隆仓库：
```bash
git clone https://github.com/shengdabai/futurecraft.git
cd futurecraft
```

2. 安装依赖：
```bash
npm install
```

3. 设置环境变量（后端 API）：
```bash
# 本地开发创建 .env.local
VITE_API_BASE_URL=http://localhost:3000/api
```

4. 运行开发服务器：
```bash
npm run dev
```

## 🏗️ 项目结构

```
futurecraft/
├── src/
│   ├── components/          # React 组件
│   ├── services/           # API 服务层
│   ├── types.ts           # TypeScript 接口定义
│   ├── App.tsx            # 主应用组件
│   └── index.tsx          # 入口文件
├── api/                   # 后端 API 路由（Vercel）
├── public/                # 静态资源
├── tailwind.config.js     # Tailwind 配置
├── vercel.json           # Vercel 部署配置
└── package.json          # 依赖和脚本
```

## 🌟 工作原理

1. **灵魂扫描**: 完关关于您的背景、爱好和隐藏才能的问卷
2. **AI 分析**: 我们的 AI 分析您的回答，创建独特的 RPG 个人资料
3. **职业发现**: 探索符合您原型和属性的职业生涯道路
4. **技能发展**: 获取个性化学习资源
5. **实战练习**: 模拟工作场景并获得反馈

## 🔧 API 端点

平台使用代理架构保护 API 密钥：

- `/api/ai/soul-scan` - 分析用户资料并生成原型
- `/api/ai/simulation` - 生成职业模拟场景
- `/api/ai/skill-tree` - 创建个性化学习路径
- `/api/ai/chat` - AI 导师对话

## 📱 响应式设计

- 移动优先的设计理念
- 深色主题配合渐变点缀
- 流畅的动画和过渡效果
- 完全响应式导航

## 🎨 设计系统

- 配色方案：青色、紫色、深色背景上的渐变
- 字体：现代无衬线字体，带字距调整
- 图标：Lucide React
- 动画：基于 Tailwind 的 CSS 动画

## 🔒 安全性

- 所有 API 请求通过后端代理
- 前端代码不暴露 API 密钥
- 使用 Bearer 令牌进行安全认证
- 配置了跨域请求（CORS）

## 📄 许可证

MIT 许可证 - 详见 LICENSE 文件
