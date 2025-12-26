import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

/**
 * POST /iap/verify-purchase
 * 验证 IAP 购买（消费型商品）
 */
router.post('/verify-purchase', async (req: Request, res: Response) => {
    try {
        const { transactionId, productId, points } = req.body;
        const userId = req.user!.userId;

        if (!transactionId || !productId) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '缺少交易信息',
            });
        }

        // TODO: 实际生产环境需要：
        // 1. 调用 Apple 的 App Store Server API 验证收据
        // 2. 检查 transactionId 是否已处理（防止重复）
        // 3. 更新用户的 creditBalance

        console.log(`IAP Purchase: user=${userId}, product=${productId}, points=${points}, txn=${transactionId}`);

        // 模拟成功
        res.json({
            success: true,
            message: '购买成功',
            creditsAdded: points,
        });
    } catch (error) {
        console.error('IAP verify error:', error);
        res.status(500).json({
            error: 'IAPError',
            message: '购买验证失败',
        });
    }
});

/**
 * POST /iap/sync-subscription
 * 同步订阅状态
 */
router.post('/sync-subscription', async (req: Request, res: Response) => {
    try {
        const { transactionId, productId, originalTransactionId } = req.body;
        const userId = req.user!.userId;

        if (!transactionId || !productId) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '缺少订阅信息',
            });
        }

        // TODO: 实际生产环境需要：
        // 1. 调用 Apple 的 App Store Server API 验证订阅状态
        // 2. 更新用户的 subscriptionTier
        // 3. 设置 Server-to-Server 通知处理订阅续期/取消

        console.log(`Subscription sync: user=${userId}, product=${productId}, txn=${transactionId}`);

        // 模拟成功
        res.json({
            success: true,
            message: '订阅同步成功',
            subscriptionTier: 'PRO',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    } catch (error) {
        console.error('Subscription sync error:', error);
        res.status(500).json({
            error: 'SubscriptionError',
            message: '订阅同步失败',
        });
    }
});

/**
 * GET /iap/subscription-status
 * 获取当前订阅状态
 */
router.get('/subscription-status', async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    // TODO: 从数据库读取用户订阅状态

    res.json({
        subscriptionTier: 'FREE',
        isActive: false,
        expiresAt: null,
        autoRenewEnabled: false,
    });
});

export default router;

