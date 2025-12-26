import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// 模拟用户存储（生产环境应使用数据库）
const users = new Map<string, {
    id: string;
    isGuest: boolean;
    region: string;
    username?: string;
    appleUserId?: string;
    creditBalance: number;
    subscriptionTier: string;
}>();

/**
 * POST /auth/apple
 * Apple 登录验证
 */
router.post('/apple', authLimiter, async (req: Request, res: Response) => {
    try {
        const { identityToken, authorizationCode, email, fullName } = req.body;

        if (!identityToken || !authorizationCode) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '缺少必要的认证信息',
            });
        }

        // TODO: 实际生产环境需要验证 Apple identity token
        // 1. 获取 Apple 的公钥
        // 2. 验证 JWT 签名
        // 3. 验证 claims (iss, aud, exp, etc.)

        // 模拟验证成功，创建或获取用户
        // 实际应该从 token 中解析 Apple user ID
        const appleUserId = `apple_${Buffer.from(identityToken).toString('base64').substring(0, 20)}`;

        let user = Array.from(users.values()).find(u => u.appleUserId === appleUserId);

        if (!user) {
            // 新用户
            user = {
                id: uuidv4(),
                isGuest: false,
                region: req.body.region || 'GLOBAL',
                username: fullName || email?.split('@')[0] || 'User',
                appleUserId,
                creditBalance: 100, // 初始赠送
                subscriptionTier: 'FREE',
            };
            users.set(user.id, user);
        }

        // 生成 Token
        const accessToken = generateToken({
            userId: user.id,
            isGuest: false,
            region: user.region,
        });

        const refreshToken = generateToken({
            userId: user.id,
            isGuest: false,
            region: user.region,
        });

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                isGuest: user.isGuest,
                region: user.region,
                username: user.username,
                avatarUrl: null,
                creditBalance: user.creditBalance,
                subscriptionTier: user.subscriptionTier,
                rpgProfile: null,
            },
        });
    } catch (error) {
        console.error('Apple login error:', error);
        res.status(500).json({
            error: 'AuthError',
            message: '登录失败，请稍后再试',
        });
    }
});

/**
 * POST /auth/guest
 * 游客登录
 */
router.post('/guest', authLimiter, async (req: Request, res: Response) => {
    try {
        const { guestId, region } = req.body;

        let user = guestId ? users.get(guestId) : null;

        if (!user) {
            // 创建新游客用户
            user = {
                id: uuidv4(),
                isGuest: true,
                region: region || 'GLOBAL',
                username: 'Guest',
                creditBalance: 20, // 游客赠送较少
                subscriptionTier: 'FREE',
            };
            users.set(user.id, user);
        }

        const accessToken = generateToken({
            userId: user.id,
            isGuest: true,
            region: user.region,
        });

        res.json({
            accessToken,
            refreshToken: accessToken, // 游客 refresh token 相同
            user: {
                id: user.id,
                isGuest: user.isGuest,
                region: user.region,
                username: user.username,
                avatarUrl: null,
                creditBalance: user.creditBalance,
                subscriptionTier: user.subscriptionTier,
                rpgProfile: null,
            },
        });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({
            error: 'AuthError',
            message: '登录失败',
        });
    }
});

/**
 * GET /auth/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = users.get(userId);

    if (!user) {
        return res.status(404).json({
            error: 'UserNotFound',
            message: '用户不存在',
        });
    }

    res.json({
        id: user.id,
        isGuest: user.isGuest,
        region: user.region,
        username: user.username,
        avatarUrl: null,
        creditBalance: user.creditBalance,
        subscriptionTier: user.subscriptionTier,
        rpgProfile: null,
    });
});

/**
 * POST /auth/refresh
 * 刷新 Token
 */
router.post('/refresh', authMiddleware, (req: Request, res: Response) => {
    const newToken = generateToken({
        userId: req.user!.userId,
        isGuest: req.user!.isGuest,
        region: req.user!.region,
    });

    res.json({ accessToken: newToken });
});

export default router;

