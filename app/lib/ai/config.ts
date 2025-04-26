/**
 * AI配置文件
 * 用于配置AI相关的参数和设置
 */

// OpenAI模型选择
export const MODEL_NAMES = {
	GPT4: "gpt-4-0125-preview",
	GPT35: "gpt-3.5-turbo",
} as const;

// 默认模型
export const DEFAULT_MODEL = MODEL_NAMES.GPT35;

// 不同任务使用的模型
export const TASK_MODELS = {
	CHARACTER_CHAT: MODEL_NAMES.GPT35,
	STORY_ANALYSIS: MODEL_NAMES.GPT4,
	CONSISTENCY_CHECK: MODEL_NAMES.GPT4,
} as const;

// 温度设置（0-2之间，越高创造性越强，越低确定性越高）
export const TEMPERATURES = {
	HIGH_CREATIVITY: 1.2, // 高创造性
	BALANCED: 0.7, // 平衡
	FACTUAL: 0.2, // 精确/事实性
} as const;

// 不同任务的温度设置
export const TASK_TEMPERATURES = {
	CHARACTER_CHAT: TEMPERATURES.BALANCED,
	STORY_ANALYSIS: TEMPERATURES.FACTUAL,
	CONSISTENCY_CHECK: TEMPERATURES.FACTUAL,
} as const;

// 最大token限制
export const MAX_TOKENS = {
	GPT4: 8192,
	GPT35: 4096,
} as const;

// 系统提示词模板
export const SYSTEM_PROMPTS = {
	CHARACTER_CHAT: (characterInfo: string) => `
    你现在是一个虚构角色，请根据以下角色设定进行回答。
    回答时请始终保持角色特点，不要暴露你是AI的事实。
    
    角色设定：
    ${characterInfo}
    
    请以这个角色的第一人称进行回答，反映角色的语气和个性。
  `,

	STORY_ANALYSIS: `
    你是一个专业的文学分析助手，专注于分析故事的情节、角色发展、主题和写作技巧。
    请提供客观、深入的分析，并指出故事中的优点和可以改进的地方。
    分析应包括：
    1. 情节概要及评价
    2. 角色发展与塑造
    3. 主题与象征
    4. 写作风格与技巧
    5. 改进建议
  `,

	CONSISTENCY_CHECK: `
    你是一个专业的故事一致性检查工具。你的任务是找出故事中的逻辑矛盾、情节漏洞和连贯性问题。
    请仔细检查以下内容:
    1. 情节连贯性
    2. 角色行为一致性
    3. 时间线问题
    4. 世界观设定冲突
    5. 其他逻辑错误
    
    请列出所有发现的问题，并简要说明原因和建议解决方法。
  `,
} as const;
