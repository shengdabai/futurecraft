# 🚀 部署指南 - 修复注册问题

## 📌 问题分析

您的 Vercel 部署存在以下问题：
1. **CORS 跨域问题**：后端仅允许 futurecraft.app 域名
2. **环境变量缺失**：缺少必要的生产环境配置
3. **API 端点未找到**：后端服务未正确部署

## 📝 修复步骤

### 1. 前端部署配置 (✅ 已完成)

已创建 `vercel.json` 配置文件：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. 后端 CORS 配置 (✅ 已完成)

已更新 `backend/src/index.ts` 允许您的 Vercel 域名：
```javascript
// 现在支持您的 Vercel 域名
origins = ['https://futurecraft.app', 'https://www.futurecraft.app', 'https://gaokao-review.vercel.app']
```

### 3. 生产环境变量 (✅ 已完成)

已创建 `.env.production` 文件：
```
VITE_API_BASE_URL=https://gaokao-review.vercel.app/api
```

⚠️ **重要提示**：您需要在 Vercel 控制台中设置后端环境变量：
```
JWT_SECRET=您的一个32位以上的随机字符串
GEMINI_API_KEY=您的Gemini API密钥
NODE_ENV=production
```

### 4. 后端部署建议

由于 Vercel 前端部署和 Node.js 后端需要分开部署，您有以下几种选择：

#### 方案 A: 使用 Vercel Functions 部署后端
1. 修改 `backend/package.json` 添加：
```json
"scripts": {
  "build": "tsc"
}
```

2. 部署整个项目（包含前后端）到 Vercel

#### 方案 B: 使用其他服务部署后端（推荐）
使用 Railway, Render, 或 Fly.io 等支持 Node.js 的服务部署后端

#### 方案 C: 简化方案 - 临时使用模拟数据
如果仅用于演示，可以暂时使用本地存储模拟用户数据

## 🧪 测试步骤

1. **部署前端到 Vercel**
2. **设置后端环境变量**
3. **测试注册功能**：
   - Apple 登录：点击 Apple Sign-In
   - 游客登录：使用 Guest Mode
4. **验证 API 连接**：检查浏览器开发者工具中的网络请求

## 🔧 下一步操作

1. 确认您选择的后端部署方案
2. 设置后端环境变量（非常重要）
3. 重新部署前端
4. 测试注册功能

## 📋 需要的环境变量

### 必需变量：
- `JWT_SECRET`: 至少32字符的随机字符串
- `GEMINI_API_KEY`: Google AI Studio API密钥（必需）
- `NODE_ENV`: 设为 "production"

### 可选变量：
- `PORT`: 默认为 8080
- 其他配置项使用默认值即可

## 🆘 如果仍有问题的解决方案

1. **检查浏览器控制台错误日志**
2. **确认 API 端点可达**：访问 `https://您的后端地址/health`
3. **验证 JWT Secret**: 长度必须 ≥32字符
4. **检查 Gemini API Key**: 确保已启用正确的 API

需要我帮您完成特定的部署步骤吗？请告诉我您的选择！