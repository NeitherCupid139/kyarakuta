import React, { useState, useEffect } from "react";

/**
 * 时间线项目接口定义
 */
export interface TimelineItem {
	id: number;
	time: string;
	event: string;
	description: string;
	order?: number;
}

/**
 * 时间线表单属性接口
 */
interface TimelineFormProps {
	timelineItem?: TimelineItem;
	onSubmit: (item: Omit<TimelineItem, "id">) => void;
	onCancel: () => void;
}

/**
 * 时间线表单组件
 * 用于创建或编辑时间线事件
 */
export default function TimelineForm({
	timelineItem,
	onSubmit,
	onCancel,
}: TimelineFormProps) {
	// 表单状态管理
	const [time, setTime] = useState("");
	const [event, setEvent] = useState("");
	const [description, setDescription] = useState("");

	// 当编辑项变化时更新表单
	useEffect(() => {
		if (timelineItem) {
			setTime(timelineItem.time);
			setEvent(timelineItem.event);
			setDescription(timelineItem.description);
		} else {
			// 清空表单（添加新项模式）
			setTime("");
			setEvent("");
			setDescription("");
		}
	}, [timelineItem]);

	// 提交表单
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 表单验证
		if (!time.trim() || !event.trim()) {
			return;
		}

		// 提交数据
		onSubmit({
			time,
			event,
			description,
		});

		// 清空表单
		if (!timelineItem) {
			setTime("");
			setEvent("");
			setDescription("");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{/* 时间输入 */}
			<div className="field-row-stacked mb-4">
				<label htmlFor="timeline-time">时间点</label>
				<input
					id="timeline-time"
					type="text"
					value={time}
					onChange={(e) => setTime(e.target.value)}
					className="w-full"
					placeholder="例如: 2023年1月1日"
					required
				/>
			</div>

			{/* 事件输入 */}
			<div className="field-row-stacked mb-4">
				<label htmlFor="timeline-event">事件</label>
				<input
					id="timeline-event"
					type="text"
					value={event}
					onChange={(e) => setEvent(e.target.value)}
					className="w-full"
					placeholder="事件名称"
					required
				/>
			</div>

			{/* 描述输入 */}
			<div className="field-row-stacked mb-4">
				<label htmlFor="timeline-desc">描述</label>
				<textarea
					id="timeline-desc"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full"
					rows={3}
					placeholder="事件详细描述"
				/>
			</div>

			{/* 操作按钮 */}
			<div className="field-row">
				<button type="submit" className="button">
					{timelineItem ? "保存修改" : "添加事件"}
				</button>
				<button type="button" className="button ml-2" onClick={onCancel}>
					取消
				</button>
			</div>
		</form>
	);
}
