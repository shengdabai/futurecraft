import { generateContent } from './geminiService.js';

/**
 * AI Life Simulation Service
 * Generates video scripts and scenarios based on user's desired life experience
 */

export interface LifeSimulationRequest {
  description: string;
  language?: 'zh' | 'en';
  duration?: 'short' | 'medium' | 'long';
}

export interface VideoScript {
  title: string;
  description: string;
  scenes: VideoScene[];
  tags: string[];
}

export interface VideoScene {
  sceneNumber: number;
  setting: string;
  action: string;
  dialogue?: string;
  mood: string;
  duration: string;
}

/**
 * Generate life simulation video script based on user description
 * Examples:
 * - "我想体验一下当老师的生活" (I want to experience life as a teacher)
 * - "乡村教师" (Rural teacher)
 * - "大学教授" (University professor)
 */
export async function generateLifeSimulationVideo(
  data: LifeSimulationRequest
): Promise<{ result: VideoScript; usage: { inputTokens: number; outputTokens: number } }> {
  const isZh = (data.language || 'zh') === 'zh';
  const duration = data.duration || 'medium';

  const prompt = `
You are an expert video script writer for an AI Life Simulation platform.

User wants to experience: "${data.description}"
Target Language: ${isZh ? 'Simplified Chinese' : 'English'}
Video Duration: ${duration}

Your task is to create an immersive, first-person perspective video script that simulates the daily life of this role.
Make it feel authentic, engaging, and emotionally resonant.

Return a valid JSON object with this structure:
{
  "title": "Catchy title for this life simulation",
  "description": "Brief overview of what this video will show",
  "scenes": [
    {
      "sceneNumber": 1,
      "setting": "Where does this scene take place? (e.g., 'Classroom, morning sunlight streaming through windows')",
      "action": "What is happening? First-person perspective, present tense",
      "dialogue": "Optional: What is being said or thought",
      "mood": "Emotional tone (e.g., 'inspiring', 'challenging', 'peaceful', 'exciting')",
      "duration": "Approximate duration in seconds (e.g., '15-20s')"
    }
  ],
  "tags": ["array of 3-5 relevant keywords for categorization"]
}

Guidelines:
- Create 3-5 distinct scenes that tell a coherent story
- Each scene should be 15-30 seconds
- Start with a morning routine or beginning of work
- Include a challenge or meaningful moment
- End with reflection or conclusion
- Make it visually descriptive and emotionally engaging
- Use first-person perspective ("I wake up", "I see", etc.)
${isZh ? '- Use natural, colloquial Chinese' : '- Use natural, conversational English'}
`;

  const { text, usage } = await generateContent(prompt, {
    responseFormat: 'json',
    temperature: 0.8,
  });

  let result: VideoScript;
  try {
    result = JSON.parse(text) as VideoScript;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { result, usage };
}

/**
 * Generate multiple variations of life simulation for the same description
 * Useful for showing different perspectives or scenarios
 */
export async function generateLifeSimulationVariations(
  data: LifeSimulationRequest & { variationCount?: number }
): Promise<{
  results: VideoScript[];
  usage: { inputTokens: number; outputTokens: number };
}> {
  const variationCount = data.variationCount || 3;

  const prompt = `
You are an expert video script writer for an AI Life Simulation platform.

User wants to experience: "${data.description}"
Target Language: ${data.language === 'zh' ? 'Simplified Chinese' : 'English'}

Generate ${variationCount} DIFFERENT video script variations that explore different aspects or scenarios of this life experience.

Each variation should have a unique angle:
- Variation 1: Focus on daily routine and work activities
- Variation 2: Focus on challenges and problem-solving
- Variation 3: Focus on emotional rewards and personal growth

Return a valid JSON object:
{
  "variations": [
    {
      "title": "Unique title for variation 1",
      "description": "Brief overview",
      "angle": "What aspect this variation focuses on",
      "scenes": [
        {
          "sceneNumber": 1,
          "setting": "Scene setting",
          "action": "First-person action description",
          "dialogue": "Optional dialogue or thoughts",
          "mood": "Emotional tone",
          "duration": "15-30s"
        }
      ],
      "tags": ["relevant", "keywords"]
    }
  ]
}
`;

  const { text, usage } = await generateContent(prompt, {
    responseFormat: 'json',
    temperature: 0.9,
    maxTokens: 4000,
  });

  let parsed: { variations: VideoScript[] };
  try {
    parsed = JSON.parse(text) as { variations: VideoScript[] };
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  const results = parsed.variations;

  return { results, usage };
}

/**
 * Generate life simulation suggestions based on popular careers
 */
export async function getLifeSimulationSuggestions(
  language: 'zh' | 'en' = 'zh'
): Promise<{
  suggestions: Array<{ title: string; description: string; category: string }>;
  usage: { inputTokens: number; outputTokens: number };
}> {
  const isZh = language === 'zh';

  const prompt = `
Generate 10 popular and interesting life simulation suggestions for an AI video generation platform.
Target Language: ${isZh ? 'Simplified Chinese' : 'English'}

Include diverse careers and lifestyles:
- Education (teachers, professors)
- Healthcare (doctors, nurses)
- Technology (software engineers, designers)
- Creative fields (artists, writers, musicians)
- Service industry (chefs, baristas)
- Outdoor jobs (farmers, park rangers)
- And more...

Return valid JSON:
{
  "suggestions": [
    {
      "title": "Job title or lifestyle",
      "description": "One sentence description of what makes this interesting to experience",
      "category": "Category name (e.g., 'Education', 'Technology', 'Creative')"
    }
  ]
}

Make descriptions engaging and curiosity-inducing.
`;

  const { text, usage } = await generateContent(prompt, {
    responseFormat: 'json',
    temperature: 0.7,
  });

  let result: {
    suggestions: Array<{ title: string; description: string; category: string }>;
  };
  try {
    result = JSON.parse(text) as typeof result;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { ...result, usage };
}
