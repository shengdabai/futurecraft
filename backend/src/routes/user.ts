import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as usageService from '../services/usageService.js';

const router = Router();

// 所有用户路由需要认证
router.use(authMiddleware);

/**
 * GET /user/usage
 * 获取用户使用统计
 */
router.get('/usage', (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const stats = usageService.getUserUsageStats(userId);
    res.json(stats);
});

/**
 * GET /user/billing
 * 获取当前计费信息
 */
router.get('/billing', (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const billing = usageService.getCurrentBilling(userId);
    res.json(billing);
});

export default router;

