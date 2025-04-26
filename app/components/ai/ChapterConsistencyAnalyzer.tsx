"use client";

import { useState, useRef, useEffect } from "react";
import Window98 from "@/app/components/Window98";

// 定义组件属性接口
interface ChapterConsistencyAnalyzerProps {
	onClose: () => void;
	chapterId?: number;
	chapterTitle?: string;
	chapterContent?: string;
	worldviewInfo?: string;
	previousChaptersContext?: string;
}

// 分析结果接口
interface AnalysisResult {
	result: string;
	isConsistent: boolean;
	issues?: Array<{
		type: string;
		description: string;
		location?: string;
		suggestion?: string;
	}>;
}

export default function ChapterConsistencyAnalyzer({
	onClose,
	chapterId,
	chapterTitle = "",
	chapterContent = "",
	worldviewInfo = "",
	previousChaptersContext = "",
}: ChapterConsistencyAnalyzerProps) {
	// 分析结果状态
	const [analysisResult, setAnalysisResult] = useState<string>("");
	// 是否正在分析
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	// 是否显示详细信息
	const [showDetails, setShowDetails] = useState(false);
	// 提示自定义
	const [customPrompt, setCustomPrompt] = useState("");
	// 输入文本区域引用
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	// 是否一致
	const [isConsistent, setIsConsistent] = useState<boolean | null>(null);
	// 问题列表
	const [issues, setIssues] = useState<AnalysisResult["issues"]>([]);

	// 初始化章节内容处理
	useEffect(() => {
		if (textareaRef.current && chapterContent) {
			textareaRef.current.value = chapterContent;
		}
	}, [chapterContent]);

	// 处理分析请求
	const handleAnalyze = async () => {
		if (isAnalyzing) return;

		setIsAnalyzing(true);
		setAnalysisResult("");
		setIsConsistent(null);
		setIssues([]);

		try {
			const response = await fetch("/api/analyze-consistency", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chapterId,
					chapterTitle,
					chapterContent: textareaRef.current?.value || chapterContent,
					worldviewInfo,
					previousChaptersContext,
					customPrompt,
				}),
			});

			if (!response.ok) {
				throw new Error("分析请求失败");
			}

			const data: AnalysisResult = await response.json();
			setAnalysisResult(data.result);
			setIsConsistent(data.isConsistent);
			if (data.issues) {
				setIssues(data.issues);
			}
		} catch (error) {
			console.error("分析错误:", error);
			setAnalysisResult("分析过程中发生错误，请稍后重试。");
		} finally {
			setIsAnalyzing(false);
		}
	};

	// 切换显示详细信息
	const toggleDetails = () => {
		setShowDetails(!showDetails);
	};

	return (
		<Window98
			title={`章节一致性分析 - ${chapterTitle || "无标题"}`}
			onClose={onClose}
			initialPosition={{ top: 100, left: 100 }}
			initialSize={{ width: 800, height: 600 }}
			iconUrl="/icons/analyze.png"
		>
			<div className="flex flex-col h-full">
				{/* 控制面板 */}
				<div className="p-2 border-b border-gray-300 bg-gray-100">
					<div className="flex flex-wrap gap-2 mb-2">
						<button
							onClick={handleAnalyze}
							disabled={isAnalyzing}
							className="px-3 py-1"
						>
							{isAnalyzing ? "分析中..." : "开始分析"}
						</button>
						<button onClick={toggleDetails} className="px-3 py-1">
							{showDetails ? "隐藏详细信息" : "显示详细信息"}
						</button>
					</div>

					{showDetails && (
						<div className="mt-2">
							<div className="field-row-stacked mb-2">
								<label htmlFor="custom-prompt">
									自定义分析提示词（可选）：
								</label>
								<textarea
									id="custom-prompt"
									value={customPrompt}
									onChange={(e) => setCustomPrompt(e.target.value)}
									placeholder="添加特定的分析要求..."
									className="w-full h-20"
								/>
							</div>
						</div>
					)}
				</div>

				<div className="flex-grow flex flex-row">
					{/* 章节内容区域 */}
					<div className="w-1/2 p-2 border-r border-gray-300 flex flex-col h-full">
						<h4 className="mb-2">章节内容</h4>
						<textarea
							ref={textareaRef}
							defaultValue={chapterContent}
							className="flex-grow p-2 font-mono text-sm"
							placeholder="在此输入或粘贴章节内容..."
						/>
					</div>

					{/* 分析结果区域 */}
					<div className="w-1/2 p-2 flex flex-col h-full">
						<h4 className="mb-2">分析结果</h4>

						{isAnalyzing ? (
							<div className="flex-grow flex items-center justify-center">
								<div className="text-center">
									<div className="flex justify-center space-x-2 mb-4">
										<div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce"></div>
										<div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-100"></div>
										<div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-200"></div>
									</div>
									<p>正在分析章节一致性，请稍候...</p>
								</div>
							</div>
						) : analysisResult ? (
							<div className="flex-grow overflow-auto">
								{isConsistent !== null && (
									<div
										className={`mb-4 p-2 ${
											isConsistent ? "bg-green-100" : "bg-red-100"
										}`}
									>
										<div className="font-bold">
											{isConsistent
												? "✅ 章节内容与世界观和前后文保持一致"
												: "⚠️ 检测到可能存在的一致性问题"}
										</div>
									</div>
								)}
								{issues && issues.length > 0 && (
									<div className="mb-4">
										<h5 className="font-bold mb-2">发现的问题：</h5>
										<ul className="list-disc pl-5">
											{issues.map((issue, index) => (
												<li key={index} className="mb-2">
													<div className="font-semibold">{issue.type}</div>
													<div>{issue.description}</div>
													{issue.suggestion && (
														<div className="text-green-700 mt-1">
															建议: {issue.suggestion}
														</div>
													)}
												</li>
											))}
										</ul>
									</div>
								)}
								<div className="whitespace-pre-wrap">{analysisResult}</div>
							</div>
						) : (
							<div className="flex-grow flex items-center justify-center text-gray-500">
								点击"开始分析"按钮分析当前章节
							</div>
						)}
					</div>
				</div>
			</div>
		</Window98>
	);
}
