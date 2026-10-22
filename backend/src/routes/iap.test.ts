import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

// config/env.ts 在 import 时读取环境变量，所以先设置，再用动态 import 加载路由与数据库。
// NODE_ENV=development 且未配置 App Store 密钥时，verifyWithAppStore 跳过远程校验，测试不会访问 Apple。
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'futurecraft-iap-test-'));
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'x'.repeat(32);
process.env.GEMINI_API_KEY = 'test-placeholder';
process.env.DB_PATH = path.join(tmpDir, 'test.db');
process.env.APP_STORE_KEY_ID = '';
process.env.APP_STORE_ISSUER_ID = '';

const DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_CREDITS = 100;

let server: Server;
let baseUrl = '';
let closeDb: () => void;
let userRepo: typeof import('../db/userRepository.js');
let iapRepo: typeof import('../db/iapRepository.js');
let generateAccessToken: typeof import('../middleware/auth.js').generateAccessToken;

let userCounter = 0;
let txCounter = 0;

before(async () => {
    const { default: express } = await import('express');
    const { default: iapRouter } = await import('./iap.js');
    const database = await import('../db/database.js');
    userRepo = await import('../db/userRepository.js');
    iapRepo = await import('../db/iapRepository.js');
    ({ generateAccessToken } = await import('../middleware/auth.js'));
    closeDb = database.closeDb;

    const app = express();
    app.use(express.json());
    app.use('/iap', iapRouter);

    await new Promise<void>((resolve) => {
        server = app.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

function createUser() {
    userCounter += 1;
    const user = userRepo.createUser({
        id: `iap-test-user-${userCounter}`,
        isGuest: false,
        region: 'GLOBAL',
        creditBalance: INITIAL_CREDITS,
        subscriptionTier: 'FREE',
    });
    const token = generateAccessToken({ userId: user.id, isGuest: false, region: 'GLOBAL' });
    return { userId: user.id, token };
}

function nextTransactionId(): string {
    txCounter += 1;
    return `iap-test-tx-${txCounter}`;
}

async function post(route: string, token: string, body: Record<string, unknown>) {
    const response = await fetch(`${baseUrl}/iap${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}

test('verify-purchase credits the catalog amount and ignores a larger client points value', async () => {
    const { userId, token } = createUser();
    const transactionId = nextTransactionId();
    const warn = mock.method(console, 'warn', () => undefined);
    try {
        const res = await post('/verify-purchase', token, {
            transactionId,
            productId: 'com.zturns.futurecraft.points.250',
            points: 100000,
        });

        assert.equal(res.status, 200);
        assert.equal(res.body.creditsAdded, 250);
        assert.equal(res.body.newBalance, INITIAL_CREDITS + 250);
        assert.equal(userRepo.findById(userId)?.credit_balance, INITIAL_CREDITS + 250);
        assert.equal(iapRepo.findByTransactionId(transactionId)?.credits_added, 250);
        assert.ok(
            warn.mock.calls.some((call) => String(call.arguments[0]).includes('points')),
            'a warning should be logged when client points differ from the catalog',
        );
    } finally {
        warn.mock.restore();
    }
});

test('verify-purchase works without a client points field', async () => {
    const { userId, token } = createUser();
    const warn = mock.method(console, 'warn', () => undefined);
    try {
        const res = await post('/verify-purchase', token, {
            transactionId: nextTransactionId(),
            productId: 'com.zturns.futurecraft.points.600',
        });

        assert.equal(res.status, 200);
        assert.equal(res.body.creditsAdded, 600);
        assert.equal(userRepo.findById(userId)?.credit_balance, INITIAL_CREDITS + 600);
    } finally {
        warn.mock.restore();
    }
});

test('verify-purchase rejects an unknown product with 400 UnknownProduct and credits nothing', async () => {
    const { userId, token } = createUser();
    const transactionId = nextTransactionId();
    const res = await post('/verify-purchase', token, {
        transactionId,
        productId: 'com.zturns.futurecraft.points.999999',
        points: 100000,
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'UnknownProduct');
    assert.equal(userRepo.findById(userId)?.credit_balance, INITIAL_CREDITS);
    assert.equal(iapRepo.findByTransactionId(transactionId), undefined);
});

test('verify-purchase rejects a subscription product id', async () => {
    const { userId, token } = createUser();
    const transactionId = nextTransactionId();
    const res = await post('/verify-purchase', token, {
        transactionId,
        productId: 'com.zturns.futurecraft.sub.yearly',
        points: 5000,
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'UnknownProduct');
    assert.equal(userRepo.findById(userId)?.credit_balance, INITIAL_CREDITS);
    assert.equal(iapRepo.findByTransactionId(transactionId), undefined);
});

test('verify-purchase still rejects a repeated transaction with 409', async () => {
    const { userId, token } = createUser();
    const transactionId = nextTransactionId();
    const body = { transactionId, productId: 'com.zturns.futurecraft.points.250' };
    const warn = mock.method(console, 'warn', () => undefined);
    try {
        const first = await post('/verify-purchase', token, body);
        const second = await post('/verify-purchase', token, body);

        assert.equal(first.status, 200);
        assert.equal(second.status, 409);
        assert.equal(userRepo.findById(userId)?.credit_balance, INITIAL_CREDITS + 250);
    } finally {
        warn.mock.restore();
    }
});

test('sync-subscription rejects a points package and does not grant PRO', async () => {
    const { userId, token } = createUser();
    const transactionId = nextTransactionId();
    const warn = mock.method(console, 'warn', () => undefined);
    try {
        const res = await post('/sync-subscription', token, {
            transactionId,
            productId: 'com.zturns.futurecraft.points.250',
        });

        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'UnknownProduct');
        const user = userRepo.findById(userId);
        assert.equal(user?.subscription_tier, 'FREE');
        assert.equal(user?.subscription_expires_at, null);
        assert.equal(iapRepo.findByTransactionId(transactionId), undefined);
    } finally {
        warn.mock.restore();
    }
});

test('sync-subscription rejects an unknown product', async () => {
    const { userId, token } = createUser();
    const warn = mock.method(console, 'warn', () => undefined);
    try {
        const res = await post('/sync-subscription', token, {
            transactionId: nextTransactionId(),
            productId: 'com.zturns.futurecraft.sub.weekly',
        });

        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'UnknownProduct');
        assert.equal(userRepo.findById(userId)?.subscription_tier, 'FREE');
    } finally {
        warn.mock.restore();
    }
});

for (const [productId, days] of [
    ['com.zturns.futurecraft.sub.monthly', 30],
    ['com.zturns.futurecraft.sub.yearly', 365],
] as const) {
    test(`sync-subscription grants PRO for ${days} days on ${productId}`, async () => {
        const { userId, token } = createUser();
        const warn = mock.method(console, 'warn', () => undefined);
        try {
            const startedAt = Date.now();
            const res = await post('/sync-subscription', token, {
                transactionId: nextTransactionId(),
                productId,
            });
            const finishedAt = Date.now();

            assert.equal(res.status, 200);
            assert.equal(res.body.subscriptionTier, 'PRO');
            const expiresAt = Date.parse(String(res.body.expiresAt));
            assert.ok(expiresAt >= startedAt + days * DAY_MS, 'expiry is at least the catalog days from request start');
            assert.ok(expiresAt <= finishedAt + days * DAY_MS, 'expiry is at most the catalog days from request end');

            const user = userRepo.findById(userId);
            assert.equal(user?.subscription_tier, 'PRO');
            assert.equal(user?.subscription_expires_at, res.body.expiresAt);
        } finally {
            warn.mock.restore();
        }
    });
}
