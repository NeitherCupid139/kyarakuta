import React, { useState } from "react";
import { useEvents } from "@/app/hooks/useEvents";
import type { Event, Work } from "@/app/db/schema";

/**
 * 事件管理窗口组件
 * 实现事件的增删改查和排序功能
 */
const EventsWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取事件相关操作
	const { events, loading, error, createEvent, updateEvent, deleteEvent } =
		useEvents(work?.id || "");

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		timePoint: "",
		location: "",
	});

	// 处理拖拽排序相关
	const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 选择编辑事件
	const handleSelectEvent = (event: Event) => {
		setSelectedEvent(event);
		setFormData({
			title: event.title,
			description: event.description || "",
			timePoint: event.timePoint || "",
			location: event.location || "",
		});
		setEditMode("edit");
	};

	// 准备创建新事件
	const handleCreateNew = () => {
		setSelectedEvent(null);
		setFormData({
			title: "",
			description: "",
			timePoint: "",
			location: "",
		});
		setEditMode("create");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedEvent(null);
	};

	// 保存事件
	const handleSave = async () => {
		try {
			if (editMode === "create") {
				// 创建新事件
				await createEvent({
					title: formData.title,
					description: formData.description || null,
					timePoint: formData.timePoint || null,
					location: formData.location || null,
				});
			} else if (editMode === "edit" && selectedEvent) {
				// 更新现有事件
				await updateEvent(selectedEvent.id, {
					title: formData.title,
					description: formData.description || null,
					timePoint: formData.timePoint || null,
					location: formData.location || null,
				});
			}
			setEditMode(null);
			setSelectedEvent(null);
		} catch (err) {
			console.error("保存事件失败:", err);
		}
	};

	// 删除事件
	const handleDelete = async (event: Event) => {
		if (window.confirm(`确定要删除事件"${event.title}"吗？`)) {
			try {
				await deleteEvent(event.id);
			} catch (err) {
				console.error("删除事件失败:", err);
			}
		}
	};

	// 开始拖拽
	const handleDragStart = (event: Event) => {
		setDraggedEvent(event);
	};

	// 拖拽结束
	const handleDragEnd = () => {
		setDraggedEvent(null);
	};

	// 拖拽进入目标区域
	const handleDragOver = (e: React.DragEvent, targetEvent: Event) => {
		e.preventDefault();
		if (!draggedEvent || draggedEvent.id === targetEvent.id) return;
	};

	// 放置拖拽项
	const handleDrop = (e: React.DragEvent, targetEvent: Event) => {
		e.preventDefault();
		if (!draggedEvent || draggedEvent.id === targetEvent.id) return;

		// 重新排序事件
		const reordered = [...events];
		const draggedIndex = reordered.findIndex((e) => e.id === draggedEvent.id);
		const targetIndex = reordered.findIndex((e) => e.id === targetEvent.id);

		reordered.splice(draggedIndex, 1);
		reordered.splice(targetIndex, 0, draggedEvent);

		// 更新事件顺序
		Promise.all(
			reordered.map((event) =>
				updateEvent(event.id, {
					title: event.title,
					description: event.description,
					timePoint: event.timePoint,
					location: event.location,
				})
			)
		).catch((err) => {
			console.error("更新事件顺序失败:", err);
		});
	};

	return (
		<div className="flex flex-col h-full">
			{loading ? (
				<p>加载中...</p>
			) : error ? (
				<p className="text-red-500">错误: {error.message}</p>
			) : (
				<div className="flex flex-col h-full">
					{editMode ? (
						// 编辑/创建表单
						<div className="p-4">
							<h2 className="mb-4">
								{editMode === "create" ? "创建新事件" : "编辑事件"}
							</h2>
							<div className="field-row-stacked mb-4">
								<label htmlFor="title">事件标题</label>
								<input
									id="title"
									name="title"
									type="text"
									value={formData.title}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="description">事件描述</label>
								<textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={5}
									className="w-full"
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="timePoint">时间点</label>
								<input
									id="timePoint"
									name="timePoint"
									type="text"
									value={formData.timePoint}
									onChange={handleInputChange}
									placeholder="例如：第一章开始"
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="location">地点</label>
								<input
									id="location"
									name="location"
									type="text"
									value={formData.location}
									onChange={handleInputChange}
									placeholder="例如：王宫大殿"
								/>
							</div>

							<div className="field-row mt-4">
								<button onClick={handleCancel}>取消</button>
								<button onClick={handleSave} disabled={!formData.title}>
									保存
								</button>
							</div>
						</div>
					) : (
						// 事件列表
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg">事件列表</h2>
								<button onClick={handleCreateNew}>添加新事件</button>
							</div>

							{events.length === 0 ? (
								<p>暂无事件，点击&quot;添加新事件&quot;按钮开始创建。</p>
							) : (
								<div className="border border-gray-300">
									{events.map((event, index) => (
										<div
											key={event.id}
											className="p-3 border-b border-gray-300 flex justify-between items-center hover:bg-gray-100 cursor-move"
											draggable
											onDragStart={() => handleDragStart(event)}
											onDragEnd={handleDragEnd}
											onDragOver={(e) => handleDragOver(e, event)}
											onDrop={(e) => handleDrop(e, event)}
											style={{
												background:
													draggedEvent?.id === event.id ? "#e6f7ff" : "inherit",
											}}
										>
											<div className="flex items-center">
												<span className="mr-2">{index + 1}.</span>
												<span>{event.title}</span>
												{event.timePoint && (
													<span className="ml-2 text-sm text-gray-500">
														({event.timePoint}
														{event.location && ` - ${event.location}`})
													</span>
												)}
											</div>
											<div className="flex gap-2">
												<button onClick={() => handleSelectEvent(event)}>
													编辑
												</button>
												<button onClick={() => handleDelete(event)}>
													删除
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default EventsWindows;
