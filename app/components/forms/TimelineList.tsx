import React from "react";
import { TimelineItem } from "./TimelineForm";
import { Modal } from "@/app/components/windows/ModalWindows";

// 列表属性定义
interface TimelineListProps {
	timelineItems: TimelineItem[]; // 时间线列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
}

/**
 * 时间线列表组件
 * 展示时间线事件列表并提供编辑和删除操作
 */
export default function TimelineList({
	timelineItems,
	onEdit,
	onDelete,
}: TimelineListProps) {
	// 列表为空时显示的内容
	if (timelineItems.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无时间线事件，请添加新事件
			</div>
		);
	}

	// 对时间线项目进行排序
	const sortedItems = [...timelineItems].sort((a, b) => {
		// 优先按 order 排序（如果有的话）
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}

		// 如果只有一项有 order，有 order 的排在前面
		if (a.order !== undefined) return -1;
		if (b.order !== undefined) return 1;

		// 如果都没有 order，按 id（添加顺序）排序
		return a.id - b.id;
	});

	// 处理事件删除
	const handleDeleteTimelineItem = async (item: TimelineItem) => {
		// 二次确认删除
		const confirmed = await Modal.confirm(
			`确定要删除时间线事件"${item.event}"吗？`,
			{
				title: "删除时间线事件",
				icon: "/icons/delete.png",
			}
		);

		if (confirmed) {
			onDelete(item.id);
		}
	};

	return (
		<div className="timeline-list">
			<h4>时间线列表</h4>
			<div
				className="timeline-container"
				style={{
					maxHeight: 400,
					overflowY: "auto",
					border: "1px solid #c0c0c0",
					borderRadius: 4,
					padding: "0 12px",
				}}
			>
				<div className="timeline">
					{sortedItems.map((item) => (
						<div
							key={item.id}
							className="timeline-item"
							style={{
								position: "relative",
								paddingLeft: 24,
								paddingBottom: 16,
								borderLeft: "2px solid #c0c0c0",
								marginLeft: 8,
							}}
						>
							{/* 时间点标记 */}
							<div
								className="timeline-marker"
								style={{
									position: "absolute",
									left: -6,
									top: 0,
									width: 10,
									height: 10,
									borderRadius: "50%",
									backgroundColor: "#000",
									border: "2px solid #fff",
								}}
							/>

							<div
								className="timeline-content"
								style={{
									backgroundColor: "#f8f8f8",
									borderRadius: 4,
									padding: 12,
									marginBottom: 8,
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: 8,
									}}
								>
									<div>
										<strong style={{ fontSize: 16 }}>{item.time}</strong>
										{item.order !== undefined && (
											<span
												style={{ marginLeft: 8, fontSize: 12, color: "#888" }}
											>
												(排序: {item.order})
											</span>
										)}
									</div>
									<div>
										<button className="button" onClick={() => onEdit(item.id)}>
											编辑
										</button>
										<button
											className="button"
											style={{ marginLeft: 4 }}
											onClick={() => handleDeleteTimelineItem(item)}
										>
											删除
										</button>
									</div>
								</div>

								<h5 style={{ margin: "0 0 8px" }}>{item.event}</h5>

								{item.description && (
									<div style={{ fontSize: 14, lineHeight: 1.5 }}>
										{item.description}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
