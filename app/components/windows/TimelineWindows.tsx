import React, { useState } from "react";
import TimelineForm, {
	TimelineItem,
} from "@/app/components/forms/TimelineForm";
import TimelineList from "@/app/components/lists/TimelineList";

import "98.css";

// 初始化空时间线
const initialTimeline: TimelineItem[] = [];

/**
 * 时间线窗口组件
 * 整合时间线表单和列表，提供完整的时间线管理功能
 */
export default function TimelineWindows() {
	// 状态管理
	const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
	const [editingItem, setEditingItem] = useState<TimelineItem | undefined>(
		undefined
	);

	// 处理添加新时间线事件
	const handleAdd = (itemData: Omit<TimelineItem, "id">) => {
		// 创建新时间线项
		const newItem: TimelineItem = {
			...itemData,
			id: Date.now(),
		};

		// 更新时间线列表
		setTimeline([...timeline, newItem]);
	};

	// 处理编辑时间线事件
	const handleEdit = (id: number) => {
		// 查找要编辑的项目
		const item = timeline.find((t) => t.id === id);
		if (item) {
			setEditingItem(item);
		}
	};

	// 处理保存编辑
	const handleSave = (itemData: Omit<TimelineItem, "id">) => {
		if (!editingItem) return;

		// 更新时间线列表
		setTimeline(
			timeline.map((t) =>
				t.id === editingItem.id ? { ...itemData, id: editingItem.id } : t
			)
		);

		// 清除编辑状态
		setEditingItem(undefined);
	};

	// 处理删除时间线事件
	const handleDelete = (id: number) => {
		setTimeline(timeline.filter((t) => t.id !== id));
	};

	// 取消编辑
	const handleCancel = () => {
		setEditingItem(undefined);
	};

	return (
		<div className="window-body" style={{ padding: 16, overflow: "auto" }}>
			{/* 分隔窗口为表单和列表两部分 */}
			<div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
				{/* 表单区域 */}
				<div className="window" style={{ width: "100%" }}>
					<div className="title-bar">
						<div className="title-bar-text">
							{editingItem ? "编辑时间线事件" : "添加时间线事件"}
						</div>
					</div>
					<div className="window-body" style={{ padding: 16 }}>
						<TimelineForm
							timelineItem={editingItem}
							onSubmit={editingItem ? handleSave : handleAdd}
							onCancel={handleCancel}
						/>
					</div>
				</div>

				{/* 列表区域 */}
				<div className="window" style={{ width: "100%" }}>
					<div className="title-bar">
						<div className="title-bar-text">时间线列表</div>
					</div>
					<div className="window-body" style={{ padding: 16 }}>
						<TimelineList
							items={timeline}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
