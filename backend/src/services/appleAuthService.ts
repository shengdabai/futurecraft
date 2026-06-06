import jwt from 'jsonwebtoken';

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

interface AppleJWK {
    readonly kty: string;
    readonly kid: string;
    readonly use: string;
    readonly alg: string;
    readonly n: string;
    readonly e: string;
}

interface AppleJWKSResponse {
    readonly keys: ReadonlyArray<AppleJWK>;
}

interface AppleTokenClaims {
    readonly iss: string;
    readonly aud: string;
    readonly exp: number;
    readonly iat: number;
    readonly sub: string;
    readonly email?: string;
    readonly email_verified?: string;
    readonly nonce?: string;
}

// 缓存 Apple 公钥，避免每次请求都获取
let cachedKeys: ReadonlyArray<AppleJWK> = [];
let cacheExpiry = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * 从 Apple 获取 JWKS 公钥
 */
async function fetchApplePublicKeys(): Promise<ReadonlyArray<AppleJWK>> {
    const now = Date.now();
    if (cachedKeys.length > 0 && now < cacheExpiry) {
        return cachedKeys;
    }

    try {
        const response = await fetch(APPLE_JWKS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch Apple JWKS: ${response.status}`);
        }
        const data = (await response.json()) as AppleJWKSResponse;
        cachedKeys = data.keys;
        cacheExpiry = now + CACHE_DURATION_MS;
        return cachedKeys;
    } catch (error) {
        // 如果有缓存的 key，即使过期也先用着
        if (cachedKeys.length > 0) {
            return cachedKeys;
        }
        throw error;
    }
}

/**
 * 将 JWK RSA 公钥转换为 PEM 格式
 */
function jwkToPem(jwk: AppleJWK): string {
    // Base64url decode n and e
    const n = Buffer.from(jwk.n, 'base64url');
    const e = Buffer.from(jwk.e, 'base64url');

    // Construct DER-encoded RSA public key
    const encodedN = encodeUnsignedInteger(n);
    const encodedE = encodeUnsignedInteger(e);

    const sequence = Buffer.concat([
        encodedN,
        encodedE,
    ]);

    const rsaPublicKey = Buffer.concat([
        derSequence(sequence),
    ]);

    const algorithmIdentifier = Buffer.from([
        0x30, 0x0d, // SEQUENCE
        0x06, 0x09, // OID
        0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, // rsaEncryption
        0x05, 0x00, // NULL
    ]);

    const bitString = Buffer.concat([
        Buffer.from([0x03, ...derLength(rsaPublicKey.length + 1), 0x00]),
        rsaPublicKey,
    ]);

    const publicKeyInfo = derSequence(Buffer.concat([algorithmIdentifier, bitString]));

    const base64 = publicKeyInfo.toString('base64');
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

function encodeUnsignedInteger(buf: Buffer): Buffer {
    // If the high bit is set, prepend a 0x00 byte
    const needsPadding = buf[0]! >= 0x80;
    const content = needsPadding ? Buffer.concat([Buffer.from([0x00]), buf]) : buf;
    return Buffer.concat([Buffer.from([0x02, ...derLength(content.length)]), content]);
}

function derLength(length: number): number[] {
    if (length < 0x80) {
        return [length];
    }
    const bytes: number[] = [];
    let temp = length;
    while (temp > 0) {
        bytes.unshift(temp & 0xff);
        temp >>= 8;
    }
    return [0x80 | bytes.length, ...bytes];
}

function derSequence(content: Buffer): Buffer {
    return Buffer.concat([
        Buffer.from([0x30, ...derLength(content.length)]),
        content,
    ]);
}

/**
 * 验证 Apple Identity Token
 *
 * @param identityToken - Apple 返回的 JWT identity token
 * @param bundleId - 应用的 Bundle ID（用于验证 aud）
 * @returns 验证后的 token claims，包含用户的 Apple sub ID
 */
export async function verifyAppleIdentityToken(
    identityToken: string,
    bundleId: string,
): Promise<AppleTokenClaims> {
    // 1. 解码 header 获取 kid
    const decodedHeader = jwt.decode(identityToken, { complete: true });
    if (!decodedHeader || typeof decodedHeader === 'string') {
        throw new Error('Invalid Apple identity token format');
    }

    const kid = decodedHeader.header.kid;
    if (!kid) {
        throw new Error('Apple identity token missing kid in header');
    }

    // 2. 获取 Apple 公钥
    const keys = await fetchApplePublicKeys();
    const matchingKey = keys.find(k => k.kid === kid);

    if (!matchingKey) {
        // 强制刷新缓存后重试
        cacheExpiry = 0;
        const freshKeys = await fetchApplePublicKeys();
        const retryKey = freshKeys.find(k => k.kid === kid);
        if (!retryKey) {
            throw new Error(`No matching Apple public key found for kid: ${kid}`);
        }
        return verifyWithKey(identityToken, retryKey, bundleId);
    }

    return verifyWithKey(identityToken, matchingKey, bundleId);
}

function verifyWithKey(
    identityToken: string,
    key: AppleJWK,
    bundleId: string,
): AppleTokenClaims {
    const publicKey = jwkToPem(key);

    // 3. 验证 JWT 签名和 claims
    const claims = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: APPLE_ISSUER,
        audience: bundleId,
    }) as AppleTokenClaims;

    // 4. 额外验证
    if (!claims.sub) {
        throw new Error('Apple identity token missing sub claim');
    }

    return claims;
}
