import React, { useState, useEffect } from "react";
import "98.css";
import { Character } from "@/app/components/forms/CharacterForm";
import CharacterDetail from "@/app/components/details/CharacterDetail";
import CharacterForm from "@/app/components/forms/CharacterForm";

/**
 * 角色详情窗口属性接口
 */
interface CharacterDetailWindowProps {
	characterId: number;
	onBack: () => void; // 返回角色列表
	characters: Character[]; // 角色数据列表
	onUpdateCharacter: (id: number, data: Omit<Character, "id">) => void; // 更新角色数据
}

/**
 * 角色详情窗口组件
 * 展示角色详情并提供编辑功能
 */
export default function CharacterDetailWindow({
	characterId,
	onBack,
	characters,
	onUpdateCharacter,
}: CharacterDetailWindowProps) {
	// 角色数据
	const [character, setCharacter] = useState<Character | null>(null);
	// 编辑模式
	const [isEditing, setIsEditing] = useState<boolean>(false);

	// 加载角色数据
	useEffect(() => {
		const foundCharacter = characters.find((c) => c.id === characterId);
		if (foundCharacter) {
			setCharacter(foundCharacter);
		}
	}, [characterId, characters]);

	// 处理编辑
	const handleEdit = () => {
		setIsEditing(true);
	};

	// 处理保存编辑
	const handleSave = (data: Omit<Character, "id">) => {
		if (character) {
			onUpdateCharacter(character.id, data);

			// 更新本地状态
			setCharacter({
				...character,
				...data,
			});
		}

		setIsEditing(false);
	};

	// 取消编辑
	const handleCancel = () => {
		setIsEditing(false);
	};

	// 如果角色不存在
	if (!character) {
		return (
			<div className="window-body" style={{ padding: "16px" }}>
				<div className="status-bar">
					<p className="status-bar-field">未找到角色数据</p>
					<button className="button" onClick={onBack}>
						返回列表
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className="window-body"
			style={{ padding: "16px", height: "100%", overflow: "auto" }}
		>
			{/* 标题栏 */}
			<div
				className="title-bar-text"
				style={{ fontSize: "20px", marginBottom: "16px" }}
			>
				{isEditing ? "编辑角色" : "角色详情"}
			</div>

			{/* 内容区 */}
			{isEditing ? (
				// 编辑表单
				<div style={{ width: "100%" }}>
					<CharacterForm
						character={character}
						onSubmit={handleSave}
						onCancel={handleCancel}
					/>
				</div>
			) : (
				// 角色详情
				<CharacterDetail
					character={character}
					onEdit={handleEdit}
					onBack={onBack}
				/>
			)}
		</div>
	);
}
