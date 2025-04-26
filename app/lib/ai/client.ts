import OpenAI from "openai";
import { DEFAULT_MODEL, TASK_MODELS, TASK_TEMPERATURES } from "./config";

/**
 * OpenAI客户端实例
 */
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || "",
	dangerouslyAllowBrowser: true, // 允许在浏览器端使用（仅在开发环境使用）
});

/**
 * 对话请求类型
 */
type ChatRequest = {
	messages: {
		role: "system" | "user" | "assistant";
		content: string;
	}[];
	model?: string;
	temperature?: number;
	stream?: boolean;
};

/**
 * 角色对话类型
 */
export type CharacterChatParams = {
	characterInfo: string;
	message: string;
	chatHistory?: {
		role: "user" | "assistant";
		content: string;
	}[];
};

/**
 * 章节分析类型
 */
export type StoryAnalysisParams = {
	title: string;
	content: string;
	characters?: string[];
	worldbuilding?: string;
};

/**
 * 一致性检查类型
 */
export type ConsistencyCheckParams = {
	title: string;
	content: string;
	characters?: string[];
	worldbuilding?: string;
	events?: string[];
};

/**
 * 执行通用对话请求
 * @param request 对话请求参数
 * @returns 对话响应
 */
export async function chatCompletion(request: ChatRequest) {
	try {
		const response = await openai.chat.completions.create({
			model: request.model || DEFAULT_MODEL,
			messages: request.messages,
			temperature: request.temperature || 0.7,
			stream: request.stream || false,
		});

		return response;
	} catch (error) {
		console.error("AI对话请求失败:", error);
		throw new Error("AI对话请求失败");
	}
}

/**
 * 角色对话
 * @param params 角色对话参数
 * @returns 角色回应
 */
export async function characterChat(params: CharacterChatParams) {
	const { characterInfo, message, chatHistory = [] } = params;

	// 构建系统提示
	const systemMessage = {
		role: "system" as const,
		content: `
      你现在是一个虚构角色，请根据以下角色设定进行回答。
      回答时请始终保持角色特点，不要暴露你是AI的事实。
      
      角色设定：
      ${characterInfo}
      
      请以这个角色的第一人称进行回答，反映角色的语气和个性。
    `,
	};

	// 构建消息历史
	const messageHistory = chatHistory.map((msg) => ({
		role: msg.role,
		content: msg.content,
	}));

	// 添加当前用户消息
	const userMessage = {
		role: "user" as const,
		content: message,
	};

	// 发送请求
	const response = await chatCompletion({
		messages: [systemMessage, ...messageHistory, userMessage],
		model: TASK_MODELS.CHARACTER_CHAT,
		temperature: TASK_TEMPERATURES.CHARACTER_CHAT,
	});

	return response.choices[0]?.message?.content || "角色无法回应";
}

/**
 * 故事分析
 * @param params 故事分析参数
 * @returns 分析结果
 */
export async function storyAnalysis(params: StoryAnalysisParams) {
	const { title, content, characters = [], worldbuilding = "" } = params;

	// 构建系统提示
	const systemMessage = {
		role: "system" as const,
		content: `
      你是一个专业的文学分析助手，专注于分析故事的情节、角色发展、主题和写作技巧。
      请提供客观、深入的分析，并指出故事中的优点和可以改进的地方。
      分析应包括：
      1. 情节概要及评价
      2. 角色发展与塑造
      3. 主题与象征
      4. 写作风格与技巧
      5. 改进建议
    `,
	};

	// 构建用户消息
	const userMessage = {
		role: "user" as const,
		content: `
      请分析以下故事：
      
      标题：${title}
      
      ${characters.length > 0 ? `涉及角色：${characters.join(", ")}` : ""}
      
      ${worldbuilding ? `世界观背景：${worldbuilding}` : ""}
      
      故事内容：
      ${content}
    `,
	};

	// 发送请求
	const response = await chatCompletion({
		messages: [systemMessage, userMessage],
		model: TASK_MODELS.STORY_ANALYSIS,
		temperature: TASK_TEMPERATURES.STORY_ANALYSIS,
	});

	return response.choices[0]?.message?.content || "无法完成分析";
}

/**
 * 一致性检查
 * @param params 一致性检查参数
 * @returns 检查结果
 */
export async function consistencyCheck(params: ConsistencyCheckParams) {
	const {
		title,
		content,
		characters = [],
		worldbuilding = "",
		events = [],
	} = params;

	// 构建系统提示
	const systemMessage = {
		role: "system" as const,
		content: `
      你是一个专业的故事一致性检查工具。你的任务是找出故事中的逻辑矛盾、情节漏洞和连贯性问题。
      请仔细检查以下内容:
      1. 情节连贯性
      2. 角色行为一致性
      3. 时间线问题
      4. 世界观设定冲突
      5. 其他逻辑错误
      
      请列出所有发现的问题，并简要说明原因和建议解决方法。
    `,
	};

	// 构建用户消息
	const userMessage = {
		role: "user" as const,
		content: `
      请检查以下故事的一致性问题：
      
      标题：${title}
      
      ${characters.length > 0 ? `涉及角色：${characters.join(", ")}` : ""}
      
      ${worldbuilding ? `世界观设定：${worldbuilding}` : ""}
      
      ${events.length > 0 ? `相关事件：${events.join(", ")}` : ""}
      
      故事内容：
      ${content}
    `,
	};

	// 发送请求
	const response = await chatCompletion({
		messages: [systemMessage, userMessage],
		model: TASK_MODELS.CONSISTENCY_CHECK,
		temperature: TASK_TEMPERATURES.CONSISTENCY_CHECK,
	});

	return response.choices[0]?.message?.content || "无法完成一致性检查";
}
