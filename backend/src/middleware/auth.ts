import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// 用户 Payload 类型
export interface JwtPayload {
    userId: string;
    isGuest: boolean;
    region: string;
    iat?: number;
    exp?: number;
}

// 扩展 Express Request 类型
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: '请先登录',
        });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: 'TokenExpired',
                message: '登录已过期，请重新登录',
            });
        }
        return res.status(401).json({
            error: 'InvalidToken',
            message: '无效的认证令牌',
        });
    }
};

/**
 * 可选认证中间件
 * Token 有效则附加用户信息，无 Token 也允许继续
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
            req.user = decoded;
        } catch {
            // Token 无效，忽略
        }
    }

    next();
};

/**
 * 生成 JWT Token
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * 刷新 Token
 */
export const refreshToken = (oldPayload: JwtPayload): string => {
    const { iat, exp, ...payload } = oldPayload;
    return generateToken(payload);
};

