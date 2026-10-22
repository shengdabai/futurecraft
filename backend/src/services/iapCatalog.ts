/**
 * IAP 产品目录（服务端唯一可信来源）
 * 点数与订阅时长由服务端按 productId 查表，不信任客户端上报的 points。
 * productId 与 iOS 端 IAPManager.swift 的 ProductID 保持一致。
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** 消费型商品：productId -> 入账点数 */
export const CONSUMABLE_CREDITS: Readonly<Record<string, number>> = {
    'com.zturns.futurecraft.points.250': 250,
    'com.zturns.futurecraft.points.600': 600,
    'com.zturns.futurecraft.points.1400': 1400,
};

/** 订阅商品：productId -> 单次购买的有效天数 */
export const SUBSCRIPTION_DAYS: Readonly<Record<string, number>> = {
    'com.zturns.futurecraft.sub.monthly': 30,
    'com.zturns.futurecraft.sub.yearly': 365,
};

/**
 * 查询消费型商品的点数；非消费型或未知 productId 返回 undefined
 */
export function getConsumableCredits(productId: string): number | undefined {
    return Object.hasOwn(CONSUMABLE_CREDITS, productId) ? CONSUMABLE_CREDITS[productId] : undefined;
}

/**
 * 查询订阅商品的有效天数；非订阅或未知 productId 返回 undefined
 */
export function getSubscriptionDays(productId: string): number | undefined {
    return Object.hasOwn(SUBSCRIPTION_DAYS, productId) ? SUBSCRIPTION_DAYS[productId] : undefined;
}

/**
 * 按目录天数计算订阅过期时间（ISO 字符串）；非订阅 productId 返回 undefined
 */
export function computeSubscriptionExpiry(productId: string, nowMs: number): string | undefined {
    const days = getSubscriptionDays(productId);
    if (days === undefined) {
        return undefined;
    }
    return new Date(nowMs + days * DAY_MS).toISOString();
}

/**
 * 订阅到期时间:以 Apple 校验过的交易到期时间为准(expiresAtMs);只有开发模式跳过校验时(skipped)才按目录天数从现在起算。
 * 两者都没有时返回 undefined,调用方不授予订阅。账户上已有更晚的到期时间时保留它,另一笔较短的订阅不会把它缩短。
 */
export function resolveSubscriptionExpiry(
    productId: string,
    verified: { readonly expiresAtMs?: number; readonly skipped?: boolean },
    nowMs: number,
    currentExpiresAt: string | null | undefined,
): string | undefined {
    if (getSubscriptionDays(productId) === undefined) {
        return undefined;
    }
    let expiresAt: string | undefined;
    if (verified.expiresAtMs !== undefined && Number.isFinite(verified.expiresAtMs)) {
        expiresAt = new Date(verified.expiresAtMs).toISOString();
    } else if (verified.skipped) {
        expiresAt = computeSubscriptionExpiry(productId, nowMs);
    }
    if (expiresAt === undefined) {
        return undefined;
    }
    const current = currentExpiresAt ? Date.parse(currentExpiresAt) : NaN;
    return Number.isFinite(current) && current > Date.parse(expiresAt) ? new Date(current).toISOString() : expiresAt;
}

/** sync-subscription 用到的 App Store 校验结果;开发模式跳过远程校验时 skipped 为 true,不带 productId 与到期时间 */
export interface SubscriptionVerification {
    readonly isValid: boolean;
    readonly productId?: string;
    readonly expiresAtMs?: number;
    readonly skipped?: boolean;
}

/**
 * 一笔订阅交易能否授予 PRO,返回 'ok' 或拒绝原因:
 * 校验必须通过;除开发模式跳过校验外,校验结果的 productId 必须等于请求的商品,缺失也拒绝;
 * 交易自身的到期时间必须可信且晚于现在,已过期的交易不写入任何东西(账户上已有的权益不受影响)。
 */
export function checkSubscriptionGrant(
    productId: string,
    verification: SubscriptionVerification,
    nowMs: number,
): 'ok' | 'VerificationFailed' | 'NoTrustedExpiry' | 'Expired' {
    if (!verification.isValid) {
        return 'VerificationFailed';
    }
    if (!verification.skipped && verification.productId !== productId) {
        return 'VerificationFailed';
    }
    const expiresAt = resolveSubscriptionExpiry(productId, verification, nowMs, null);
    if (expiresAt === undefined) {
        return 'NoTrustedExpiry';
    }
    return Date.parse(expiresAt) > nowMs ? 'ok' : 'Expired';
}
