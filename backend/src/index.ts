import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/user.js';
import iapRoutes from './routes/iap.js';

const app = express();

// ===========================================
// 安全中间件
// ===========================================

// Helmet: 设置安全相关的 HTTP 头
app.use(helmet());

// CORS: 跨域配置
app.use(cors({
    origin: config.isDev
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : ['https://futurecraft.app', 'https://www.futurecraft.app', 'https://gaokao-review.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 请求体解析
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 通用速率限制
app.use(generalLimiter);

// 请求日志（开发环境）
if (config.isDev) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// ===========================================
// 路由
// ===========================================

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/user', userRoutes);
app.use('/iap', iapRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        error: 'NotFound',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'InternalError',
        message: config.isDev ? err.message : '服务器内部错误',
    });
});

// ===========================================
// 启动服务器
// ===========================================

app.listen(config.port, () => {
    console.log(`
🚀 FutureCraft Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 http://localhost:${config.port}
🌍 Environment: ${config.nodeEnv}
🔒 Gemini API: ${config.gemini.apiKey ? '✓ Configured' : '✗ Missing'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;

