import React from "react";

/**
 * 世界观详情类型定义
 */
type WorldbuildingDetailProps = {
	worldbuilding: {
		id: number;
		title: string;
		content: string;
		category: string;
		workId: number;
		workTitle?: string;
		createdAt: string;
		updatedAt: string;
	};
	onEdit?: (id: number) => void;
	onBack?: () => void;
};

/**
 * 世界观详情组件
 * 展示世界观设定的详细信息
 */
export default function WorldbuildingDetail({
	worldbuilding,
	onEdit,
	onBack,
}: WorldbuildingDetailProps) {
	return (
		<div className="worldbuilding-detail">
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
						<button className="button" onClick={() => onEdit(worldbuilding.id)}>
							编辑世界观
						</button>
					)}
				</div>
			</div>

			{/* 世界观信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{worldbuilding.title}</div>
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
								设定ID:
							</label>
							<span>{worldbuilding.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								设定标题:
							</label>
							<span>{worldbuilding.title}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								设定分类:
							</label>
							<span>{worldbuilding.category}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								所属作品:
							</label>
							<span>
								{worldbuilding.workTitle || `作品ID: ${worldbuilding.workId}`}
							</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								创建时间:
							</label>
							<span>
								{new Date(worldbuilding.createdAt).toLocaleString("zh-CN")}
							</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								更新时间:
							</label>
							<span>
								{new Date(worldbuilding.updatedAt).toLocaleString("zh-CN")}
							</span>
						</div>
					</div>

					{/* 世界观内容 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							设定内容
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
							{worldbuilding.content || (
								<span className="text-gray-500">暂无内容</span>
							)}
						</div>
					</div>

					{/* 相关角色 - 未来扩展 */}
					<div>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							相关角色
						</h3>
						<div className="status-bar" style={{ padding: 8 }}>
							<span className="status-bar-field">
								暂无相关角色数据，将在后续集成展示
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
