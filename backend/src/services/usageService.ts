import { config } from '../config/env.js';

// 内存存储（生产环境应使用数据库）
interface UserUsage {
    userId: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCreditsUsed: number;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    requestCount: number;
    lastRequestAt: Date;
}

const userUsageMap = new Map<string, UserUsage>();

/**
 * 获取当前计费周期的起止时间
 */
function getCurrentBillingPeriod(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
}

/**
 * 获取或创建用户使用记录
 */
function getOrCreateUserUsage(userId: string): UserUsage {
    let usage = userUsageMap.get(userId);
    const { start, end } = getCurrentBillingPeriod();

    if (!usage || usage.currentPeriodEnd < new Date()) {
        // 新用户或新计费周期
        usage = {
            userId,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCreditsUsed: 0,
            currentPeriodStart: start,
            currentPeriodEnd: end,
            requestCount: 0,
            lastRequestAt: new Date(),
        };
        userUsageMap.set(userId, usage);
    }

    return usage;
}

/**
 * 计算 Token 对应的 Credits
 */
function calculateCredits(inputTokens: number, outputTokens: number): number {
    const inputCredits = Math.ceil(inputTokens / 1000) * config.billing.creditsPerKInputTokens;
    const outputCredits = Math.ceil(outputTokens / 1000) * config.billing.creditsPerKOutputTokens;
    return inputCredits + outputCredits;
}

/**
 * 记录 Token 使用量
 */
export function recordUsage(
    userId: string,
    inputTokens: number,
    outputTokens: number
): { creditsUsed: number; remainingCredits: number } {
    const usage = getOrCreateUserUsage(userId);

    const creditsUsed = calculateCredits(inputTokens, outputTokens);

    usage.totalInputTokens += inputTokens;
    usage.totalOutputTokens += outputTokens;
    usage.totalCreditsUsed += creditsUsed;
    usage.requestCount += 1;
    usage.lastRequestAt = new Date();

    const remainingCredits = Math.max(0, config.billing.freeCreditsPerMonth - usage.totalCreditsUsed);

    return { creditsUsed, remainingCredits };
}

/**
 * 检查用户是否有足够的 Credits
 */
export function checkCredits(userId: string, estimatedTokens: number = 1000): boolean {
    const usage = getOrCreateUserUsage(userId);
    const estimatedCredits = calculateCredits(estimatedTokens, estimatedTokens);
    const remainingCredits = config.billing.freeCreditsPerMonth - usage.totalCreditsUsed;

    return remainingCredits >= estimatedCredits;
}

/**
 * 获取用户使用统计
 */
export function getUserUsageStats(userId: string): {
    totalTokensUsed: number;
    totalCreditsUsed: number;
    remainingCredits: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    requestCount: number;
} {
    const usage = getOrCreateUserUsage(userId);

    return {
        totalTokensUsed: usage.totalInputTokens + usage.totalOutputTokens,
        totalCreditsUsed: usage.totalCreditsUsed,
        remainingCredits: Math.max(0, config.billing.freeCreditsPerMonth - usage.totalCreditsUsed),
        currentPeriodStart: usage.currentPeriodStart.toISOString(),
        currentPeriodEnd: usage.currentPeriodEnd.toISOString(),
        requestCount: usage.requestCount,
    };
}

/**
 * 获取当前计费信息
 */
export function getCurrentBilling(userId: string): {
    currentAmount: number;
    currency: string;
    billingCycleEnd: string;
    creditsUsed: number;
    freeCreditsLimit: number;
} {
    const usage = getOrCreateUserUsage(userId);

    // 简单计费模型：超出免费额度按 $0.01/credit 计费
    const overageCredits = Math.max(0, usage.totalCreditsUsed - config.billing.freeCreditsPerMonth);
    const currentAmount = overageCredits * 0.01;

    return {
        currentAmount,
        currency: 'USD',
        billingCycleEnd: usage.currentPeriodEnd.toISOString(),
        creditsUsed: usage.totalCreditsUsed,
        freeCreditsLimit: config.billing.freeCreditsPerMonth,
    };
}

/**
 * 重置用户使用量（用于测试或新计费周期）
 */
export function resetUserUsage(userId: string): void {
    userUsageMap.delete(userId);
}

