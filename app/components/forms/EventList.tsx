import React from "react";
import { Event } from "./EventForm";
import { Modal } from "@/app/components/windows/ModalWindows";

// 列表属性定义
interface EventListProps {
	events: Event[]; // 事件列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
}

/**
 * 事件列表组件
 * 展示事件列表并提供编辑和删除操作
 */
export default function EventList({
	events,
	onEdit,
	onDelete,
}: EventListProps) {
	// 列表为空时显示的内容
	if (events.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无事件，请添加新事件
			</div>
		);
	}

	// 处理事件删除
	const handleDeleteEvent = async (event: Event) => {
		// 二次确认删除
		const confirmed = await Modal.confirm(`确定要删除事件"${event.name}"吗？`, {
			title: "删除事件",
			icon: "/icons/delete.png",
		});

		if (confirmed) {
			onDelete(event.id);
		}
	};

	return (
		<div className="event-list">
			<h4>事件列表</h4>
			<div
				className="events-container"
				style={{ maxHeight: 400, overflowY: "auto" }}
			>
				<table className="table98" style={{ width: "100%" }}>
					<thead>
						<tr>
							<th style={{ width: "30%" }}>名称</th>
							<th style={{ width: "50%" }}>描述</th>
							<th style={{ width: "20%" }}>操作</th>
						</tr>
					</thead>
					<tbody>
						{events.map((event) => (
							<tr key={event.id}>
								<td style={{ fontWeight: "bold" }}>{event.name}</td>
								<td>{event.description || <em>无描述</em>}</td>
								<td>
									<button className="button" onClick={() => onEdit(event.id)}>
										编辑
									</button>
									<button
										className="button"
										style={{ marginLeft: 4 }}
										onClick={() => handleDeleteEvent(event)}
									>
										删除
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
