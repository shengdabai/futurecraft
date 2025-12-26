import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage
const users = new Map();
const sessions = new Map();
let userIdCounter = 1;

// Simple token gen
function generateToken(userId: string) {
  const token = `token_${Date.now()}_${userId}`;
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path || '';

  console.log(`Incoming request: ${req.method} /api/${endpoint}`);

  try {
    // Health check
    if (endpoint === 'health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        endpoint: '/api/health'
      });
    }

    // Simple registration - just accept any username
    if (endpoint === 'register' && req.method === 'POST') {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: '用户名和密码是必填项' }
        });
      }

      const userId = `user_${userIdCounter++}`;
      const userData = {
        username,
        id: userId,
        type: 'regular'
      };

      users.set(userId, userData);
      const token = generateToken(userId);

      return res.status(201).json({
        success: true,
        data: {
          userId,
          username,
          token,
          type: 'regular'
        }
      });
    }

    // Simple login
    if (endpoint === 'login' && req.method === 'POST') {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: '用户名是必填项' }
        });
      }

      // Find user by username (not ideal but works for demo)
      let userData = null;
      for (const [id, user] of users) {
        if (user.username === username) {
          userData = user;
          break;
        }
      }

      if (!userData) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: '用户不存在' }
        });
      }

      const token = generateToken(userData.id);

      return res.status(200).json({
        success: true,
        data: {
          userId: userData.id,
          username: userData.username,
          token,
          type: 'regular'
        }
      });
    }

    // Guest registration
    if (endpoint === 'auth/guest' && req.method === 'POST') {
      const userId = `guest_${Date.now()}`;
      const guestName = `游客${userIdCounter++}`;

      const guestData = {
        username: guestName,
        id: userId,
        type: 'guest',
        credits: 100
      };

      users.set(userId, guestData);
      const token = generateToken(userId);

      return res.status(200).json({
        success: true,
        data: {
          userId,
          username: guestName,
          token,
          type: 'guest'
        }
      });
    }

    // Default soul scan
    if (endpoint === 'ai/soul-scan' && req.method === 'POST') {
      const { language } = req.body || {};
      const isCN = language === 'zh';

      return res.status(200).json({
        stats: {
          creativity: 75,
          logic: 80,
          leadership: 60,
          stamina: 70,
        },
        archetype: isCN ? "探索者型" : "Explorer Type",
        careers: [
          {
            title: isCN ? "数据分析师" : "Data Analyst",
            description: isCN ? "适合逻辑思维强的你" : "Perfect for logical thinking",
            matchScore: 85,
            growth: 90,
            salary: "15-25K"
          },
          {
            title: isCN ? "产品经理" : "Product Manager",
            description: isCN ? "综合能力和创新思维匹配" : "Matches comprehensive skills",
            matchScore: 78,
            growth: 88,
            salary: "18-30K"
          }
        ]
      });
    }

    // Get user info (basic)
    if (endpoint === 'auth/me' && req.method === 'GET') {
      const auth = req.headers.authorization?.replace('Bearer ', '');
      if (!auth) {
        return res.status(401).json({ success: false, error: { message: '需要认证' } });
      }

      const session = sessions.get(auth);
      if (!session) {
        return res.status(401).json({ success: false, error: { message: '无效令牌' } });
      }

      const user = users.get(session.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: { message: '用户不存在' } });
      }

      return res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          username: user.username,
          type: user.type,
          credits: user.credits || 0
        }
      });
    }

    // No such endpoint
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'API 端点不存在' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || '服务器内部错误' }
    });
  }
}