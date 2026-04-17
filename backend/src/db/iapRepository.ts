import { getDb } from './database.js';

export interface IapTransactionRow {
    readonly id: number;
    readonly user_id: string;
    readonly transaction_id: string;
    readonly product_id: string;
    readonly credits_added: number;
    readonly verified: number;
    readonly created_at: string;
}

/**
 * 检查交易 ID 是否已经处理过
 */
export function findByTransactionId(transactionId: string): IapTransactionRow | undefined {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM iap_transactions WHERE transaction_id = ?');
    return stmt.get(transactionId) as IapTransactionRow | undefined;
}

/**
 * 记录新的 IAP 交易
 */
export function createTransaction(params: {
    readonly userId: string;
    readonly transactionId: string;
    readonly productId: string;
    readonly creditsAdded: number;
    readonly verified: boolean;
}): IapTransactionRow {
    const db = getDb();
    const stmt = db.prepare(`
        INSERT INTO iap_transactions (user_id, transaction_id, product_id, credits_added, verified)
        VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
        params.userId,
        params.transactionId,
        params.productId,
        params.creditsAdded,
        params.verified ? 1 : 0,
    );

    const created = findByTransactionId(params.transactionId);
    if (!created) {
        throw new Error('Failed to create IAP transaction record');
    }
    return created;
}

/**
 * 获取用户的所有交易记录
 */
export function findByUserId(userId: string): ReadonlyArray<IapTransactionRow> {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM iap_transactions WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as IapTransactionRow[];
}
