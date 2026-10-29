import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as userRepo from '../db/userRepository.js';

const router = Router();
router.use(authMiddleware);

// Fail closed until Apple-signed transaction data is authenticated and checked
// for bundle, product, account ownership, revocation, expiry and replay.
// Credits must come from a server-owned product catalog, never request.points.
// An App Store HTTP 200 response alone is insufficient purchase evidence.
const verificationUnavailable = (_req: Request, res: Response) => res.status(503).json({
    error: 'VerificationUnavailable',
    message: '购买验证服务暂不可用，未添加积分或更新订阅',
});
router.post('/verify-purchase', verificationUnavailable);
router.post('/sync-subscription', verificationUnavailable);

/**
 * GET /iap/subscription-status
 * 获取当前订阅状态
 */
router.get('/subscription-status', async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const userRow = userRepo.findById(userId);
    if (!userRow) {
        return res.status(404).json({
            error: 'UserNotFound',
            message: '用户不存在',
        });
    }

    const isActive = userRow.subscription_tier !== 'FREE'
        && userRow.subscription_expires_at != null
        && new Date(userRow.subscription_expires_at) > new Date();

    res.json({
        subscriptionTier: isActive ? userRow.subscription_tier : 'FREE',
        isActive,
        expiresAt: userRow.subscription_expires_at ?? null,
        autoRenewEnabled: isActive,
    });
});

export default router;
