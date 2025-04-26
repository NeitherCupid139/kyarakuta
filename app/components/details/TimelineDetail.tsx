import React from "react";

/**
 * 时间线详情类型定义
 */
type TimelineDetailProps = {
	timeline: {
		id: number;
		title: string;
		description: string;
		workId: number;
		workTitle?: string;
		events?: Array<{
			id: number;
			title: string;
			date?: string;
		}>;
		createdAt: string;
		updatedAt: string;
	};
	onEdit?: (id: number) => void;
	onBack?: () => void;
};

/**
 * 时间线详情组件
 * 展示时间线的详细信息和包含的事件
 */
export default function TimelineDetail({
	timeline,
	onEdit,
	onBack,
}: TimelineDetailProps) {
	return (
		<div className="timeline-detail">
			{/* 操作栏 */}
			<div
				className="field-row"
				style={{ justifyContent: "space-between", marginBottom: 16 }}
			>
				<div>
					{onBack && (
						<button className="button" onClick={onBack}>
							返回列表
						</button>
					)}
				</div>
				<div>
					{onEdit && (
						<button className="button" onClick={() => onEdit(timeline.id)}>
							编辑时间线
						</button>
					)}
				</div>
			</div>

			{/* 时间线信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{timeline.title}</div>
				</div>
				<div className="window-body" style={{ padding: 16 }}>
					{/* 基本信息区 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							基本信息
						</h3>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								时间线ID:
							</label>
							<span>{timeline.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								时间线标题:
							</label>
							<span>{timeline.title}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								所属作品:
							</label>
							<span>{timeline.workTitle || `作品ID: ${timeline.workId}`}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								创建时间:
							</label>
							<span>
								{new Date(timeline.createdAt).toLocaleString("zh-CN")}
							</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								更新时间:
							</label>
							<span>
								{new Date(timeline.updatedAt).toLocaleString("zh-CN")}
							</span>
						</div>
					</div>

					{/* 时间线描述 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							时间线描述
						</h3>
						<div
							style={{
								whiteSpace: "pre-wrap",
								lineHeight: 1.5,
								maxHeight: "150px",
								overflow: "auto",
								border: "1px solid #c0c0c0",
								padding: "8px",
							}}
						>
							{timeline.description || (
								<span className="text-gray-500">暂无描述</span>
							)}
						</div>
					</div>

					{/* 包含事件 */}
					<div>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							时间线事件
						</h3>
						{timeline.events && timeline.events.length > 0 ? (
							<div className="field-row-stacked">
								<div
									style={{
										height: "200px",
										overflow: "auto",
										border: "1px solid #c0c0c0",
									}}
								>
									<table className="w-100" style={{ width: "100%" }}>
										<thead>
											<tr>
												<th>事件ID</th>
												<th>事件名称</th>
												<th>事件日期</th>
											</tr>
										</thead>
										<tbody>
											{timeline.events.map((event) => (
												<tr key={event.id}>
													<td>{event.id}</td>
													<td>{event.title}</td>
													<td>{event.date || "无日期"}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						) : (
							<div className="status-bar" style={{ padding: 8 }}>
								<span className="status-bar-field">暂无关联事件数据</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
