import React, { useState, useEffect } from "react";
import { useAI } from "@/app/hooks/useAI";
import type { Chapter } from "@/app/db/schema";
import { query } from "@/app/db";

// 定义分析结果类型
type AnalysisResult = {
	score: number;
	details: string[];
	suggestions: string[];
};

/**
 * 章节一致性分析窗口组件
 * 实现章节一致性分析功能
 */
const ChapterConsistencyAnalyzer: React.FC<{
	onClose: () => void;
	chapterId?: number;
}> = ({ onClose, chapterId }) => {
	// 获取AI功能相关操作
	const { loading, error, analyzeChapterConsistency } = useAI(
		chapterId ? String(chapterId) : ""
	);

	// 状态管理
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [selectedChapterId, setSelectedChapterId] = useState<string>("");
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
		null
	);

	// 获取章节数据
	useEffect(() => {
		const fetchData = async () => {
			try {
				// 获取章节
				const { data: chaptersData } = await query<Chapter>("chapters", {});
				setChapters(chaptersData || []);

				// 默认选择第一个章节（如果有）
				if (chaptersData && chaptersData.length > 0) {
					setSelectedChapterId(chaptersData[0].id);
				}
			} catch (err) {
				console.error("获取数据失败:", err);
			}
		};

		fetchData();
	}, []);

	// 处理章节选择变化
	const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedChapterId(e.target.value);
	};

	// 分析一致性
	const handleAnalyzeConsistency = async () => {
		if (!selectedChapterId) {
			alert("请选择一个章节");
			return;
		}

		try {
			const analysis = await analyzeChapterConsistency(selectedChapterId);
			setAnalysisResult(analysis);
		} catch (err) {
			console.error("分析一致性失败:", err);
			alert(err instanceof Error ? err.message : "分析一致性失败");
		}
	};

	return (
		<div className="window" style={{ width: "700px", zIndex: 10 }}>
			<div className="title-bar">
				<div className="title-bar-text">章节一致性分析</div>
				<div className="title-bar-controls">
					<button aria-label="Minimize"></button>
					<button aria-label="Maximize"></button>
					<button aria-label="Close" onClick={onClose}></button>
				</div>
			</div>

			<div className="window-body">
				<div className="p-4">
					{loading ? (
						<p>处理中，请稍候...</p>
					) : error ? (
						<p className="text-red-500">错误: {error.message}</p>
					) : (
						// 章节一致性分析界面
						<div>
							<div className="mb-4">
								<label htmlFor="chapter" className="block mb-2">
									选择章节
								</label>
								<select
									id="chapter"
									value={selectedChapterId}
									onChange={handleChapterChange}
									className="w-full"
								>
									{chapters.length === 0 ? (
										<option value="">没有可用章节</option>
									) : (
										chapters.map((chapter) => (
											<option key={chapter.id} value={chapter.id}>
												{chapter.title}
											</option>
										))
									)}
								</select>
							</div>

							<div className="text-center mb-4">
								<button
									onClick={handleAnalyzeConsistency}
									disabled={!selectedChapterId}
								>
									分析一致性
								</button>
							</div>

							{analysisResult && (
								<div className="mt-4 p-4 bg-gray-50 border">
									<h3 className="mb-2">分析结果</h3>
									<div className="mb-2">
										<div className="flex items-center">
											<span>一致性评分：</span>
											<div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
												<div
													className="bg-blue-600 h-2.5 rounded-full"
													style={{ width: `${analysisResult.score}%` }}
												></div>
											</div>
											<span className="ml-2">{analysisResult.score}</span>
										</div>
									</div>

									<div className="mb-2">
										<h4 className="font-bold">详细分析：</h4>
										<ul className="list-disc pl-5">
											{analysisResult.details.map(
												(detail: string, i: number) => (
													<li key={i}>{detail}</li>
												)
											)}
										</ul>
									</div>

									<div>
										<h4 className="font-bold">改进建议：</h4>
										<ul className="list-disc pl-5">
											{analysisResult.suggestions.map(
												(suggestion: string, i: number) => (
													<li key={i}>{suggestion}</li>
												)
											)}
										</ul>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChapterConsistencyAnalyzer;
