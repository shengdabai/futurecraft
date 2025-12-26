# FutureCraft iOS - App Store 上架清单

## ✅ 已完成的修复

### 1. 隐私清单 (PrivacyInfo.xcprivacy)
- [x] 已创建 `PrivacyInfo.xcprivacy`
- [x] 声明收集的数据类型：用户 ID、邮箱、照片/视频、用户内容
- [x] 声明使用的 API：UserDefaults
- [x] 声明不进行跟踪

### 2. Sign in with Apple
- [x] 使用原生 `SignInWithAppleButton`
- [x] 实现完整的 Apple 登录流程
- [x] 处理错误和取消情况
- [x] 向后端发送 identity token 验证

### 3. Keychain 安全存储
- [x] 创建 `KeychainManager` 安全存储 Token
- [x] Access Token / Refresh Token 存储在 Keychain
- [x] 不在 UserDefaults 存储敏感信息
- [x] 登出时清除所有 Token

### 4. IAP 购买系统
- [x] 使用 StoreKit 2 API
- [x] 实现产品加载 `Product.products(for:)`
- [x] 实现购买流程 `product.purchase()`
- [x] 实现交易验证 `Transaction.verification`
- [x] 实现恢复购买 `AppStore.sync()`
- [x] 监听交易更新
- [x] 向后端同步购买状态

### 5. AI 服务安全
- [x] 移除客户端 API Key
- [x] 所有 AI 请求通过后端代理
- [x] 请求携带用户认证 Token
- [x] 处理各种错误情况

### 6. 启动屏与配置
- [x] 配置 `UILaunchScreen`
- [x] 添加 `ITSAppUsesNonExemptEncryption = false`
- [x] 配置 iPad 横屏支持
- [x] 设置深色模式

### 7. Entitlements
- [x] Sign in with Apple capability
- [x] In-App Purchase capability

---

## 📋 上架前必做事项

### 在 Xcode 中配置

1. **打开项目设置**
   - Target → Signing & Capabilities
   - 选择 Team: `2G3QPD2Q32`
   - Bundle Identifier: `com.zturns.futurecraft`

2. **添加 Capabilities**
   - 点击 `+ Capability`
   - 添加 `Sign in with Apple`
   - 添加 `In-App Purchase`

3. **添加 Entitlements 文件**
   - 将 `FutureCraftiOS.entitlements` 添加到项目
   - 在 Build Settings → Code Signing Entitlements 中指定路径

4. **添加 PrivacyInfo.xcprivacy**
   - 将文件拖入 Xcode 项目
   - 确保 Target Membership 已勾选

### 在 App Store Connect 中配置

1. **创建 App**
   - Bundle ID: `com.zturns.futurecraft`
   - SKU: `futurecraft-ios`

2. **创建 IAP 产品**
   - `com.zturns.futurecraft.sub.monthly` (自动续订订阅 - 月付)
   - `com.zturns.futurecraft.sub.yearly` (自动续订订阅 - 年付)
   - `com.zturns.futurecraft.points.250` (消耗型 - 250点)
   - `com.zturns.futurecraft.points.600` (消耗型 - 600点)
   - `com.zturns.futurecraft.points.1400` (消耗型 - 1400点)

3. **填写 App 隐私**
   - 数据类型：联系信息(邮箱)、标识符(用户ID)、用户内容
   - 用途：App 功能
   - 不进行跟踪

4. **准备截图**
   - iPhone 6.7" (1290 x 2796)
   - iPhone 6.5" (1284 x 2778)
   - iPhone 5.5" (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)

5. **填写 App 信息**
   - 名称、副标题、描述
   - 关键词
   - 支持 URL
   - 隐私政策 URL
   - 年龄分级

### 后端 API 配置

需要确保以下 API 端点可用：

```
POST /auth/apple        # Apple 登录验证
POST /auth/guest        # 游客登录
GET  /auth/me           # 获取当前用户
POST /ai/soul-scan      # RPG 属性分析
POST /ai/chat           # AI 对话
POST /ai/simulation     # 生成模拟场景
POST /ai/simulation/evaluate  # 评估模拟选择
POST /ai/skill-tree     # 生成技能树
POST /iap/verify-purchase     # 验证 IAP 购买
POST /iap/sync-subscription   # 同步订阅状态
```

### 测试清单

- [ ] Sign in with Apple 完整流程
- [ ] 游客模式登录
- [ ] 重启 App 自动恢复会话
- [ ] 退出登录后清除状态
- [ ] IAP 沙盒购买测试
- [ ] IAP 恢复购买测试
- [ ] AI 功能正常响应
- [ ] UGC 发帖功能
- [ ] 相机/相册权限请求
- [ ] 断网情况处理
- [ ] 深色模式显示正常

---

## ⚠️ 常见拒审原因

1. **登录功能不可用** - 确保 Sign in with Apple 正常工作
2. **IAP 无法购买** - 确保产品 ID 与 Connect 一致
3. **功能崩溃** - 充分测试所有功能
4. **隐私政策缺失** - 提供有效的隐私政策 URL
5. **UGC 无审核机制** - 确保后端有内容审核
6. **元数据不符** - 截图和描述与实际功能一致

---

## 📱 提交步骤

1. `Product → Archive`
2. `Distribute App → App Store Connect`
3. 选择证书和描述文件
4. 上传成功后在 Connect 提交审核
5. 填写审核备注（测试账号等）

