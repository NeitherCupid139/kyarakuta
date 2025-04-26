import { createZhipu, zhipu } from "zhipu-ai-provider";
import { streamText } from "ai";

// 创建智谱 AI 客户端
const zhipuAI = process.env.ZHIPU_API_KEY
	? createZhipu({
			apiKey: process.env.ZHIPU_API_KEY,
	  })
	: zhipu;

// 与角色对话的函数
export async function chatWithCharacter(
	characterInfo: {
		name: string;
		description: string;
		attributes?: Record<string, string>; // 避免使用 any 类型
	},
	userMessage: string
) {
	// 创建请求流
	const result = await streamText({
		model: zhipuAI("glm-4"),
		system: `你是一个名为 ${characterInfo.name} 的角色。
        角色描述: ${characterInfo.description}
        ${
					characterInfo.attributes
						? `角色属性: ${JSON.stringify(characterInfo.attributes, null, 2)}`
						: ""
				}
        
        请根据上述角色设定回答用户的问题，保持角色的语气、性格和知识范围。回答应当符合角色的背景设定和个性特点。
        请使用中文回答。`,
		messages: [
			{
				role: "user",
				content: userMessage,
			},
		],
		temperature: 0.7,
		maxTokens: 1000,
	});

	// 返回流式响应
	return new Response(result.textStream);
}

// 分析章节一致性的函数
export async function analyzeChapterConsistency(
	chapterContent: string,
	worldviewInfo: string,
	previousChaptersContext: string
) {
	const result = await streamText({
		model: zhipuAI("glm-4"),
		system: `你是一个专业的文学分析助手，负责分析章节内容是否与世界观设定和前后章节内容保持一致。
        请根据提供的世界观信息和前后章节上下文，分析当前章节是否存在以下问题：
        1. 是否与世界观设定冲突
        2. 是否与前后章节的情节连贯性存在问题
        3. 是否存在角色行为不一致的问题
        
        请提供详细的分析结果，包括发现的问题和具体建议。如果没有发现问题，请说明章节内容与世界观和上下文保持一致。
        请使用中文回答。`,
		messages: [
			{
				role: "user",
				content: `
        世界观信息：
        ${worldviewInfo}
        
        前后章节上下文：
        ${previousChaptersContext}
        
        当前章节内容：
        ${chapterContent}
        
        请分析这个章节内容是否与世界观设定和前后章节内容保持一致。`,
			},
		],
		temperature: 0.3,
		maxTokens: 1500,
	});

	// 等待完整文本回复
	const textContent = await result.text;

	return {
		result: textContent,
		isConsistent: !textContent?.includes("问题") || false,
	};
}

/**
 * AI功能集中导出
 * 统一导出所有AI功能，便于调用
 */

// 导出AI配置
export * from "./config";

// 导出AI客户端功能
export * from "./client";

// 导出智谱AI客户端实例，供其他模块使用
export { zhipuAI };
