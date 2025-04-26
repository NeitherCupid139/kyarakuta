import React, { useState, useEffect } from "react";

// 作品接口定义
export interface Work {
	id: number;
	title: string;
	description: string;
}

// 表单属性定义
interface WorkFormProps {
	work?: Work; // 可选，编辑时传入
	onSubmit: (work: Omit<Work, "id">) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 作品表单组件
 * 用于创建或编辑作品信息
 */
export default function WorkForm({ work, onSubmit, onCancel }: WorkFormProps) {
	// 表单状态
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	// 加载现有作品数据
	useEffect(() => {
		if (work) {
			setTitle(work.title);
			setDescription(work.description);
		}
	}, [work]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!title.trim()) return;

		// 提交数据
		onSubmit({
			title,
			description,
		});

		// 清空表单
		setTitle("");
		setDescription("");
	};

	// 是否为编辑模式
	const isEditMode = !!work;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑作品" : "添加新作品"}</h4>

			<div className="field-row" style={{ marginBottom: 8 }}>
				<label htmlFor="work-title" style={{ minWidth: 60 }}>
					标题
				</label>
				<input
					id="work-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					style={{ marginRight: 8, flex: 1 }}
					required
				/>
			</div>

			<div className="field-row" style={{ marginBottom: 16 }}>
				<label htmlFor="work-desc" style={{ minWidth: 60 }}>
					描述
				</label>
				<input
					id="work-desc"
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					style={{ marginRight: 8, flex: 2 }}
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
