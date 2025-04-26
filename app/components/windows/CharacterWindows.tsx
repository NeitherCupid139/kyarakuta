import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import CharacterForm, { Character } from "@/app/components/forms/CharacterForm";
import CharacterList from "@/app/components/forms/CharacterList";
import CharacterDetailWindow from "./CharacterDetailWindow";

// 初始角色数据
const initialCharacters: Character[] = [];

/**
 * 角色窗口组件
 * 管理角色的 CRUD 操作和角色对话功能
 */
export default function CharacterWindows() {
	// 状态管理
	const [characters, setCharacters] = useState<Character[]>(initialCharacters);
	const [editingCharacter, setEditingCharacter] = useState<
		Character | undefined
	>(undefined);
	// 详情视图状态
	const [viewingCharacterId, setViewingCharacterId] = useState<number | null>(
		null
	);

	// 处理添加角色
	const handleAddCharacter = (characterData: Omit<Character, "id">) => {
		const newCharacter = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...characterData,
		};

		// 添加到列表末尾
		setCharacters([...characters, newCharacter]);
	};

	// 处理编辑角色
	const handleEdit = (id: number) => {
		const character = characters.find((c) => c.id === id);
		if (character) {
			setEditingCharacter(character);
		}
	};

	// 处理保存编辑
	const handleUpdateCharacter = (characterData: Omit<Character, "id">) => {
		if (!editingCharacter) return;

		setCharacters(
			characters.map((c) =>
				c.id === editingCharacter.id ? { ...c, ...characterData } : c
			)
		);
		setEditingCharacter(undefined);
	};

	// 处理更新角色（详情页面）
	const handleUpdateFromDetail = (id: number, data: Omit<Character, "id">) => {
		setCharacters(characters.map((c) => (c.id === id ? { ...c, ...data } : c)));
	};

	// 处理删除角色
	const handleDelete = (id: number) => {
		setCharacters(characters.filter((c) => c.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingCharacter(undefined);
	};

	// 处理角色对话
	const handleChatWithCharacter = (character: Character) => {
		// 这里将来会实现角色对话功能
		alert(
			`即将与角色"${character.name}"开始对话...\n\n${character.description}`
		);
	};

	// 查看角色详情
	const handleViewDetail = (id: number) => {
		setViewingCharacterId(id);
	};

	// 返回列表视图
	const handleBackToList = () => {
		setViewingCharacterId(null);
	};

	// 如果正在查看角色详情
	if (viewingCharacterId !== null) {
		return (
			<CharacterDetailWindow
				characterId={viewingCharacterId}
				onBack={handleBackToList}
				characters={characters}
				onUpdateCharacter={handleUpdateFromDetail}
			/>
		);
	}

	return (
		<div
			className="window-body"
			style={{ minHeight: 350, display: "flex", flexDirection: "column" }}
		>
			<h3>角色管理</h3>

			<div style={{ display: "flex", gap: 24, flexGrow: 1 }}>
				{/* 左侧：角色表单 */}
				<div style={{ flex: "0 0 40%" }}>
					{editingCharacter ? (
						<CharacterForm
							character={editingCharacter}
							onSubmit={handleUpdateCharacter}
							onCancel={handleCancelEdit}
						/>
					) : (
						<CharacterForm onSubmit={handleAddCharacter} />
					)}
				</div>

				{/* 右侧：角色列表 */}
				<div style={{ flex: "0 0 60%" }}>
					<CharacterList
						characters={characters}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onChat={handleChatWithCharacter}
						onViewDetail={handleViewDetail}
					/>
				</div>
			</div>
		</div>
	);
}
