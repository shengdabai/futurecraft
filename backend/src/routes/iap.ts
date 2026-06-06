import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../db/database.js';
import * as iapRepo from '../db/iapRepository.js';
import * as userRepo from '../db/userRepository.js';

const router = Router();

router.use(authMiddleware);

// 输入验证
const verifyPurchaseSchema = z.object({
    transactionId: z.string().min(1),
    productId: z.string().min(1),
    points: z.number().int().min(1).max(100000),
});

const syncSubscriptionSchema = z.object({
    transactionId: z.string().min(1),
    productId: z.string().min(1),
    originalTransactionId: z.string().optional(),
});

// App Store Server API 配置（从环境变量读取）
const APP_STORE_CONFIG = {
    keyId: process.env.APP_STORE_KEY_ID || '',
    issuerId: process.env.APP_STORE_ISSUER_ID || '',
    bundleId: process.env.APPLE_BUNDLE_ID || 'com.futurecraft.app',
    environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox',
} as const;

/**
 * 基础的 App Store Server API 验证
 * 在生产环境中应使用完整的 App Store Server API v2
 */
async function verifyWithAppStore(transactionId: string): Promise<{
    readonly isValid: boolean;
    readonly productId?: string;
    readonly error?: string;
}> {
    // 如果没有配置 App Store API 密钥，跳过远程验证
    if (!APP_STORE_CONFIG.keyId || !APP_STORE_CONFIG.issuerId) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[IAP] App Store API not configured, skipping verification in development mode');
            return { isValid: true };
        }
        return {
            isValid: false,
            error: 'App Store Server API not configured',
        };
    }

    // JWT 生成尚未实现，无法进行远程验证
    const jwt = generateAppStoreJWT();
    if (!jwt) {
        console.warn('[IAP] App Store JWT generation not implemented, cannot verify transaction');
        return {
            isValid: false,
            error: 'App Store JWT generation not implemented',
        };
    }

    try {
        // 生产环境: 调用 App Store Server API v2
        const baseUrl = APP_STORE_CONFIG.environment === 'Production'
            ? 'https://api.storekit.itunes.apple.com'
            : 'https://api.storekit-sandbox.itunes.apple.com';

        const url = `${baseUrl}/inApps/v1/transactions/${transactionId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return { isValid: true };
        }

        return {
            isValid: false,
            error: `App Store API returned ${response.status}`,
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown verification error',
        };
    }
}

/**
 * 生成 App Store Server API JWT
 * 完整实现需要 ES256 签名的 JWT
 * TODO: 实现完整的 App Store JWT 生成
 * 需要: keyId, issuerId, bundleId, private key (.p8 文件)
 * 算法: ES256
 */
function generateAppStoreJWT(): string {
    return '';
}

/**
 * POST /iap/verify-purchase
 * 验证 IAP 购买（消费型商品）
 */
router.post('/verify-purchase', async (req: Request, res: Response) => {
    try {
        const parseResult = verifyPurchaseSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '缺少交易信息',
                details: parseResult.error.flatten().fieldErrors,
            });
        }

        const { transactionId, productId, points } = parseResult.data;
        const userId = req.user!.userId;

        // 1. App Store 验证（在事务外执行，因为是异步网络调用）
        const verification = await verifyWithAppStore(transactionId);
        if (!verification.isValid) {
            return res.status(400).json({
                error: 'VerificationFailed',
                message: '购买验证失败',
            });
        }

        // 2. 在 SQLite 事务中执行：查重 + 插入 + 更新余额（原子性）
        const db = getDb();
        const result = db.transaction(() => {
            // 检查 transactionId 是否已处理（防止重复）
            const existingTx = iapRepo.findByTransactionId(transactionId);
            if (existingTx) {
                return { error: 'DuplicateTransaction' as const };
            }

            // 验证用户存在
            const userRow = userRepo.findById(userId);
            if (!userRow) {
                return { error: 'UserNotFound' as const };
            }

            // 记录交易
            iapRepo.createTransaction({
                userId,
                transactionId,
                productId,
                creditsAdded: points,
                verified: true,
            });

            // 更新用户积分
            const newBalance = userRow.credit_balance + points;
            userRepo.updateCreditBalance(userId, newBalance);

            return { success: true as const, newBalance };
        })();

        if ('error' in result) {
            if (result.error === 'DuplicateTransaction') {
                return res.status(409).json({
                    error: 'DuplicateTransaction',
                    message: '该交易已处理',
                });
            }
            return res.status(404).json({
                error: 'UserNotFound',
                message: '用户不存在',
            });
        }

        res.json({
            success: true,
            message: '购买成功',
            creditsAdded: points,
            newBalance: result.newBalance,
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
        const parseResult = syncSubscriptionSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '缺少订阅信息',
                details: parseResult.error.flatten().fieldErrors,
            });
        }

        const { transactionId, productId } = parseResult.data;
        const userId = req.user!.userId;

        // App Store 验证（在事务外执行，因为是异步网络调用）
        const verification = await verifyWithAppStore(transactionId);
        if (!verification.isValid) {
            return res.status(400).json({
                error: 'VerificationFailed',
                message: '订阅验证失败',
            });
        }

        // 在 SQLite 事务中执行：查重 + 插入 + 更新订阅（原子性）
        const db = getDb();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const result = db.transaction(() => {
            const existingTx = iapRepo.findByTransactionId(transactionId);
            if (existingTx) {
                return { error: 'DuplicateTransaction' as const };
            }

            const userRow = userRepo.findById(userId);
            if (!userRow) {
                return { error: 'UserNotFound' as const };
            }

            iapRepo.createTransaction({
                userId,
                transactionId,
                productId,
                creditsAdded: 0,
                verified: true,
            });

            userRepo.updateSubscriptionTier(userId, 'PRO');
            userRepo.updateSubscriptionExpiresAt(userId, expiresAt);

            return { success: true as const };
        })();

        if ('error' in result) {
            if (result.error === 'DuplicateTransaction') {
                return res.status(409).json({
                    error: 'DuplicateTransaction',
                    message: '该订阅交易已处理',
                });
            }
            return res.status(404).json({
                error: 'UserNotFound',
                message: '用户不存在',
            });
        }

        res.json({
            success: true,
            message: '订阅同步成功',
            subscriptionTier: 'PRO',
            expiresAt,
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
