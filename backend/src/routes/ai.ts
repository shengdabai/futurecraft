import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { aiLimiter, userRateLimitMiddleware } from '../middleware/rateLimit.js';
import * as geminiService from '../services/geminiService.js';
import * as usageService from '../services/usageService.js';
import { validateUserInput, sanitizeAIOutput, sanitizeResourceUrls, ContentFilterError } from '../services/contentFilter.js';

const router = Router();

// 所有 AI 路由需要认证和速率限制
router.use(authMiddleware);
router.use(aiLimiter);
router.use(userRateLimitMiddleware(50, 60 * 60 * 1000)); // 每小时 50 次

/**
 * POST /ai/soul-scan
 * RPG 角色分析
 */
router.post('/soul-scan', async (req: Request, res: Response) => {
    try {
        const { name, major, hobbies, hiddenTalent, language } = req.body;
        const userId = req.user!.userId;

        // 检查用量配额
        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完，请升级订阅',
            });
        }

        // 内容安全检查
        try {
            validateUserInput(`${name} ${major} ${hobbies.join(' ')} ${hiddenTalent}`);
        } catch (error) {
            if (error instanceof ContentFilterError) {
                return res.status(400).json({
                    error: 'ContentFiltered',
                    message: error.message,
                });
            }
            throw error;
        }

        // 调用 Gemini
        const { result, usage } = await geminiService.performSoulScan({
            name,
            major,
            hobbies: hobbies || [],
            hiddenTalent,
            language: language || 'zh',
        });

        // 记录使用量
        const { creditsUsed, remainingCredits } = usageService.recordUsage(
            userId,
            usage.inputTokens,
            usage.outputTokens
        );

        res.json({
            ...result,
            _usage: {
                creditsUsed,
                remainingCredits,
            },
        });
    } catch (error) {
        console.error('Soul scan error:', error);
        res.status(500).json({
            error: 'AIError',
            message: 'AI 服务暂时不可用，请稍后再试',
        });
    }
});

/**
 * POST /ai/simulation
 * 生成模拟场景
 */
router.post('/simulation', async (req: Request, res: Response) => {
    try {
        const { jobTitle, language } = req.body;
        const userId = req.user!.userId;

        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完',
            });
        }

        validateUserInput(jobTitle);

        const { result, usage } = await geminiService.generateSimulation({
            jobTitle,
            language: language || 'zh',
        });

        usageService.recordUsage(userId, usage.inputTokens, usage.outputTokens);

        res.json(result);
    } catch (error) {
        if (error instanceof ContentFilterError) {
            return res.status(400).json({
                error: 'ContentFiltered',
                message: error.message,
            });
        }
        console.error('Simulation error:', error);
        res.status(500).json({
            error: 'AIError',
            message: 'AI 服务暂时不可用',
        });
    }
});

/**
 * POST /ai/simulation/evaluate
 * 评估模拟选择
 */
router.post('/simulation/evaluate', async (req: Request, res: Response) => {
    try {
        const { jobTitle, scenario, choice, language } = req.body;
        const userId = req.user!.userId;

        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完',
            });
        }

        const { result, usage } = await geminiService.evaluateSimulationChoice({
            jobTitle,
            scenario,
            choice,
            language: language || 'zh',
        });

        usageService.recordUsage(userId, usage.inputTokens, usage.outputTokens);

        res.json(result);
    } catch (error) {
        console.error('Evaluate error:', error);
        res.status(500).json({
            error: 'AIError',
            message: 'AI 服务暂时不可用',
        });
    }
});

/**
 * POST /ai/skill-tree
 * 生成技能树
 */
router.post('/skill-tree', async (req: Request, res: Response) => {
    try {
        const { jobTitle, language } = req.body;
        const userId = req.user!.userId;

        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完',
            });
        }

        validateUserInput(jobTitle);

        const { result, usage } = await geminiService.generateSkillTree({
            jobTitle,
            language: language || 'zh',
        });

        // 过滤不安全的 URL
        sanitizeResourceUrls(result);

        usageService.recordUsage(userId, usage.inputTokens, usage.outputTokens);

        res.json(result);
    } catch (error) {
        if (error instanceof ContentFilterError) {
            return res.status(400).json({
                error: 'ContentFiltered',
                message: error.message,
            });
        }
        console.error('Skill tree error:', error);
        res.status(500).json({
            error: 'AIError',
            message: 'AI 服务暂时不可用',
        });
    }
});

/**
 * POST /ai/chat
 * AI 导师对话
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { history, message, jobTitle, jobDescription, isBossMode, language } = req.body;
        const userId = req.user!.userId;

        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完',
            });
        }

        // 检查用户消息
        try {
            validateUserInput(message);
        } catch (error) {
            if (error instanceof ContentFilterError) {
                return res.status(400).json({
                    error: 'ContentFiltered',
                    message: error.message,
                });
            }
            throw error;
        }

        const { message: responseMessage, usage } = await geminiService.tutorChat({
            history: history || [],
            message,
            jobTitle,
            jobDescription,
            isBossMode: isBossMode || false,
            language: language || 'zh',
        });

        // 过滤 AI 输出
        const sanitizedMessage = sanitizeAIOutput(responseMessage);

        usageService.recordUsage(userId, usage.inputTokens, usage.outputTokens);

        res.json({ message: sanitizedMessage });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'AIError',
            message: 'AI 服务暂时不可用',
        });
    }
});

/**
 * POST /ai/tts
 * 语音合成 (TTS)
 */
router.post('/tts', async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const userId = req.user!.userId;

        if (!text || text.length > 1000) {
            return res.status(400).json({
                error: 'InvalidRequest',
                message: '文本长度无效',
            });
        }

        if (!usageService.checkCredits(userId)) {
            return res.status(402).json({
                error: 'InsufficientCredits',
                message: '本月免费额度已用完',
            });
        }

        // TODO: 实现 TTS 功能
        // 目前返回空，让前端降级处理
        res.json({ audioData: null });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({
            error: 'TTSError',
            message: '语音合成暂时不可用',
        });
    }
});

export default router;

