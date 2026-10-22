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
