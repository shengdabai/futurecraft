# FutureCraft iOS App Store 上架完整指南

## ✅ 已完成的代码优化

### 1. API Key 安全
- [x] 删除所有客户端 Gemini API Key 引用
- [x] 创建后端代理服务架构
- [x] 前端所有 AI 请求通过后端代理

### 2. 后端服务 (`backend/`)
- [x] Express.js 服务器框架
- [x] JWT 用户身份认证
- [x] IP + 用户级别速率限制
- [x] 内容安全过滤（敏感词检测）
- [x] 使用量统计与计费系统
- [x] IAP 购买验证接口

### 3. iOS 原生应用 (`FutureCraftiOS/`)
- [x] 隐私清单 (PrivacyInfo.xcprivacy)
- [x] Sign in with Apple 完整实现
- [x] Keychain 安全存储 Token
- [x] StoreKit 2 IAP 购买系统
- [x] 启动屏与权限配置

---

## 📋 上架前必做事项

### 第一步：获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录你的 Google 账号
3. 点击 **"Create API Key"**
4. 选择或创建 Google Cloud 项目
5. 复制生成的 API Key
6. **仅存储在后端服务器的 `.env` 文件中**

```env
GEMINI_API_KEY=AIzaSy...你的密钥...
```

⚠️ **重要**：
- 永远不要将 API Key 提交到 Git
- 不要在 iOS/Web 客户端代码中使用
- 建议在 Google Cloud Console 设置配额限制

### 第二步：部署后端服务

1. **本地测试**
   ```bash
   cd backend
   npm install
   cp env.example.txt .env
   # 编辑 .env 填入 Gemini API Key 和 JWT Secret
   npm run dev
   ```

2. **生产部署选项**

   **选项 A: Google Cloud Run (推荐)**
   ```bash
   # 安装 gcloud CLI 后
   gcloud run deploy futurecraft-api \
     --source . \
     --region asia-northeast1 \
     --allow-unauthenticated \
     --set-env-vars "GEMINI_API_KEY=xxx,JWT_SECRET=xxx"
   ```

   **选项 B: Vercel (Serverless)**
   - 将 `backend/src` 转换为 Vercel Serverless Functions

   **选项 C: Railway / Render**
   - 连接 GitHub 仓库自动部署

3. **更新客户端 API 地址**
   
   iOS (`Constants.swift`):
   ```swift
   static let globalBaseURL = "https://your-backend-domain.com"
   ```
   
   Web (`.env.local`):
   ```env
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```

### 第三步：App Store Connect 配置

1. **创建 App**
   - Bundle ID: `com.zturns.futurecraft`
   - SKU: `futurecraft-ios-1`

2. **创建 IAP 产品**

   | Product ID | 类型 | 价格建议 |
   |------------|------|----------|
   | `com.zturns.futurecraft.sub.monthly` | 自动续订订阅 | ¥18/月 |
   | `com.zturns.futurecraft.sub.yearly` | 自动续订订阅 | ¥128/年 |
   | `com.zturns.futurecraft.points.250` | 消耗型 | ¥6 |
   | `com.zturns.futurecraft.points.600` | 消耗型 | ¥12 |
   | `com.zturns.futurecraft.points.1400` | 消耗型 | ¥25 |

3. **填写 App 隐私**
   
   收集的数据类型：
   - ✅ 联系信息（邮箱 - 用于账户）
   - ✅ 标识符（用户 ID - 用于 App 功能）
   - ✅ 用户内容（帖子/评论 - 用于 App 功能）
   - ✅ 照片或视频（UGC - 用于 App 功能）
   
   用途：App 功能
   追踪：否

4. **准备素材**

   **App 图标**：
   - 1024x1024 PNG（无透明度）
   
   **截图**：
   - iPhone 6.7" (1290 x 2796) - 至少 3 张
   - iPhone 6.5" (1284 x 2778) - 至少 3 张
   - iPhone 5.5" (1242 x 2208) - 至少 3 张
   - iPad Pro 12.9" (2048 x 2732) - 至少 3 张（如果支持 iPad）

   **描述**：
   ```
   FutureCraft - AI 驱动的职业探索 RPG

   🎮 游戏化职业规划
   通过 RPG 角色扮演的方式探索你的未来职业道路。AI 会根据你的兴趣、专业和隐藏才能生成专属的"赛博朋克原型"角色。

   🔮 AI 灵魂扫描
   填写简单问卷，AI 分析你的 RPG 属性值（智力、创造力、魅力、技术力等），推荐最匹配的职业方向。

   🎯 人生模拟器
   体验各职业的"第一天工作"场景，通过选择不同选项，看看你能否成功适应这个职业。

   📚 技能树
   AI 为你定制专属学习路径，推荐书籍、视频、GitHub 项目等高质量资源。

   🤖 AI 导师
   随时与 AI 导师对话，采用苏格拉底式教学法帮助你深入理解职业知识。

   ⚔️ Boss 战
   挑战模拟面试，在高压环境下测试你的专业知识和应变能力。

   隐私优先，数据安全。
   ```

   **关键词**：
   ```
   职业规划,AI,人工智能,RPG,游戏,职业测试,就业,求职,学习,技能,面试,模拟,导师,教育
   ```

### 第四步：Xcode 配置

1. **打开项目**
   ```
   FutureCraftiOS/FutureCraftiOS.xcodeproj
   ```

2. **配置签名**
   - Target → Signing & Capabilities
   - Team: 选择你的开发者账号
   - Bundle Identifier: `com.zturns.futurecraft`

3. **添加 Capabilities**
   - 点击 `+ Capability`
   - 添加 `Sign in with Apple`
   - 添加 `In-App Purchase`

4. **添加文件到项目**
   - 将 `PrivacyInfo.xcprivacy` 拖入 Xcode
   - 将 `FutureCraftiOS.entitlements` 拖入 Xcode
   - 确保 Target Membership 已勾选

5. **添加 App 图标**
   - 打开 `Assets.xcassets`
   - 选择 `AppIcon`
   - 拖入 1024x1024 图标

### 第五步：测试

1. **真机测试**
   - 连接 iPhone，选择真机 Target
   - Product → Run

2. **功能测试清单**
   - [ ] Sign in with Apple 登录成功
   - [ ] 游客模式可用
   - [ ] 重启 App 自动恢复登录
   - [ ] 退出登录后清除状态
   - [ ] Soul Scan AI 分析正常
   - [ ] 模拟器场景正常
   - [ ] AI 导师对话正常
   - [ ] IAP 沙盒购买（需 TestFlight）
   - [ ] 相机/相册权限提示
   - [ ] 断网情况有友好提示

3. **TestFlight 测试**
   - Archive → Distribute App → TestFlight
   - 邀请测试人员测试 IAP

### 第六步：提交审核

1. **Archive**
   - Product → Archive
   - 等待构建完成

2. **上传**
   - Organizer → Distribute App → App Store Connect
   - 选择证书和描述文件
   - 上传

3. **在 Connect 提交**
   - 填写审核备注
   - 提供测试账号（如需要）
   - 点击提交审核

### 审核备注模板

```
FutureCraft 是一款 AI 驱动的职业探索应用。

主要功能：
1. AI Soul Scan：通过用户输入的兴趣和专业，生成 RPG 角色属性和职业推荐
2. Life Simulator：模拟职业的第一天工作场景
3. AI Tutor：提供苏格拉底式职业辅导对话

技术说明：
- AI 功能通过我们的后端服务器调用 Google Gemini API
- 不在客户端存储或暴露任何 API 密钥
- 所有 AI 请求经过内容安全过滤

测试账号：
- 可使用 Sign in with Apple 或游客模式

IAP 说明：
- 订阅解锁更多 AI 对话次数和高级功能
- 点数用于消耗型 AI 请求
```

---

## ⚠️ 常见拒审原因及解决

| 拒审原因 | 解决方案 |
|----------|----------|
| Sign in with Apple 不工作 | 确保在 Capabilities 中启用，真机测试 |
| IAP 无法购买 | 确保 Product ID 与 Connect 一致，使用沙盒账号测试 |
| 功能崩溃 | 充分测试，查看 Crashlytics 日志 |
| 隐私政策缺失 | 提供有效的隐私政策 URL |
| UGC 无审核 | 确保后端有内容审核，提供举报入口 |
| 元数据不符 | 截图和描述与实际功能一致 |
| 登录后无内容 | 确保后端服务可用，有合理的加载状态 |

---

## 📞 支持

如有问题，请参考：
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google AI Studio](https://aistudio.google.com/)

