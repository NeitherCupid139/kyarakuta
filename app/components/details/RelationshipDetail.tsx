import React from "react";

/**
 * 角色关系详情类型定义
 */
type RelationshipDetailProps = {
	relationship: {
		id: number;
		name: string;
		description: string;
		type: string;
		sourceCharacterId: number;
		sourceCharacterName?: string;
		targetCharacterId: number;
		targetCharacterName?: string;
		workId: number;
		workTitle?: string;
		createdAt: string;
		updatedAt: string;
	};
	onEdit?: (id: number) => void;
	onBack?: () => void;
};

/**
 * 角色关系详情组件
 * 展示角色间关系的详细信息
 */
export default function RelationshipDetail({
	relationship,
	onEdit,
	onBack,
}: RelationshipDetailProps) {
	return (
		<div className="relationship-detail">
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
						<button className="button" onClick={() => onEdit(relationship.id)}>
							编辑关系
						</button>
					)}
				</div>
			</div>

			{/* 关系信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{relationship.name}</div>
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
								关系ID:
							</label>
							<span>{relationship.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								关系名称:
							</label>
							<span>{relationship.name}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								关系类型:
							</label>
							<span>{relationship.type}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								所属作品:
							</label>
							<span>
								{relationship.workTitle || `作品ID: ${relationship.workId}`}
							</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								创建时间:
							</label>
							<span>
								{new Date(relationship.createdAt).toLocaleString("zh-CN")}
							</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								更新时间:
							</label>
							<span>
								{new Date(relationship.updatedAt).toLocaleString("zh-CN")}
							</span>
						</div>
					</div>

					{/* 关系描述 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							关系描述
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
							{relationship.description || (
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
							关系角色
						</h3>
						<div className="field-row-stacked" style={{ marginBottom: 8 }}>
							<label>来源角色:</label>
							<div
								className="status-bar"
								style={{ padding: 8, margin: "4px 0" }}
							>
								<span className="status-bar-field">
									{relationship.sourceCharacterName ||
										`角色ID: ${relationship.sourceCharacterId}`}
								</span>
							</div>
						</div>
						<div className="field-row-stacked">
							<label>目标角色:</label>
							<div
								className="status-bar"
								style={{ padding: 8, margin: "4px 0" }}
							>
								<span className="status-bar-field">
									{relationship.targetCharacterName ||
										`角色ID: ${relationship.targetCharacterId}`}
								</span>
							</div>
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
