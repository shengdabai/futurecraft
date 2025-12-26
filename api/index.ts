import type { VercelRequest, VercelResponse } from '@vercel/node';

// 内存中的用户数据存储
const users = new Map<string, any>();
const sessions = new Map<string, any>();
let userIdCounter = 1;

// 生成token函数
function generateToken(user: any): string {
  const token = `token_${Date.now()}_${user.id}`;
  sessions.set(token, {
    userId: user.id,
    createdAt: Date.now()
  });
  return token;
}

// 验证token
function verifyToken(token: string): any {
  if (!token) return null;
  return sessions.get(token);
}

// 安全头设置
function setSecurityHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gaokao-review.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    setSecurityHeaders(res);
    res.status(200).end();
    return;
  }

  // 设置安全头
  setSecurityHeaders(res);

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path || '';

  console.log('API Request:', req.method, endpoint);

  try {
    // 健康检查
    if (endpoint === 'health' && req.method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoint: '/api/health'
      });
    }

    // 苹果登录
    if (endpoint === 'auth/apple' && req.method === 'POST') {
      const { identityToken, authorizationCode } = req.body;

      if (!identityToken || !authorizationCode) {
        return res.status(400).json({
          error: 'InvalidRequest',
          message: '缺少身份验证信息'
        });
      }

      // 模拟苹果用户
      const userId = `apple_${Date.now()}`;
      const user = {
        id: userId,
        type: 'apple',
        name: 'Apple 用户',
        credits: 100,
        createdAt: new Date().toISOString()
      };

      users.set(userId, user);
      const token = generateToken(user);

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          credits: user.credits
        }
      });
    }

    // 游客登录
    if (endpoint === 'auth/guest' && req.method === 'POST') {
      const guestName = `游客${userIdCounter++}`;
      const userId = `guest_${Date.now()}`;

      const user = {
        id: userId,
        type: 'guest',
        name: guestName,
        credits: 100,
        createdAt: new Date().toISOString()
      };

      users.set(userId, user);
      const token = generateToken(user);

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          credits: user.credits
        }
      });
    }

    // 获取用户信息
    if (endpoint === 'auth/me' && req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const session = verifyToken(token);

      if (!session) {
        return res.status(401).json({
          error: 'InvalidToken',
          message: '无效的访问令牌'
        });
      }

      const user = users.get(session.userId);
      if (!user) {
        return res.status(404).json({
          error: 'UserNotFound',
          message: '用户不存在'
        });
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        credits: user.credits,
        type: user.type
      });
    }

    // AI 功能 - Soul Scan
    if (endpoint === 'ai/soul-scan' && req.method === 'POST') {
      const { language } = req.body;

      return res.status(200).json({
        stats: {
          creativity: 80,
          logic: 70,
          leadership: 60,
          stamina: 75,
        },
        archetype: language === 'zh' ? "探索者型" : "Explorer Type",
        careers: [
          {
            title: language === 'zh' ? "数据分析师" : "Data Analyst",
            description: language === 'zh' ? "适合逻辑思维强的你" : "Perfect for your logical thinking",
            matchScore: 85,
            growth: 90,
            salary: "15-25K"
          },
          {
            title: language === 'zh' ? "产品经理" : "Product Manager",
            description: language === 'zh' ? "综合能力和创新思维匹配" : "Matches your comprehensive skills",
            matchScore: 78,
            growth: 88,
            salary: "18-30K"
          }
        ]
      });
    }

    // AI 功能 - 获取学习资源
    if (endpoint === 'ai/skill-tree' && req.method === 'POST') {
      const { language } = req.body;

      return res.status(200).json([
        {
          id: '1',
          title: language === 'zh' ? '基础编程技能' : 'Basic Programming',
          description: language === 'zh' ? '学习Python基础' : 'Learn Python basics',
          type: 'course',
          url: 'https://example.com/python-course',
          duration: '30小时',
          difficulty: '初级'
        },
        {
          id: '2',
          title: language === 'zh' ? '算法与数据结构' : 'Algorithms & Data Structures',
          description: language === 'zh' ? '掌握核心算法概念' : 'Master core algorithm concepts',
          type: 'book',
          url: 'https://example.com/algorithms-book',
          duration: '40小时',
          difficulty: '中级'
        }
      ]);
    }

    // AI 聊天
    if (endpoint === 'ai/chat' && req.method === 'POST') {
      const { history, message, language } = req.body;

      // 简单的响应逻辑
      let response;
      if (message.toLowerCase().includes('hello') || message.includes('你好')) {
        response = language === 'zh' ? '你好！我是您的 AI 导师，有什么可以帮助您的？' : 'Hello! I am your AI tutor. How can I help you?';
      } else {
        response = language === 'zh'
          ? '感谢您的提问。这是一个很棒的问题，让我为您详细解答...'
          : 'Thank you for your question. This is a great question, let me explain it in detail for you...';
      }

      return res.status(200).json({ message: response });
    }

    // 获取使用情况
    if (endpoint === 'user/usage' && req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const session = verifyToken(token);

      if (!session) {
        return res.status(401).json({
          error: 'InvalidToken',
          message: '需要登录'
        });
      }

      return res.status(200).json({
        totalTokensUsed: 50,
        totalCreditsUsed: 25,
        remainingCredits: 75,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // 未找到路由
    return res.status(404).json({
      error: 'NotFound',
      message: `无法找到 ${req.method} ${endpoint}`
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: process.env.NODE_ENV === 'development'
        ? (error as Error).message
        : '服务器内部错误'
    });
  }
}