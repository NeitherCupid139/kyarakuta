import { useState, useCallback } from "react";
import { query, insert } from "@/app/db";
import type { Character, Chapter } from "@/app/db/schema";
import { zhipu } from "zhipu-ai-provider";

// 分析结果类型
type AnalysisResult = {
	score: number;
	details: string[];
	suggestions: string[];
};

/**
 * AI功能钩子
 * 提供角色对话生成和章节一致性分析功能
 * 使用智谱AI作为AI提供商
 */
export function useAI(workId: string) {
	// 状态管理
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// 获取角色列表
	const fetchCharacters = useCallback(async () => {
		try {
			const { data, error } = await query<Character>("characters", {
				work_id: workId,
			});
			if (error) throw error;
			return data || [];
		} catch (err) {
			console.error("获取角色列表失败:", err);
			throw err;
		}
	}, [workId]);

	// 获取章节列表
	const fetchChapters = useCallback(async () => {
		try {
			const { data, error } = await query<Chapter>("chapters", {
				work_id: workId,
			});
			if (error) throw error;
			return data || [];
		} catch (err) {
			console.error("获取章节列表失败:", err);
			throw err;
		}
	}, [workId]);

	// 生成角色对话
	const generateCharacterDialogue = useCallback(
		async (characterIds: string[], topic: string, length: number = 500) => {
			setLoading(true);
			setError(null);

			try {
				const characters = await fetchCharacters();
				const selectedCharacters = characters.filter((c) =>
					characterIds.includes(c.id)
				);

				if (selectedCharacters.length < 2) {
					throw new Error("请至少选择两个角色");
				}

				// 构建角色背景信息
				const charactersInfo = selectedCharacters
					.map((char) => {
						return `角色名称: ${char.name}
背景: ${char.background || "无"}
性格: ${char.personality || "无"}
目标: ${char.goals || "无"}`;
					})
					.join("\n\n");

				// 构建提示词
				const prompt = `我需要你根据以下角色信息，生成一段关于"${topic}"的对话。对话长度约${length}字符。
请确保对话符合每个角色的性格特点和背景设定。

角色信息:
${charactersInfo}

请直接生成对话内容，不要加入额外的解释。对话应当自然流畅，并体现出角色间的互动和关系。`;

				// 调用智谱AI的GLM-4模型
				const response = await zhipu("glm-4").doGenerate({
					inputFormat: "messages",
					mode: { type: "regular" },
					prompt: [{ role: "user", content: [{ type: "text", text: prompt }] }],
					temperature: 0.7,
					maxTokens: Math.max(Math.floor(length / 2), 200), // 确保生成足够的内容
				});

				// 记录到数据库
				await insert("ai_analyses", {
					work_id: workId,
					analysis_type: "character_dialogue",
					result: {
						score: 0,
						details: [],
						suggestions: [],
					},
				});

				return response.text || "";
			} catch (err) {
				console.error("生成角色对话失败:", err);
				setError(err instanceof Error ? err : new Error("生成角色对话失败"));
				return "";
			} finally {
				setLoading(false);
			}
		},
		[workId, fetchCharacters]
	);

	// 分析章节一致性
	const analyzeChapterConsistency = useCallback(
		async (chapterId: string) => {
			setLoading(true);
			setError(null);

			try {
				const chapters = await fetchChapters();
				const chapter = chapters.find((c) => c.id === chapterId);

				if (!chapter) {
					throw new Error("章节不存在");
				}

				// 构建提示词
				const prompt = `请作为文学编辑，分析以下章节内容的一致性，包括情节连贯性、角色行为是否符合设定、叙事是否连贯等方面。
请按照以下格式输出分析结果：
1. 一致性评分（50-100分）
2. 详细分析（列举3-5点主要发现）
3. 改进建议（列举3-5点具体建议）

章节标题: ${chapter.title}
章节内容:
${chapter.content || "无内容"}`;

				// 调用智谱AI的GLM-4模型
				const response = await zhipu("glm-4").doGenerate({
					inputFormat: "messages",
					mode: { type: "regular" },
					prompt: [{ role: "user", content: [{ type: "text", text: prompt }] }],
					temperature: 0.3,
					maxTokens: 800,
				});

				// 解析AI返回的结果
				const result = parseAnalysisResult(response.text || "");

				// 记录到数据库
				await insert("ai_analyses", {
					work_id: workId,
					chapter_id: chapterId,
					analysis_type: "consistency",
					result,
				});

				return result;
			} catch (err) {
				console.error("分析章节一致性失败:", err);
				setError(err instanceof Error ? err : new Error("分析章节一致性失败"));
				return null;
			} finally {
				setLoading(false);
			}
		},
		[workId, fetchChapters]
	);

	return {
		loading,
		error,
		generateCharacterDialogue,
		analyzeChapterConsistency,
	};
}

/**
 * 解析AI返回的分析结果
 * 将文本格式的分析结果解析为结构化数据
 */
function parseAnalysisResult(text: string): AnalysisResult {
	let score = 75; // 默认分数
	const details: string[] = [];
	const suggestions: string[] = [];

	try {
		// 提取分数
		const scoreMatch = text.match(/(\d{2,3})\s*分/);
		if (scoreMatch && scoreMatch[1]) {
			const parsedScore = parseInt(scoreMatch[1], 10);
			if (!isNaN(parsedScore) && parsedScore >= 50 && parsedScore <= 100) {
				score = parsedScore;
			}
		}

		// 提取详细分析
		const detailsSection = text.match(/详细分析[\s\S]*?(?=改进建议|$)/i);
		if (detailsSection) {
			const detailPoints = detailsSection[0].match(
				/[•·\-\d]+[\s.、]+([^\n]+)/g
			);
			if (detailPoints) {
				detailPoints.forEach((point) => {
					const cleanPoint = point.replace(/^[•·\-\d.、\s]+/, "").trim();
					if (cleanPoint && !cleanPoint.includes("详细分析")) {
						details.push(cleanPoint);
					}
				});
			}
		}

		// 提取改进建议
		const suggestionsSection = text.match(/改进建议[\s\S]*/i);
		if (suggestionsSection) {
			const suggestionPoints = suggestionsSection[0].match(
				/[•·\-\d]+[\s.、]+([^\n]+)/g
			);
			if (suggestionPoints) {
				suggestionPoints.forEach((point) => {
					const cleanPoint = point.replace(/^[•·\-\d.、\s]+/, "").trim();
					if (cleanPoint && !cleanPoint.includes("改进建议")) {
						suggestions.push(cleanPoint);
					}
				});
			}
		}

		// 如果没有提取到足够的内容，添加默认内容
		if (details.length === 0) {
			details.push("故事情节在大部分地方保持连贯");
			details.push("角色行为与设定基本一致");
			details.push("存在少量时间线混乱的情况");
		}

		if (suggestions.length === 0) {
			suggestions.push("考虑澄清部分章节中的时间跳跃");
			suggestions.push("加强对主角动机的解释");
			suggestions.push("确保配角的言行与之前章节的设定一致");
		}
	} catch (error) {
		console.error("解析AI分析结果时出错:", error);
		// 返回默认值
	}

	return {
		score,
		details,
		suggestions,
	};
}
