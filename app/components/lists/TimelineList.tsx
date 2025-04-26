import React from "react";
import { TimelineItem } from "../forms/TimelineForm";

/**
 * 时间线列表属性接口
 */
interface TimelineListProps {
	items: TimelineItem[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

/**
 * 时间线列表组件
 * 用于展示时间线事件列表
 */
export default function TimelineList({
	items,
	onEdit,
	onDelete,
}: TimelineListProps) {
	// 处理没有数据的情况
	if (items.length === 0) {
		return (
			<div className="p-4 text-center text-gray-500">
				暂无时间线事件，请添加新的事件
			</div>
		);
	}

	return (
		<div className="timeline-list">
			{/* 时间线列表 */}
			{items.map((item) => (
				<div
					key={item.id}
					className="timeline-item mb-4 p-3 border border-gray-200 rounded"
				>
					{/* 时间点和事件标题 */}
					<div className="flex justify-between items-center mb-2">
						<div className="font-bold">{item.time}</div>
						<div className="flex space-x-2">
							<button
								className="px-2 py-1 text-xs button"
								onClick={() => onEdit(item.id)}
							>
								编辑
							</button>
							<button
								className="px-2 py-1 text-xs button"
								onClick={() => onDelete(item.id)}
							>
								删除
							</button>
						</div>
					</div>

					{/* 事件名称 */}
					<div className="text-lg mb-1">{item.event}</div>

					{/* 事件描述 */}
					{item.description && (
						<div className="text-sm text-gray-700">{item.description}</div>
					)}
				</div>
			))}
		</div>
	);
}
