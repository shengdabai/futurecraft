import { getDb } from './database.js';

export interface UserRow {
    readonly id: string;
    readonly username: string | null;
    readonly password_hash: string | null;
    readonly apple_user_id: string | null;
    readonly display_name: string | null;
    readonly is_guest: number;
    readonly region: string;
    readonly credit_balance: number;
    readonly subscription_tier: string;
    readonly subscription_expires_at: string | null;
    readonly created_at: string;
}

export interface CreateUserParams {
    readonly id: string;
    readonly username?: string;
    readonly passwordHash?: string;
    readonly appleUserId?: string;
    readonly displayName?: string;
    readonly isGuest: boolean;
    readonly region: string;
    readonly creditBalance: number;
    readonly subscriptionTier: string;
}

/**
 * 将数据库行转换为应用层用户对象
 */
export function toUserObject(row: UserRow) {
    return {
        id: row.id,
        username: row.username ?? 'User',
        appleUserId: row.apple_user_id ?? undefined,
        displayName: row.display_name ?? undefined,
        isGuest: row.is_guest === 1,
        region: row.region,
        creditBalance: row.credit_balance,
        subscriptionTier: row.subscription_tier,
        createdAt: row.created_at,
    };
}

/**
 * 根据 ID 查找用户
 */
export function findById(userId: string): UserRow | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(userId) as UserRow | undefined;
}

/**
 * 根据 Apple User ID 查找用户
 */
export function findByAppleUserId(appleUserId: string): UserRow | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE apple_user_id = ?');
    return stmt.get(appleUserId) as UserRow | undefined;
}

/**
 * 创建新用户
 */
export function createUser(params: CreateUserParams): UserRow {
    const db = getDb();
    const stmt = db.prepare(`
        INSERT INTO users (id, username, password_hash, apple_user_id, display_name, is_guest, region, credit_balance, subscription_tier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        params.id,
        params.username ?? null,
        params.passwordHash ?? null,
        params.appleUserId ?? null,
        params.displayName ?? null,
        params.isGuest ? 1 : 0,
        params.region,
        params.creditBalance,
        params.subscriptionTier,
    );

    const created = findById(params.id);
    if (!created) {
        throw new Error('Failed to create user');
    }
    return created;
}

/**
 * 更新用户积分余额
 */
export function updateCreditBalance(userId: string, newBalance: number): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET credit_balance = ? WHERE id = ?');
    stmt.run(newBalance, userId);
}

/**
 * 更新用户订阅等级
 */
export function updateSubscriptionTier(userId: string, tier: string): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET subscription_tier = ? WHERE id = ?');
    stmt.run(tier, userId);
}

/**
 * 更新用户订阅过期时间
 */
export function updateSubscriptionExpiresAt(userId: string, expiresAt: string): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET subscription_expires_at = ? WHERE id = ?');
    stmt.run(expiresAt, userId);
}
