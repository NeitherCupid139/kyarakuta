import React from "react";

/**
 * 事件详情类型定义
 */
type EventDetailProps = {
	event: {
		id: number;
		title: string;
		description: string;
		date?: string;
		workId: number;
		workTitle?: string;
		chapterId?: number;
		chapterTitle?: string;
		characterIds?: number[];
		characters?: string[];
		createdAt: string;
		updatedAt: string;
	};
	onEdit?: (id: number) => void;
	onBack?: () => void;
};

/**
 * 事件详情组件
 * 展示事件的详细信息
 */
export default function EventDetail({
	event,
	onEdit,
	onBack,
}: EventDetailProps) {
	return (
		<div className="event-detail">
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
						<button className="button" onClick={() => onEdit(event.id)}>
							编辑事件
						</button>
					)}
				</div>
			</div>

			{/* 事件信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{event.title}</div>
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
								事件ID:
							</label>
							<span>{event.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								事件标题:
							</label>
							<span>{event.title}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								所属作品:
							</label>
							<span>{event.workTitle || `作品ID: ${event.workId}`}</span>
						</div>
						{event.chapterId && (
							<div className="field-row" style={{ marginBottom: 8 }}>
								<label style={{ minWidth: 80, display: "inline-block" }}>
									所属章节:
								</label>
								<span>
									{event.chapterTitle || `章节ID: ${event.chapterId}`}
								</span>
							</div>
						)}
						{event.date && (
							<div className="field-row" style={{ marginBottom: 8 }}>
								<label style={{ minWidth: 80, display: "inline-block" }}>
									事件日期:
								</label>
								<span>{event.date}</span>
							</div>
						)}
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								创建时间:
							</label>
							<span>{new Date(event.createdAt).toLocaleString("zh-CN")}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								更新时间:
							</label>
							<span>{new Date(event.updatedAt).toLocaleString("zh-CN")}</span>
						</div>
					</div>

					{/* 事件描述 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							事件描述
						</h3>
						<div
							style={{
								whiteSpace: "pre-wrap",
								lineHeight: 1.5,
								maxHeight: "200px",
								overflow: "auto",
								border: "1px solid #c0c0c0",
								padding: "8px",
							}}
						>
							{event.description || (
								<span className="text-gray-500">暂无描述</span>
							)}
						</div>
					</div>

					{/* 相关角色 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							相关角色
						</h3>
						{event.characters && event.characters.length > 0 ? (
							<div className="field-row-stacked">
								<ul className="tree-view" style={{ width: "100%" }}>
									{event.characters.map((character, index) => (
										<li key={index}>{character}</li>
									))}
								</ul>
							</div>
						) : (
							<div className="status-bar" style={{ padding: 8 }}>
								<span className="status-bar-field">暂无关联角色数据</span>
							</div>
						)}
					</div>

					{/* 时间线位置 - 未来扩展 */}
					<div>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							时间线位置
						</h3>
						<div className="status-bar" style={{ padding: 8 }}>
							<span className="status-bar-field">
								暂无时间线数据，将在后续集成展示
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
