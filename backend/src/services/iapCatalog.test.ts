import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    CONSUMABLE_CREDITS,
    SUBSCRIPTION_DAYS,
    getConsumableCredits,
    getSubscriptionDays,
    computeSubscriptionExpiry,
} from './iapCatalog.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// 与 iOS IAPManager.swift 的 ProductID 保持一致
test('consumable catalog maps each points package to its credits', () => {
    assert.equal(getConsumableCredits('com.zturns.futurecraft.points.250'), 250);
    assert.equal(getConsumableCredits('com.zturns.futurecraft.points.600'), 600);
    assert.equal(getConsumableCredits('com.zturns.futurecraft.points.1400'), 1400);
    assert.equal(Object.keys(CONSUMABLE_CREDITS).length, 3);
});

test('subscription catalog maps monthly to 30 days and yearly to 365 days', () => {
    assert.equal(getSubscriptionDays('com.zturns.futurecraft.sub.monthly'), 30);
    assert.equal(getSubscriptionDays('com.zturns.futurecraft.sub.yearly'), 365);
    assert.equal(Object.keys(SUBSCRIPTION_DAYS).length, 2);
});

test('unknown product ids are not in either catalog', () => {
    assert.equal(getConsumableCredits('com.zturns.futurecraft.points.999999'), undefined);
    assert.equal(getConsumableCredits(''), undefined);
    assert.equal(getSubscriptionDays('com.zturns.futurecraft.sub.weekly'), undefined);
    assert.equal(getSubscriptionDays(''), undefined);
});

test('a subscription product id is not a consumable and vice versa', () => {
    assert.equal(getConsumableCredits('com.zturns.futurecraft.sub.monthly'), undefined);
    assert.equal(getConsumableCredits('com.zturns.futurecraft.sub.yearly'), undefined);
    assert.equal(getSubscriptionDays('com.zturns.futurecraft.points.250'), undefined);
    assert.equal(getSubscriptionDays('com.zturns.futurecraft.points.1400'), undefined);
});

test('lookups ignore inherited Object.prototype keys', () => {
    for (const key of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
        assert.equal(getConsumableCredits(key), undefined, `consumable lookup for ${key}`);
        assert.equal(getSubscriptionDays(key), undefined, `subscription lookup for ${key}`);
        assert.equal(computeSubscriptionExpiry(key, 0), undefined, `expiry lookup for ${key}`);
    }
});

test('computeSubscriptionExpiry adds the catalog days to the given time', () => {
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    assert.equal(
        computeSubscriptionExpiry('com.zturns.futurecraft.sub.monthly', now),
        new Date(now + 30 * DAY_MS).toISOString(),
    );
    assert.equal(
        computeSubscriptionExpiry('com.zturns.futurecraft.sub.yearly', now),
        new Date(now + 365 * DAY_MS).toISOString(),
    );
});

test('computeSubscriptionExpiry rejects non-subscription products', () => {
    const now = Date.UTC(2026, 0, 1);
    assert.equal(computeSubscriptionExpiry('com.zturns.futurecraft.points.250', now), undefined);
    assert.equal(computeSubscriptionExpiry('not-a-product', now), undefined);
});
