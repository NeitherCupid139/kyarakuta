import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import EventForm, { Event } from "@/app/components/forms/EventForm";
import EventList from "@/app/components/forms/EventList";

// 初始事件数据
const initialEvents: Event[] = [];

/**
 * 事件窗口组件
 * 管理事件的 CRUD 操作
 */
export default function EventWindows() {
	// 状态管理
	const [events, setEvents] = useState<Event[]>(initialEvents);
	const [editingEvent, setEditingEvent] = useState<Event | undefined>(
		undefined
	);

	// 处理添加事件
	const handleAddEvent = (eventData: Omit<Event, "id">) => {
		const newEvent = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...eventData,
		};

		// 添加到列表末尾
		setEvents([...events, newEvent]);
	};

	// 处理编辑事件
	const handleEdit = (id: number) => {
		const event = events.find((e) => e.id === id);
		if (event) {
			setEditingEvent(event);
		}
	};

	// 处理保存编辑
	const handleUpdateEvent = (eventData: Omit<Event, "id">) => {
		if (!editingEvent) return;

		setEvents(
			events.map((e) => (e.id === editingEvent.id ? { ...e, ...eventData } : e))
		);
		setEditingEvent(undefined);
	};

	// 处理删除事件
	const handleDelete = (id: number) => {
		setEvents(events.filter((e) => e.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingEvent(undefined);
	};

	return (
		<div className="window-content">
			<h3>事件管理</h3>

			<div className="window-content-row">
				{/* 左侧：事件表单 */}
				<div className="window-content-col window-content-left">
					{editingEvent ? (
						<EventForm
							event={editingEvent}
							onSubmit={handleUpdateEvent}
							onCancel={handleCancelEdit}
						/>
					) : (
						<EventForm onSubmit={handleAddEvent} />
					)}
				</div>

				{/* 右侧：事件列表 */}
				<div className="window-content-col window-content-right">
					<EventList
						events={events}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</div>
			</div>
		</div>
	);
}
