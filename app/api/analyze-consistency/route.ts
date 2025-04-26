import { analyzeChapterConsistency } from "@/app/lib/ai";

export async function POST(req: Request) {
	try {
		// 解析请求体
		const { chapterContent, worldviewInfo, previousChaptersContext } =
			await req.json();

		// 参数验证
		if (!chapterContent) {
			return new Response(JSON.stringify({ error: "章节内容不能为空" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

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
