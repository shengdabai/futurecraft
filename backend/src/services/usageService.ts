import { config } from '../config/env.js';
import { getDb } from '../db/database.js';

interface UsageSummary {
    readonly totalInputTokens: number;
    readonly totalOutputTokens: number;
    readonly totalCreditsUsed: number;
    readonly requestCount: number;
}

/**
 * 获取当前计费周期的起止时间
 */
function getCurrentBillingPeriod(): { readonly start: string; readonly end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

/**
 * 获取用户当前计费周期的使用汇总
 */
function getCurrentPeriodUsage(userId: string): UsageSummary {
    const db = getDb();
    const { start, end } = getCurrentBillingPeriod();

    const row = db.prepare(`
        SELECT
            COALESCE(SUM(input_tokens), 0) as totalInputTokens,
            COALESCE(SUM(output_tokens), 0) as totalOutputTokens,
            COALESCE(SUM(credits_used), 0) as totalCreditsUsed,
            COUNT(*) as requestCount
        FROM usage_records
        WHERE user_id = ? AND created_at >= ? AND created_at <= ?
    `).get(userId, start, end) as UsageSummary;

    return {
        totalInputTokens: row.totalInputTokens,
        totalOutputTokens: row.totalOutputTokens,
        totalCreditsUsed: row.totalCreditsUsed,
        requestCount: row.requestCount,
    };
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
    outputTokens: number,
): { readonly creditsUsed: number; readonly remainingCredits: number } {
    const db = getDb();
    const creditsUsed = calculateCredits(inputTokens, outputTokens);

    db.prepare(`
        INSERT INTO usage_records (user_id, action, input_tokens, output_tokens, credits_used)
        VALUES (?, 'ai_request', ?, ?, ?)
    `).run(userId, inputTokens, outputTokens, creditsUsed);

    const usage = getCurrentPeriodUsage(userId);
    const remainingCredits = Math.max(0, config.billing.freeCreditsPerMonth - usage.totalCreditsUsed);

    return { creditsUsed, remainingCredits };
}

/**
 * 检查用户是否有足够的 Credits
 */
export function checkCredits(userId: string, estimatedTokens: number = 1000): boolean {
    const usage = getCurrentPeriodUsage(userId);
    const estimatedCredits = calculateCredits(estimatedTokens, estimatedTokens);
    const remainingCredits = config.billing.freeCreditsPerMonth - usage.totalCreditsUsed;

    return remainingCredits >= estimatedCredits;
}

/**
 * 获取用户使用统计
 */
export function getUserUsageStats(userId: string): {
    readonly totalTokensUsed: number;
    readonly totalCreditsUsed: number;
    readonly remainingCredits: number;
    readonly currentPeriodStart: string;
    readonly currentPeriodEnd: string;
    readonly requestCount: number;
} {
    const usage = getCurrentPeriodUsage(userId);
    const { start, end } = getCurrentBillingPeriod();

    return {
        totalTokensUsed: usage.totalInputTokens + usage.totalOutputTokens,
        totalCreditsUsed: usage.totalCreditsUsed,
        remainingCredits: Math.max(0, config.billing.freeCreditsPerMonth - usage.totalCreditsUsed),
        currentPeriodStart: start,
        currentPeriodEnd: end,
        requestCount: usage.requestCount,
    };
}

/**
 * 获取当前计费信息
 */
export function getCurrentBilling(userId: string): {
    readonly currentAmount: number;
    readonly currency: string;
    readonly billingCycleEnd: string;
    readonly creditsUsed: number;
    readonly freeCreditsLimit: number;
} {
    const usage = getCurrentPeriodUsage(userId);
    const { end } = getCurrentBillingPeriod();

    // 简单计费模型：超出免费额度按 $0.01/credit 计费
    const overageCredits = Math.max(0, usage.totalCreditsUsed - config.billing.freeCreditsPerMonth);
    const currentAmount = overageCredits * 0.01;

    return {
        currentAmount,
        currency: 'USD',
        billingCycleEnd: end,
        creditsUsed: usage.totalCreditsUsed,
        freeCreditsLimit: config.billing.freeCreditsPerMonth,
    };
}

/**
 * 重置用户使用量（用于测试或管理操作）
 */
export function resetUserUsage(userId: string): void {
    const db = getDb();
    const { start, end } = getCurrentBillingPeriod();

    db.prepare(`
        DELETE FROM usage_records
        WHERE user_id = ? AND created_at >= ? AND created_at <= ?
    `).run(userId, start, end);
}
