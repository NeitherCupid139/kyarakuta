import React from "react";
import { Character } from "./CharacterForm";

// 列表属性定义
interface CharacterListProps {
	characters: Character[]; // 角色列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
	onChat?: (character: Character) => void; // 可选，对话回调
	onViewDetail?: (id: number) => void; // 可选，查看详情回调
}

/**
 * 角色列表组件
 * 展示角色列表并提供编辑、删除和对话操作
 */
export default function CharacterList({
	characters,
	onEdit,
	onDelete,
	onChat,
	onViewDetail,
}: CharacterListProps) {
	// 列表为空时显示的内容
	if (characters.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无角色，请添加新角色
			</div>
		);
	}

	return (
		<div className="character-list">
			<h4>角色列表</h4>
			<div
				className="characters-container"
				style={{ maxHeight: 400, overflowY: "auto" }}
			>
				{characters.map((character) => (
					<div
						key={character.id}
						className="character-card"
						style={{
							border: "1px solid #c0c0c0",
							borderRadius: 4,
							padding: 12,
							marginBottom: 16,
							background: "#f8f8f8",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 8,
							}}
						>
							<h5
								style={{
									margin: 0,
									cursor: onViewDetail ? "pointer" : "default",
								}}
								onClick={
									onViewDetail ? () => onViewDetail(character.id) : undefined
								}
								title={onViewDetail ? "点击查看详情" : ""}
							>
								{character.name}
							</h5>
							<div>
								{onViewDetail && (
									<button
										className="button"
										onClick={() => onViewDetail(character.id)}
										title="查看角色详情"
									>
										详情
									</button>
								)}
								{onChat && (
									<button
										className="button"
										onClick={() => onChat(character)}
										style={{ marginLeft: 4 }}
										title="与角色对话"
									>
										对话
									</button>
								)}
								<button
									className="button"
									style={{ marginLeft: 4 }}
									onClick={() => onEdit(character.id)}
								>
									编辑
								</button>
								<button
									className="button"
									style={{ marginLeft: 4 }}
									onClick={() => {
										// 二次确认删除
										if (
											window.confirm(`确定要删除角色"${character.name}"吗？`)
										) {
											onDelete(character.id);
										}
									}}
								>
									删除
								</button>
							</div>
						</div>
						<div
							style={{
								fontSize: 14,
								lineHeight: 1.5,
								cursor: onViewDetail ? "pointer" : "default",
							}}
							onClick={
								onViewDetail ? () => onViewDetail(character.id) : undefined
							}
						>
							{character.description || <em>无描述</em>}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
