import React, { useState, useEffect } from "react";

// 章节接口定义
export interface Chapter {
	id: number;
	title: string;
	summary: string;
}

// 表单属性定义
interface ChapterFormProps {
	chapter?: Chapter; // 可选，编辑时传入
	onSubmit: (chapter: Omit<Chapter, "id">) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 章节表单组件
 * 用于创建或编辑章节信息
 */
export default function ChapterForm({
	chapter,
	onSubmit,
	onCancel,
}: ChapterFormProps) {
	// 表单状态
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");

	// 加载现有章节数据
	useEffect(() => {
		if (chapter) {
			setTitle(chapter.title);
			setSummary(chapter.summary);
		}
	}, [chapter]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!title.trim()) return;

		// 提交数据
		onSubmit({
			title,
			summary,
		});

		// 清空表单
		setTitle("");
		setSummary("");
	};

	// 是否为编辑模式
	const isEditMode = !!chapter;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑章节" : "添加新章节"}</h4>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="chapter-title">章节标题</label>
				<input
					id="chapter-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					style={{ marginBottom: 8, width: "100%", boxSizing: "border-box" }}
					required
				/>
			</div>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="chapter-summary">章节概要</label>
				<textarea
					id="chapter-summary"
					rows={8}
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					style={{
						width: "100%",
						boxSizing: "border-box",
						resize: "vertical",
						minHeight: 80,
					}}
				/>
			</div>

			<div className="field-row" style={{ marginTop: 16 }}>
				<button type="submit" className="button">
					{isEditMode ? "保存" : "添加"}
				</button>

				{isEditMode && onCancel && (
					<button
						type="button"
						className="button"
						style={{ marginLeft: 8 }}
						onClick={onCancel}
					>
						取消
					</button>
				)}
			</div>
		</form>
	);
}
