/**
 * API 服务层 - 所有请求通过后端代理
 * 不在前端暴露任何 API Key
 */

import { CareerPath, JobOption, Resource, UserProfile, SimulationStep, SimulationResult, RPGStats, Language } from "../types";

// 后端 API 基础配置
const API_CONFIG = {
    // 生产环境使用实际域名，开发环境使用本地代理
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 60000, // AI 请求可能较慢，设置 60 秒超时
};

// 获取存储的 Token
function getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
}

// 通用请求方法
async function apiRequest<T>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: Record<string, unknown>;
        requireAuth?: boolean;
    } = {}
): Promise<T> {
    const { method = 'POST', body, requireAuth = true } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // 添加认证 Token
    if (requireAuth) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401) {
                // Token 过期，清除并提示重新登录
                localStorage.removeItem('accessToken');
                throw new Error('会话已过期，请重新登录');
            }
            if (response.status === 429) {
                throw new Error('请求过于频繁，请稍后再试');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `请求失败: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接');
        }
        throw error;
    }
}

// ============================================
// AI 服务 - 通过后端代理调用
// ============================================

/**
 * Soul Scan - RPG 角色分析
 * 后端会调用 Gemini API 并返回结果
 */
export const performSoulScan = async (
    profile: UserProfile,
    lang: Language
): Promise<{ stats: RPGStats; archetype: string; careers: CareerPath[] }> => {
    return apiRequest('/ai/soul-scan', {
        body: {
            name: profile.name,
            major: profile.major,
            hobbies: profile.hobbies,
            hiddenTalent: profile.hiddenTalent,
            language: lang,
        },
    });
};

/**
 * 生成模拟场景
 */
export const generateSimulationScenario = async (
    jobTitle: string,
    lang: Language
): Promise<SimulationStep> => {
    return apiRequest('/ai/simulation', {
        body: {
            jobTitle,
            language: lang,
        },
    });
};

/**
 * 评估模拟选择
 */
export const evaluateSimulationChoice = async (
    jobTitle: string,
    scenario: string,
    choice: string,
    lang: Language
): Promise<SimulationResult> => {
    return apiRequest('/ai/simulation/evaluate', {
        body: {
            jobTitle,
            scenario,
            choice,
            language: lang,
        },
    });
};

/**
 * 生成技能树资源
 */
export const generateSkillTree = async (
    jobTitle: string,
    lang: Language
): Promise<Resource[]> => {
    return apiRequest('/ai/skill-tree', {
        body: {
            jobTitle,
            language: lang,
        },
    });
};

/**
 * AI 导师对话
 */
export const getTutorResponse = async (
    history: { role: 'user' | 'model'; text: string }[],
    message: string,
    jobContext: JobOption,
    isBossMode: boolean,
    lang: Language
): Promise<string> => {
    const response = await apiRequest<{ message: string }>('/ai/chat', {
        body: {
            history: history.map(h => ({ role: h.role, content: h.text })),
            message,
            jobTitle: jobContext.title,
            jobDescription: jobContext.description,
            isBossMode,
            language: lang,
        },
    });
    return response.message;
};

/**
 * AI 主播语音合成 (TTS)
 */
export const generateAnchorSpeech = async (text: string): Promise<string | undefined> => {
    try {
        const response = await apiRequest<{ audioData: string }>('/ai/tts', {
            body: { text },
        });
        return response.audioData;
    } catch (error) {
        console.error('TTS Error:', error);
        return undefined;
    }
};

/**
 * 解码音频数据 (本地处理，无需后端)
 */
export const decodeAudioData = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
};

// ============================================
// 用量与计费服务
// ============================================

/**
 * 获取用户使用情况
 */
export const getUsageStats = async (): Promise<{
    totalTokensUsed: number;
    totalCreditsUsed: number;
    remainingCredits: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
}> => {
    return apiRequest('/user/usage', { method: 'GET' });
};

/**
 * 获取实时费用
 */
export const getCurrentBilling = async (): Promise<{
    currentAmount: number;
    currency: string;
    billingCycleEnd: string;
}> => {
    return apiRequest('/user/billing', { method: 'GET' });
};

