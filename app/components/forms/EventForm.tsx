import React, { useState, useEffect } from "react";

// 事件接口定义
export interface Event {
	id: number;
	name: string;
	description: string;
}

// 表单属性定义
interface EventFormProps {
	event?: Event; // 可选，编辑时传入
	onSubmit: (event: Omit<Event, "id">) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 事件表单组件
 * 用于创建或编辑事件信息
 */
export default function EventForm({
	event,
	onSubmit,
	onCancel,
}: EventFormProps) {
	// 表单状态
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	// 加载现有事件数据
	useEffect(() => {
		if (event) {
			setName(event.name);
			setDescription(event.description);
		}
	}, [event]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!name.trim()) return;

		// 提交数据
		onSubmit({
			name,
			description,
		});

		// 清空表单
		setName("");
		setDescription("");
	};

	// 是否为编辑模式
	const isEditMode = !!event;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑事件" : "添加新事件"}</h4>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="event-name">事件名称</label>
				<input
					id="event-name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: 8, width: "100%", boxSizing: "border-box" }}
					required
				/>
			</div>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="event-description">事件描述</label>
				<textarea
					id="event-description"
					rows={5}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
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
