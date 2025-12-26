<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FutureCraft - AI 职业规划 RPG

基于 AI 的沉浸式职业探索平台，帮助用户通过 RPG 游戏化方式发现适合自己的职业道路。

## 架构说明

本项目采用**前后端分离 + 后端代理**架构，确保 API Key 安全：

```
[前端 React App] → [后端 API 服务器] → [Gemini API]
                          ↓
                   [JWT 认证 + 速率限制 + 内容过滤]
```

**安全特性：**
- ✅ API Key 仅存储在后端服务器环境变量
- ✅ 所有 AI 请求通过后端代理
- ✅ JWT 用户身份认证
- ✅ IP 和用户级别速率限制
- ✅ 内容安全过滤

## 本地开发

**前提条件:** Node.js 18+

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量（创建 `.env.local`）：
   ```env
   # 后端 API 服务器地址（开发环境）
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. 启动前端：
   ```bash
   npm run dev
   ```

4. 确保后端服务器已运行（参见 `backend/` 目录）

## 后端部署

后端服务器负责：
- 用户认证（JWT）
- AI API 代理（Gemini/Qwen）
- 速率限制与配额管理
- 内容安全过滤
- 使用量统计与计费

详见 [`backend/README.md`](./backend/README.md)

## 项目结构

```
Futurecraft/
├── App.tsx              # 主应用组件
├── components/          # UI 组件
├── services/
│   └── apiService.ts    # API 调用层（通过后端代理）
├── types.ts             # TypeScript 类型定义
├── backend/             # 后端服务器代码
└── FutureCraftiOS/      # iOS 原生应用
```

## iOS 应用

iOS 版本位于 `FutureCraftiOS/` 目录，使用 SwiftUI 构建。
详见 [`FutureCraftiOS/APP_STORE_CHECKLIST.md`](./FutureCraftiOS/APP_STORE_CHECKLIST.md)
