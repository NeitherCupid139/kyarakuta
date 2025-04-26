import React, { useState, useEffect } from "react";

// 世界观接口定义
export interface Worldview {
	id: number;
	title: string;
	content: string;
}

// 表单属性定义
interface WorldviewFormProps {
	worldview?: Worldview; // 可选，编辑时传入
	onSubmit: (worldview: Omit<Worldview, "id">) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 世界观表单组件
 * 用于创建或编辑世界观信息
 */
export default function WorldviewForm({
	worldview,
	onSubmit,
	onCancel,
}: WorldviewFormProps) {
	// 表单状态
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	// 加载现有世界观数据
	useEffect(() => {
		if (worldview) {
			setTitle(worldview.title);
			setContent(worldview.content);
		}
	}, [worldview]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!title.trim()) return;

		// 提交数据
		onSubmit({
			title,
			content,
		});

		// 清空表单
		if (!worldview) {
			setTitle("");
			setContent("");
		}
	};

	// 是否为编辑模式
	const isEditMode = !!worldview;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑世界观" : "添加新世界观"}</h4>

			<div className="field-row-stacked" style={{ marginBottom: 12 }}>
				<label htmlFor="worldview-title">标题</label>
				<input
					id="worldview-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					style={{ width: "100%", boxSizing: "border-box" }}
					required
					placeholder="例如：魔法体系、历史背景、地理环境等"
				/>
			</div>

			<div className="field-row-stacked" style={{ marginBottom: 16 }}>
				<label htmlFor="worldview-content">内容</label>
				<textarea
					id="worldview-content"
					rows={8}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					style={{
						width: "100%",
						boxSizing: "border-box",
						resize: "vertical",
						minHeight: 150,
					}}
					placeholder="描述世界观的详细信息..."
				/>
			</div>

			<div className="field-row">
				<div style={{ marginLeft: "auto" }}>
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
			</div>
		</form>
	);
}
