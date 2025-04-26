import { Message as AIMessage, StreamingTextResponse, streamText } from "ai";
import { createZhipu, zhipu } from "zhipu-ai-provider";

// 声明模块
declare module "ai" {
	export class StreamingTextResponse extends Response {
		constructor(stream: ReadableStream);
	}
}

// 创建智谱AI客户端
const zhipuAI = process.env.ZHIPU_API_KEY
	? createZhipu({
			apiKey: process.env.ZHIPU_API_KEY,
	  })
	: zhipu;

// 消息类型定义
interface ChatMessage extends AIMessage {
	content: string;
	role: "user" | "assistant" | "system";
}

export async function POST(req: Request) {
	// 解析请求体
	const {
		messages,
		characterPrompt,
		characterName,
		characterAttributes = {},
	} = await req.json();

	// 获取最新用户消息
	const latestMessage = messages[messages.length - 1].content;

	try {
		// 使用角色属性增强系统提示
		let enhancedPrompt = characterPrompt;
		if (Object.keys(characterAttributes).length > 0) {
			enhancedPrompt += `\n\n角色属性:\n${Object.entries(characterAttributes)
				.map(([key, value]) => `${key}: ${value}`)
				.join("\n")}`;
		}

		// 创建对话流
		const result = await streamText({
			model: zhipuAI("glm-4"),
			// 系统提示结合角色信息
			system:
				enhancedPrompt ||
				`你是一个名为${
					characterName || "角色"
				}的虚构角色。请保持角色的语气和特点回答问题。`,
			messages: [
				// 添加历史消息（去掉最新的一条）
				...messages.slice(0, -1).map((msg: ChatMessage) => ({
					role: msg.role,
					content: msg.content,
				})),
				// 添加最新消息
				{
					role: "user",
					content: latestMessage,
				},
			],
			temperature: 0.7,
			maxTokens: 1000,
		});

		// 返回流式响应
		return new StreamingTextResponse(result.textStream);
	} catch (error) {
		// 错误处理
		console.error("角色对话生成错误:", error);
		return new Response(JSON.stringify({ error: "对话处理失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
