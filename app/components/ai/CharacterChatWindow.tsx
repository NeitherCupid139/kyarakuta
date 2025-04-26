"use client";

import React, { useState, useRef, useEffect } from "react";
import Window98 from "@/app/components/Window98";
import Image from "next/image";

// 定义组件属性接口
interface CharacterChatWindowProps {
	onClose: () => void;
	character: {
		id: number;
		name: string;
		description: string;
		traits?: string;
		background?: string;
	};
}

// 定义消息类型
interface Message {
	role: "user" | "assistant";
	content: string;
	timestamp?: Date;
}

// 角色属性接口
interface CharacterAttributes {
	name: string;
	description: string;
	traits: string;
	background: string;
}

// 自定义钩子：管理聊天逻辑
const useChatLogic = (character: CharacterChatWindowProps["character"]) => {
	// 状态管理
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 角色属性
	const characterAttributes: CharacterAttributes = {
		name: character.name,
		description: character.description,
		traits: character.traits || "",
		background: character.background || "",
	};

	// 滚动到最新消息
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 发送消息
	const handleSendMessage = async () => {
		if (!input.trim()) return;

		// 添加用户消息
		const userMessage: Message = {
			role: "user",
			content: input,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			// 准备历史消息
			const chatHistory = messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			// 添加新的用户消息
			chatHistory.push(userMessage);

			// 调用API
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: chatHistory,
					characterAttributes,
				}),
			});

			if (!response.ok) {
				throw new Error("通信失败");
			}

			// 设置响应流
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = "";

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					assistantMessage += chunk;

					// 实时更新消息
					setMessages((prev) => {
						// 检查是否已经有一个助手消息正在更新
						const hasAssistantMessage =
							prev[prev.length - 1]?.role === "assistant";

						if (hasAssistantMessage) {
							// 更新现有助手消息
							return [
								...prev.slice(0, -1),
								{
									role: "assistant",
									content: assistantMessage,
									timestamp: new Date(),
								},
							];
						} else {
							// 添加新的助手消息
							return [
								...prev,
								{
									role: "assistant",
									content: assistantMessage,
									timestamp: new Date(),
								},
							];
						}
					});
				}
			}
		} catch (error) {
			console.error("消息发送失败:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "抱歉，我无法回应你的消息。请稍后再试。",
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// 处理输入框按键事件
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	return {
		messages,
		input,
		setInput,
		isLoading,
		messagesEndRef,
		handleSendMessage,
		handleKeyDown,
	};
};

// 消息列表组件
const MessageList = ({
	messages,
	isLoading,
	messagesEndRef,
	characterName,
}: {
	messages: Message[];
	isLoading: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	characterName: string;
}) => {
	if (messages.length === 0) {
		return (
			<div className="text-center text-gray-500 mt-4">
				<p>开始与 {characterName} 对话吧！</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full">
			{messages.map((msg, index) => (
				<div
					key={index}
					className={`mb-2 p-2 rounded max-w-3/4 ${
						msg.role === "user"
							? "ml-auto bg-blue-100 text-right"
							: "mr-auto bg-gray-100"
					}`}
				>
					<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
					{msg.timestamp && (
						<p className="text-xs text-gray-500 mt-1">
							{msg.timestamp.toLocaleTimeString()}
						</p>
					)}
				</div>
			))}
			{isLoading && (
				<div className="flex justify-center my-2">
					<div className="animate-pulse text-center text-gray-500">
						<p>正在思考...</p>
					</div>
				</div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
};

const CharacterChatWindow: React.FC<CharacterChatWindowProps> = ({
	onClose,
	character,
}) => {
	// 使用自定义钩子
	const {
		messages,
		input,
		setInput,
		isLoading,
		messagesEndRef,
		handleSendMessage,
		handleKeyDown,
	} = useChatLogic(character);

	return (
		<Window98
			title={`与 ${character.name} 对话`}
			initialPosition={{ top: 50, left: 50 }}
			initialSize={{ width: 600, height: 700 }}
			minWidth={400}
			minHeight={500}
			maxWidth={1000}
			maxHeight={900}
			onClose={onClose}
			iconUrl="/icons/chat.png"
		>
			<div className="flex flex-col h-full">
				{/* 角色信息展示 */}
				<div className="flex items-center border-b p-2 bg-gray-100">
					<div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex-shrink-0 overflow-hidden">
						<Image
							src={`/icons/character${character.id % 5 || 1}.png`}
							alt={character.name}
							width={48}
							height={48}
							className="object-cover"
						/>
					</div>
					<div className="flex-1">
						<h3 className="font-bold">{character.name}</h3>
						<p className="text-xs text-gray-600 truncate">
							{character.description}
						</p>
					</div>
				</div>

				{/* 消息展示区 */}
				<div
					className="flex-1 overflow-y-auto p-2 bg-white"
					style={{ minHeight: 0 }}
				>
					<MessageList
						messages={messages}
						isLoading={isLoading}
						messagesEndRef={messagesEndRef}
						characterName={character.name}
					/>
				</div>

				{/* 输入区 */}
				<div className="border-t p-2 bg-gray-100">
					<div className="field-row-stacked w-full">
						<textarea
							className="w-full p-2 h-24 resize-none"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={`对 ${character.name} 说些什么...`}
							disabled={isLoading}
						/>
					</div>
					<div className="field-row justify-end mt-2">
						<button
							className="button"
							onClick={handleSendMessage}
							disabled={isLoading || !input.trim()}
						>
							发送
						</button>
					</div>
				</div>
			</div>
		</Window98>
	);
};

export default CharacterChatWindow;
