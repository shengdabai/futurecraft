# 🎮 FutureCraft 技术方案 (v2.0)

> **版本**: v2.0  
> **日期**: 2024年12月  
> **状态**: 方案确认中  
> **核心变更**: 单云架构 (GCP Tokyo)、Gemini 2.5 Flash、无 ICP 策略 (教育类目)

---

## 📋 目录

1. [项目概述与合规策略](#1-项目概述与合规策略)
2. [关键决策矩阵](#2-关键决策矩阵)
3. [系统架构 (Single Cloud)](#3-系统架构-single-cloud)
4. [核心业务流程 (Visualized)](#4-核心业务流程-visualized)
5. [后端技术方案](#5-后端技术方案)
6. [客户端与 UI 原型](#6-客户端与-ui-原型)
7. [AI 模型与成本](#7-ai-模型与成本)
8. [开发与发布路线](#8-开发与发布路线)

---

## 1. 项目概述与合规策略

### 1.1 产品定义
**FutureCraft** 是一款 **"AI 驱动的职业探索与教育平台"**。
虽然内核具有 RPG 元素 (属性扫描、模拟、Boss战)，但在 App Store 分类和对外宣发中，严定位于 **"Education (教育)"** 或 **"Lifestyle (生活)"** 类目。

### 1.2 核心合规策略 (针对中国市场)

| 风险点 | 应对策略 | 实施细节 |
|:---|:---|:---|
| **游戏版号 (ISBN)** | **去游戏化包装** | App Store 分类选 "Education"。UI 避免出现 "Game", "Player", "Level" 等显性游戏词汇，改用 "Explorer", "Growth", "Career Path"。 |
| **ICP 备案** | **境外运营模式** | 服务器部署在 GCP 东京（非中国大陆），不进行 ICP 备案。通过 HTTPS 跨境服务。 |
| **IAP 支付** | **教育订阅/服务** | 内购项目描述为 "Premium Career Report" (职业报告) 或 "AI Tutor Access" (导师服务)，而非 "Game Currency"。 |
| **网络延迟** | **东京节点 + CDN** | GCP 东京节点对中国大陆 ping 值通常在 40-80ms，对于非实时竞技应用完全足够。Cloudflare 优化路由。 |

---

## 2. 关键决策矩阵

| 维度 | 决策 | 理由 |
|:---|:---|:---|
| **云架构** | **Single Cloud (GCP Tokyo)** | 舍弃双云。单云维护成本最低，东京节点兼顾全球与中国访问速度。 |
| **AI 模型** | **Gemini 2.5 Flash** | 速度极快，成本极低 ($0.075/1M)，且足够处理逻辑和对话，适合高频交互。 |
| **开发模式** | **独立开发 (Full Stack)** | 后端 NestJS + 前端 SwiftUI。一人全栈，减少沟通成本。 |
| **数据隐私** | **本地优先 + 最小化上传** | 敏感个人信息 (如真实姓名) 尽量留存本地或加密，仅上传画像分析所需数据。 |
| **发布渠道** | **App Store (Global)** | 统一上架 Global 区（含中国区）。利用 Apple 提供的全球分发能力。 |

---

## 3. 系统架构 (Single Cloud)

### 3.1 架构图 (ASCII)

```
                                  [ User Devices ]
                               CN Users      Global Users
                                   │              │
                                   ▼              ▼
                        ┌────────────────────────────────────┐
                        │      Cloudflare (DNS & Edge)       │
                        │    * 智能路由  * 抗 DDoS  * SSL     │
                        └──────────────────┬─────────────────┘
                                           │ HTTPS / WSS
                                           ▼
+----------------------------------- GCP (Tokyo Region) -----------------------------------+
|                                                                                          |
|    +-------------------+       +------------------------+       +-------------------+    |
|    |  Cloud Run (API)  |<----->|  Gemini 2.5 Flash API  |       |   Cloud Storage   |    |
|    |  (NestJS Node 20) |       |  (Vertex AI / Studio)  |       |   (User Assets)   |    |
|    +--------+----------+       +------------------------+       +-------------------+    |
|             │                                                                            |
|             │ (Prisma ORM)                                                               |
|             ▼                                                                            |
|    +-------------------+       +------------------------+                                |
|    |  Cloud SQL (DB)   |       |    Redis (Optional)    |                                |
|    |   (PostgreSQL)    |       |    (Cache / Queue)     |                                |
|    +-------------------+       +------------------------+                                |
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

### 3.2 为什么选择 GCP Tokyo?
*   **地理位置**: 距离上海约 1700km，物理延迟低。
*   **网络质量**: GCP 拥有顶级的全球骨干网 (Premium Network Tier)，从中国访问丢包率远低于普通线路。
*   **服务集成**: 它是 Gemini 模型的一级部署地，后端调用 AI 也是内网速度，无额外延迟。

---

## 4. 核心业务流程 (Visualized)

### 4.1 核心循环: Soul Scan → Career Match → Simulation

```mermaid
graph TD
    User([用户]) -->|输入| Profile[个人画像\n(专业/爱好/隐藏天赋)]
    Profile -->|API 请求| AI_Scan[AI Soul Scan\n(Gemini Flash)]
    
    AI_Scan -->|生成| Archetype[RPG 原型\n(e.g. 'Data Ninja')]
    AI_Scan -->|推荐| JobMap[职业地图\n(3个方向, 9个职业)]
    
    JobMap -->|选择职业| Sim_Start[开启模拟\n(Life Simulation)]
    
    subgraph Simulation Loop [模拟循环]
        direction TB
        Sim_Start --> Scene[场景生成]
        Scene -->|用户决策| Choice[做出选择]
        Choice -->|AI 判定| Feedback[结果反馈]
        Feedback -->|更新| Attributes[属性变化\n(压力/财富/技能)]
        Attributes --> Scene
    end
    
    Attributes -->|Game Over/Win| Report[生成完整报告]
    Report -->|解锁| SkillTree[技能树]
    Report -->|解锁| Tutor[AI 导师]
    
    style AI_Scan fill:#e1f5fe,stroke:#01579b
    style Archetype fill:#f3e5f5,stroke:#4a148c
    style Sim_Start fill:#e8f5e9,stroke:#1b5e20
```

### 4.2 积分消耗流程

| 动作 | 消耗 | 触发时机 | 备注 |
|:---|:---:|:---|:---|
| **Soul Scan** | 2 | 点击 "Analyze Me" | 消耗 Token 最多，价值感最强 |
| **Start Sim** | 3 | 进入职业模拟器 | 核心玩法，时长 5-10 分钟 |
| **Ask Tutor** | 1 | 发送导师消息 | 每次对话扣除，防止滥用 |
| **TTS Play** | 1 | 点击播放语音 | 音频生成成本 |

---

## 5. 后端技术方案

### 5.1 Tech Stack
*   **Framework**: NestJS (v10) - 模块化，易于维护。
*   **Language**: TypeScript - 类型安全。
*   **Database**: PostgreSQL (via Prisma ORM)。
*   **Deploy**: Docker -> Google Cloud Run (Serverless，按请求计费，0请求0成本)。

### 5.2 API 结构 (Simplified)

```typescript
// 模块划分
app.module.ts
├── AuthModule       // Apple Sign In, Guest Login
├── CareerModule     // Soul Scan, Job Mapping
├── SimModule        // Simulation Logic
├── TutorModule      // Chat with AI Mentor
└── PayModule        // IAP Verification, Credits
```

### 5.3 数据库模型 (Core)

```prisma
model User {
  id            String   @id @default(uuid())
  appleId       String?  @unique
  credits       Int      @default(10) // 初始赠送
  isPro         Boolean  @default(false)
  
  careers       CareerPath[]
  simulations   SimSession[]
}

model CareerPath {
  id            String   @id
  userId        String
  jobTitle      String   // e.g. "Full Stack Dev"
  archetype     String   // e.g. "Code Weaver"
  matchScore    Int
  
  // JSON 存储 AI 生成的结构化数据，避免频繁改表
  aiData        Json     
}
```

---

## 6. 客户端与 UI 原型

### 6.1 页面流 (Mockup)

**Screen 1: Soul Scan (Input)**
```text
+--------------------------------+
|  [ FUTURE CRAFT ]              |
|                                |
|  Tell us about yourself...     |
|                                |
|  Major:  [ Comp Sci      ]     |
|  Hooby:  [ Guitar, Scifi ]     |
|  Secret: [ I love cats   ]     |
|                                |
|        ( O ) Scan Soul         |
|      (Cost: 2 Credits)         |
+--------------------------------+
```

**Screen 2: The Map (Result)**
```text
+--------------------------------+
|  User: Cyber Bard (Lv.1)       |
|  [Attributes: INT 80 / CHR 60] |
|                                |
|      [ AI Engineer ]           |
|           |                    |
|      [ Tech Evangelist ]       |
|           |                    |
|      [ Indie Maker ]           |
|                                |
|   [Tap node to simulate]       |
+--------------------------------+
```

**Screen 3: Simulation (Chat)**
```text
+--------------------------------+
| [Job: Tech Evangelist]         |
|                                |
| 🤖 Boss: "The demo is broken!" |
| "Client is here in 5 mins."    |
|                                |
| [A] Fix it live (Risk: High)   |
| [B] Fake it with video         |
| [C] Blame the WiFi             |
|                                |
| Stats: [HP: 80%] [Stress: 20%] |
+--------------------------------+
```

### 6.2 关键 UI 技术
*   **SwiftUI**: 100% 原生开发。
*   **Animations**: 使用 lottie-ios 或 SwiftUI 原生动画增加"科技感" (e.g., 扫描时的雷达效果)。
*   **Haptics**: 大量使用触感反馈 (CoreHaptics) 增强交互沉浸感。

---

## 7. AI 模型与成本

### 7.1 模型选型: Gemini 2.5 Flash
*   **优势**: 在处理长 Context (如完整的职业报告) 时依然极其便宜。响应速度比 Pro 快 40%，非常适合 App 交互。
*   **System Prompt 策略**: 将核心游戏规则 (Game Master Rules) 写入 System Prompt，降低每次用户交互的 Token 消耗。

### 7.2 成本测算 (Updated)

| 项目 | 当量/月 | 预估成本 (USD) |
|:---|:---|:---|
| **Cloud Run** | 10k 请求 | ~$2.00 (免费额度覆盖大部分) |
| **Cloud SQL** | Micro 实例 | ~$9.00 (这是固定的大头) |
| **Gemini Flash** | 5M Tokens | ~$0.40 (极低!) |
| **App Store** | 年费 | $8.25 (摊销) |
| **Total** | | **~$20.00 / 月** |

> **结论**: 使用 Flash 模型后，AI 成本几乎可以忽略不计。主要的固定成本是数据库。前期甚至可以用 Supabase (Free Tier) 替代 Cloud SQL 进一步降低成本到 $0。

---

## 8. 开发与发布路线

### Phase 1: MVP (W1-W3)
*   [ ] 搭建 GCP Project & NestJS 框架
*   [ ] 实现 Soul Scan 流程 (Gemini Flash)
*   [ ] iOS基本UI架构
*   **目标**: 跑通 "输入 -> AI分析 -> 展示结果" 闭环。

### Phase 2: Core Loop (W4-W6)
*   [ ] 职业模拟器 (Simulation) 开发
*   [ ] 积分系统 (数据库层面)
*   [ ] 用户账户系统 (Apple Sign In)
*   **目标**: 这里是 "好玩" 的关键，需要大量调试 AI Prompt。

### Phase 3: Commercial & Polish (W7-W8)
*   [ ] IAP 内购接入 (StoreKit 2)
*   [ ] 隐私政策/服务条款写成 (适用于教育类)
*   [ ] App Store 素材制作
*   [ ] 提审
*   **目标**: 上架并产生第一笔收入。

---

> **待确认**:
> 如果您同意这个 v2.0 方案（特别是单云和教育类目策略），我们可以直接开始 Phase 1 的代码搭建。
