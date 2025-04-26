import { analyzeChapterConsistency } from "@/app/lib/ai";

export async function POST(req: Request) {
	try {
		// 解析请求体
		const {
			chapterId,
			chapterTitle,
			chapterContent,
			worldviewInfo,
			previousChaptersContext,
			customPrompt,
		} = await req.json();

		// 参数验证
		if (!chapterContent) {
			return new Response(JSON.stringify({ error: "章节内容不能为空" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 构建分析上下文
		const analysisContext = `
      章节标题: ${chapterTitle || "无标题"}
      
      ${customPrompt ? `特殊分析要求: ${customPrompt}\n\n` : ""}
      
      世界观信息:
      ${worldviewInfo || "无特定世界观信息"}
      
      前后章节上下文:
      ${previousChaptersContext || "无前后章节上下文"}
    `;

		// 调用AI分析函数
		const analysisResult = await analyzeChapterConsistency(
			chapterContent,
			worldviewInfo || "",
			previousChaptersContext || ""
		);

		// 返回分析结果
		return new Response(
			JSON.stringify({
				result: analysisResult.result,
				isConsistent: analysisResult.isConsistent,
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("章节一致性分析错误:", error);
		return new Response(
			JSON.stringify({ error: "分析处理失败", details: String(error) }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
