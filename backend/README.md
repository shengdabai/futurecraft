# FutureCraft Backend API Server

安全的后端代理服务器，用于：
- 保护 Gemini API Key 不暴露到前端
- 用户身份认证 (JWT)
- 请求速率限制
- 内容安全过滤
- 使用量统计与计费

## 架构说明

```
[iOS App / Web App]
        ↓
   [Backend Server]
        ├── JWT 认证
        ├── 速率限制 (IP + User)
        ├── 内容安全过滤
        ├── 用量统计
        ↓
   [Gemini API]
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `env.example.txt` 为 `.env` 并填入实际值：

```bash
cp env.example.txt .env
```

关键配置：

```env
# JWT 密钥（生产环境请使用强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars

# Gemini API Key（在 Google AI Studio 获取）
GEMINI_API_KEY=your-gemini-api-key
```

### 3. 启动服务器

开发模式（热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm run build
npm start
```

## API 端点

### 认证

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/apple` | POST | Apple 登录 |
| `/auth/guest` | POST | 游客登录 |
| `/auth/me` | GET | 获取当前用户 |
| `/auth/refresh` | POST | 刷新 Token |

### AI 服务

所有 AI 端点需要 Bearer Token 认证。

| 端点 | 方法 | 说明 |
|------|------|------|
| `/ai/soul-scan` | POST | RPG 角色分析 |
| `/ai/simulation` | POST | 生成模拟场景 |
| `/ai/simulation/evaluate` | POST | 评估模拟选择 |
| `/ai/skill-tree` | POST | 生成技能树 |
| `/ai/chat` | POST | AI 导师对话 |
| `/ai/tts` | POST | 语音合成 |

### 用户

| 端点 | 方法 | 说明 |
|------|------|------|
| `/user/usage` | GET | 使用统计 |
| `/user/billing` | GET | 计费信息 |

### IAP

| 端点 | 方法 | 说明 |
|------|------|------|
| `/iap/verify-purchase` | POST | 验证购买 |
| `/iap/sync-subscription` | POST | 同步订阅 |
| `/iap/subscription-status` | GET | 订阅状态 |

## 安全机制

### 1. JWT 认证

所有 AI 请求必须携带有效的 JWT Token：

```http
Authorization: Bearer <token>
```

### 2. 速率限制

- 通用：每分钟 30 次请求
- AI 请求：每分钟 10 次
- 登录：每 15 分钟 10 次
- 用户级别：每小时 50 次 AI 请求

### 3. 内容过滤

- 用户输入在发送给 Gemini 前进行敏感词检查
- AI 输出在返回给用户前进行安全过滤
- URL 白名单验证

### 4. 使用量控制

- 每月免费额度：100 Credits
- Token 换算：1000 input tokens = 1 Credit, 1000 output tokens = 2 Credits
- 超出额度需升级订阅

## 部署

### 环境要求

- Node.js 18+
- 建议使用 Docker 或云服务（Cloud Run, AWS Lambda 等）

### 生产环境配置

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
GEMINI_API_KEY=<your-api-key>
RATE_LIMIT_MAX_REQUESTS=20
CONTENT_SAFETY_LEVEL=high
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

## 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 点击 "Create API Key"
4. 选择或创建 Google Cloud 项目
5. 复制生成的 API Key
6. 将 Key 添加到 `.env` 文件

⚠️ **安全提示**：
- 永远不要将 API Key 提交到 Git
- 不要在前端/客户端代码中使用 API Key
- 定期轮换 API Key
- 设置 API Key 的使用配额限制

