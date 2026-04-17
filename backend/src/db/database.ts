import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'futurecraft.db');

let dbInstance: Database.Database | null = null;

/**
 * 获取数据库实例（单例模式）
 */
export function getDb(): Database.Database {
    if (dbInstance) {
        return dbInstance;
    }

    // 确保数据目录存在
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(DB_PATH);

    // 启用 WAL 模式提升性能
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    initializeTables(dbInstance);

    return dbInstance;
}

/**
 * 初始化数据库表
 */
function initializeTables(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            password_hash TEXT,
            apple_user_id TEXT UNIQUE,
            display_name TEXT,
            is_guest INTEGER NOT NULL DEFAULT 0,
            region TEXT NOT NULL DEFAULT 'GLOBAL',
            credit_balance INTEGER NOT NULL DEFAULT 100,
            subscription_tier TEXT NOT NULL DEFAULT 'FREE',
            subscription_expires_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id);

        CREATE TABLE IF NOT EXISTS mistakes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            subject TEXT,
            image_data TEXT,
            analysis TEXT,
            tags TEXT DEFAULT '[]',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_mistakes_user_id ON mistakes(user_id);

        CREATE TABLE IF NOT EXISTS usage_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            input_tokens INTEGER NOT NULL DEFAULT 0,
            output_tokens INTEGER NOT NULL DEFAULT 0,
            credits_used INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
        CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);

        CREATE TABLE IF NOT EXISTS tutor_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            session_data TEXT DEFAULT '{}',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON tutor_sessions(user_id);

        CREATE TABLE IF NOT EXISTS iap_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            transaction_id TEXT UNIQUE NOT NULL,
            product_id TEXT NOT NULL,
            credits_added INTEGER NOT NULL DEFAULT 0,
            verified INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_iap_transactions_transaction_id ON iap_transactions(transaction_id);
        CREATE INDEX IF NOT EXISTS idx_iap_transactions_user_id ON iap_transactions(user_id);
    `);

    // 迁移：为已有数据库添加 subscription_expires_at 列
    try {
        db.exec(`ALTER TABLE users ADD COLUMN subscription_expires_at TEXT`);
    } catch {
        // 列已存在，忽略错误
    }
}

/**
 * 关闭数据库连接
 */
export function closeDb(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
