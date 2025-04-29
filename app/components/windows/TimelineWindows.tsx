import React, { useState, useEffect, useRef } from "react";
import { useTimeline } from "@/app/hooks/useTimeline";
import type { Work, Event as StoryEvent } from "@/app/db/schema";

/**
 * 时间线组件
 * 实现时间线的可视化展示和事件关联
 */
const TimelineWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取时间线相关操作
	const { events, loading, error, getSortedEvents } = useTimeline(
		work?.id || ""
	);

	// 状态管理
	const [zoomLevel, setZoomLevel] = useState(1);
	const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null);
	const [timelineView, setTimelineView] = useState<"linear" | "network">(
		"linear"
	);

	// DOM引用
	const timelineRef = useRef<HTMLDivElement>(null);

	// 处理缩放
	const handleZoomIn = () => {
		setZoomLevel((prev) => Math.min(prev + 0.2, 2));
	};

	const handleZoomOut = () => {
		setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
	};

	// 绘制时间线
	useEffect(() => {
		if (!timelineRef.current || loading) return;

		const sortedEvents = getSortedEvents();
		const container = timelineRef.current;

		// 清空容器
		container.innerHTML = "";

		if (timelineView === "linear") {
			// 线性时间轴视图
			const timeline = document.createElement("div");
			timeline.className = "relative my-8 mx-auto";
			timeline.style.width = "90%";
			timeline.style.transform = `scale(${zoomLevel})`;
			timeline.style.transformOrigin = "center top";

			// 创建中心线
			const centerLine = document.createElement("div");
			centerLine.className = "absolute left-1/2 w-1 bg-gray-300";
			centerLine.style.height = `${Math.max(sortedEvents.length * 100, 200)}px`;
			centerLine.style.transform = "translateX(-50%)";
			timeline.appendChild(centerLine);

			// 添加事件节点
			sortedEvents.forEach((event, index) => {
				const eventNode = document.createElement("div");
				eventNode.className =
					"flex items-center absolute w-full" +
					(event.id === selectedEvent?.id ? " font-bold" : "");
				eventNode.style.top = `${index * 100}px`;

				// 创建节点内容
				const dot = document.createElement("div");
				dot.className =
					"absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full cursor-pointer" +
					(event.id === selectedEvent?.id ? " bg-blue-600" : " bg-blue-400");
				dot.addEventListener("click", () => setSelectedEvent(event));

				const content = document.createElement("div");
				content.className =
					"absolute left-1/2 transform -translate-x-[calc(100%+20px)] w-[45%] p-2 bg-white border cursor-pointer";
				content.innerHTML = `
          <div class="font-semibold">${event.title}</div>
          <div class="text-sm text-gray-600">${
						event.timePoint || "无时间点"
					}</div>
          ${
						event.location
							? `<div class="text-sm">地点: ${event.location}</div>`
							: ""
					}
        `;
				content.addEventListener("click", () => setSelectedEvent(event));

				// 如果事件有关联的因事件，绘制连接线
				if (event.causeEventId) {
					const causeIndex = sortedEvents.findIndex(
						(e) => e.id === event.causeEventId
					);
					if (causeIndex !== -1) {
						const connectionLine = document.createElement("div");
						connectionLine.className = "absolute bg-red-300 w-1";
						connectionLine.style.left = "49%";
						connectionLine.style.height = `${(index - causeIndex) * 100}px`;
						connectionLine.style.top = `${causeIndex * 100 + 10}px`;
						timeline.appendChild(connectionLine);
					}
				}

				eventNode.appendChild(dot);
				eventNode.appendChild(content);
				timeline.appendChild(eventNode);
			});

			container.appendChild(timeline);
		} else {
			// 网络图视图（简化版）
			const networkContainer = document.createElement("div");
			networkContainer.className = "my-8 mx-auto p-4 border bg-gray-50";
			networkContainer.style.width = "90%";
			networkContainer.style.height = "500px";
			networkContainer.style.transform = `scale(${zoomLevel})`;
			networkContainer.style.transformOrigin = "center center";

			// 简单消息提示
			const message = document.createElement("div");
			message.className = "text-center p-8 text-gray-600";
			message.textContent = "事件关系网络图将在此显示";

			// 实际应用中可以使用专业的图形库如D3.js实现复杂网络图
			networkContainer.appendChild(message);
			container.appendChild(networkContainer);
		}
	}, [
		timelineView,
		events,
		loading,
		zoomLevel,
		selectedEvent,
		getSortedEvents,
	]);

	return (
		<div className="flex flex-col h-full">
			{loading ? (
				<p>加载中...</p>
			) : error ? (
				<p className="text-red-500">错误: {error.message}</p>
			) : (
				<div className="flex flex-col h-full">
					{/* 控制面板 */}
					<div className="flex justify-between items-center p-2 bg-gray-100 border-b">
						<div className="flex items-center space-x-2">
							<label>视图:</label>
							<select
								value={timelineView}
								onChange={(e) =>
									setTimelineView(e.target.value as "linear" | "network")
								}
								className="mr-4"
							>
								<option value="linear">线性时间轴</option>
								<option value="network">事件关系网络</option>
							</select>
						</div>

						<div className="flex items-center space-x-2">
							<button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
								缩小
							</button>
							<span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
							<button onClick={handleZoomIn} disabled={zoomLevel >= 2}>
								放大
							</button>
						</div>
					</div>

					{/* 时间线容器 */}
					<div className="flex-grow overflow-auto" style={{ height: "500px" }}>
						<div ref={timelineRef} className="min-h-full"></div>
					</div>

					{/* 事件详情面板 */}
					{selectedEvent && (
						<div className="mt-4 p-4 border-t">
							<h3 className="font-bold">{selectedEvent.title}</h3>
							<div className="grid grid-cols-2 gap-4 mt-2">
								<div>
									<p className="text-sm text-gray-600">
										时间点: {selectedEvent.timePoint || "未指定"}
									</p>
									<p className="text-sm text-gray-600">
										地点: {selectedEvent.location || "未指定"}
									</p>
								</div>
								<div>
									<p className="text-sm">
										{selectedEvent.description || "无描述"}
									</p>
								</div>
							</div>
							<div className="mt-4">
								<button onClick={() => setSelectedEvent(null)}>关闭详情</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default TimelineWindows;
