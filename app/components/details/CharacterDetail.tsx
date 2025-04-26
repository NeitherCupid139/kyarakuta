import React from "react";
import { Character } from "@/app/components/forms/CharacterForm";

/**
 * 角色详情组件属性接口
 */
interface CharacterDetailProps {
	character: Character;
	onEdit?: (id: number) => void;
	onBack?: () => void;
}

/**
 * 角色详情组件
 * 展示角色的完整信息
 */
export default function CharacterDetail({
	character,
	onEdit,
	onBack,
}: CharacterDetailProps) {
	return (
		<div className="character-detail">
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
						<button className="button" onClick={() => onEdit(character.id)}>
							编辑角色
						</button>
					)}
				</div>
			</div>

			{/* 角色信息卡片 */}
			<div className="window" style={{ width: "100%", marginBottom: 16 }}>
				<div className="title-bar">
					<div className="title-bar-text">{character.name}</div>
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
								角色ID:
							</label>
							<span>{character.id}</span>
						</div>
						<div className="field-row" style={{ marginBottom: 8 }}>
							<label style={{ minWidth: 80, display: "inline-block" }}>
								角色名称:
							</label>
							<span>{character.name}</span>
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
							角色描述
						</h3>
						<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
							{character.description || (
								<span className="text-gray-500">暂无描述信息</span>
							)}
						</div>
					</div>

					{/* 未来可扩展：角色关系展示 */}
					<div style={{ marginBottom: 16 }}>
						<h3
							style={{
								borderBottom: "1px solid #c0c0c0",
								paddingBottom: 8,
								marginBottom: 16,
							}}
						>
							角色关系
						</h3>
						<div className="status-bar" style={{ padding: 8 }}>
							<span className="status-bar-field">
								暂无关联关系数据，将在后续集成展示
							</span>
						</div>
					</div>

					{/* 未来可扩展：相关事件 */}
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
