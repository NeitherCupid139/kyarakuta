import React from "react";
import { Work } from "@/app/components/forms/WorkForm";

/**
 * 作品详情组件属性接口
 */
interface WorkDetailProps {
	work: Work;
	onEdit?: (id: number) => void;
	onBack?: () => void;
}

/**
 * 作品详情组件
 * 展示作品的完整信息
 */
export default function WorkDetail({ work, onEdit, onBack }: WorkDetailProps) {
	return (
		<div className="work-detail">
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
						<button className="button" onClick={() => onEdit(work.id)}>
							编辑作品
						</button>
					)}
				</div>
			</div>

			{/* 作品信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{work.title}</div>
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
								作品ID:
							</label>
							<span>{work.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								作品标题:
							</label>
							<span>{work.title}</span>
						</div>
					</div>

					{/* 详细介绍 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							作品描述
						</h3>
						<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
							{work.description || (
								<span className="text-gray-500">暂无描述信息</span>
							)}
						</div>
					</div>

					{/* 未来可扩展：关联章节 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							相关章节
						</h3>
						<div className="status-bar" style={{ padding: 8 }}>
							<span className="status-bar-field">
								暂无关联章节数据，将在后续集成展示
							</span>
						</div>
					</div>

					{/* 未来可扩展：关联角色 */}
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
								暂无关联角色数据，将在后续集成展示
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* 作品统计信息 - 未来可添加 */}
			<div className="window" style={{ width: "100%" }}>
				<div className="title-bar">
					<div className="title-bar-text">作品统计</div>
				</div>
				<div className="window-body" style={{ padding: 16 }}>
					<div className="status-bar">
						<span className="status-bar-field">章节数量: 0</span>
						<span className="status-bar-field">角色数量: 0</span>
						<span className="status-bar-field">事件数量: 0</span>
					</div>
				</div>
			</div>
		</div>
	);
}
