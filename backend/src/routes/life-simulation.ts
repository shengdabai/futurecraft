import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { aiLimiter, userRateLimitMiddleware } from '../middleware/rateLimit.js';
import * as lifeSimulationService from '../services/lifeSimulationService.js';
import * as usageService from '../services/usageService.js';
import { validateUserInput, ContentFilterError } from '../services/contentFilter.js';

const router = Router();

// All life simulation routes require authentication
router.use(authMiddleware);
router.use(aiLimiter);
router.use(userRateLimitMiddleware(20, 60 * 60 * 1000)); // 20 requests per hour

/**
 * POST /life-simulation/generate
 * Generate a life simulation video script based on user description
 *
 * Body: {
 *   description: string,  // e.g., "我想体验一下当老师的生活"
 *   language?: 'zh' | 'en',
 *   duration?: 'short' | 'medium' | 'long'
 * }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { description, language, duration } = req.body;
    const userId = req.user!.userId;

    // Validate request
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: '请描述您想要体验的人生',
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: '描述长度不能超过500字符',
      });
    }

    // Check usage quota
    if (!usageService.checkCredits(userId)) {
      return res.status(402).json({
        error: 'InsufficientCredits',
        message: '本月免费额度已用完，请升级订阅',
      });
    }

    // Content safety check
    try {
      validateUserInput(description);
    } catch (error) {
      if (error instanceof ContentFilterError) {
        return res.status(400).json({
          error: 'ContentFiltered',
          message: error.message,
        });
      }
      throw error;
    }

    // Generate life simulation video script
    const { result, usage } = await lifeSimulationService.generateLifeSimulationVideo({
      description: description.trim(),
      language: language || 'zh',
      duration: duration || 'medium',
    });

    // Record usage
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
    console.error('Life simulation generation error:', error);
    res.status(500).json({
      error: 'GenerationError',
      message: '生成失败，请稍后再试',
    });
  }
});

/**
 * POST /life-simulation/variations
 * Generate multiple variations of life simulation for the same description
 *
 * Body: {
 *   description: string,
 *   language?: 'zh' | 'en',
 *   variationCount?: number  // default: 3
 * }
 */
router.post('/variations', async (req: Request, res: Response) => {
  try {
    const { description, language, variationCount } = req.body;
    const userId = req.user!.userId;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: '请描述您想要体验的人生',
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: '描述长度不能超过500字符',
      });
    }

    if (!usageService.checkCredits(userId)) {
      return res.status(402).json({
        error: 'InsufficientCredits',
        message: '本月免费额度已用完，请升级订阅',
      });
    }

    validateUserInput(description);

    // Limit variation count to prevent abuse
    const count = Math.min(variationCount || 3, 5);

    const { results, usage } = await lifeSimulationService.generateLifeSimulationVariations({
      description: description.trim(),
      language: language || 'zh',
      variationCount: count,
    });

    usageService.recordUsage(userId, usage.inputTokens, usage.outputTokens);

    res.json({
      variations: results,
      _usage: {
        creditsUsed: usage.inputTokens + usage.outputTokens,
      },
    });
  } catch (error) {
    if (error instanceof ContentFilterError) {
      return res.status(400).json({
        error: 'ContentFiltered',
        message: error.message,
      });
    }
    console.error('Life simulation variations error:', error);
    res.status(500).json({
      error: 'GenerationError',
      message: '生成失败，请稍后再试',
    });
  }
});

/**
 * GET /life-simulation/suggestions
 * Get life simulation suggestions based on popular careers
 *
 * Query: ?language=zh
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { language = 'zh' } = req.query;
    const userId = req.user!.userId;

    if (!usageService.checkCredits(userId)) {
      return res.status(402).json({
        error: 'InsufficientCredits',
        message: '本月免费额度已用完，请升级订阅',
      });
    }

    const { suggestions, usage } = await lifeSimulationService.getLifeSimulationSuggestions(
      language as 'zh' | 'en'
    );

    // Suggestions use fewer credits since they're shared
    usageService.recordUsage(userId, Math.floor(usage.inputTokens / 10), Math.floor(usage.outputTokens / 10));

    res.json({ suggestions });
  } catch (error) {
    console.error('Life simulation suggestions error:', error);
    res.status(500).json({
      error: 'GenerationError',
      message: '获取建议失败，请稍后再试',
    });
  }
});

export default router;
