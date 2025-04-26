import React from "react";

/**
 * 章节详情类型定义
 */
type ChapterDetailProps = {
	chapter: {
		id: number;
		title: string;
		content: string;
		order: number;
		workId: number;
		workTitle?: string;
		createdAt: string;
		updatedAt: string;
	};
	onEdit?: (id: number) => void;
	onBack?: () => void;
};

/**
 * 章节详情组件
 * 展示章节的详细信息
 */
export default function ChapterDetail({
	chapter,
	onEdit,
	onBack,
}: ChapterDetailProps) {
	return (
		<div className="chapter-detail">
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
						<button className="button" onClick={() => onEdit(chapter.id)}>
							编辑章节
						</button>
					)}
				</div>
			</div>

			{/* 章节信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{chapter.title}</div>
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
								章节ID:
							</label>
							<span>{chapter.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								章节标题:
							</label>
							<span>{chapter.title}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								所属作品:
							</label>
							<span>{chapter.workTitle || `作品ID: ${chapter.workId}`}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								章节顺序:
							</label>
							<span>{chapter.order}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								创建时间:
							</label>
							<span>{new Date(chapter.createdAt).toLocaleString("zh-CN")}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								更新时间:
							</label>
							<span>{new Date(chapter.updatedAt).toLocaleString("zh-CN")}</span>
						</div>
					</div>

					{/* 章节内容 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							章节内容
						</h3>
						<div
							style={{
								whiteSpace: "pre-wrap",
								lineHeight: 1.5,
								maxHeight: "300px",
								overflow: "auto",
								border: "1px solid #c0c0c0",
								padding: "8px",
							}}
						>
							{chapter.content || (
								<span className="text-gray-500">暂无内容</span>
							)}
						</div>
					</div>

					{/* 相关事件 - 未来扩展 */}
					<div>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							相关事件
						</h3>
						<div className="status-bar" style={{ padding: 8 }}>
							<span className="status-bar-field">
								暂无关联事件数据，将在后续集成展示
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
