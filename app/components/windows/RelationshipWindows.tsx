import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import RelationshipForm, {
	Relationship,
} from "@/app/components/forms/RelationshipForm";
import RelationshipList from "@/app/components/forms/RelationshipList";
import { Character } from "@/app/components/forms/CharacterForm";

// 初始示例角色数据
const sampleCharacters: Character[] = [
	{ id: 1, name: "张三", description: "主角，热情开朗" },
	{ id: 2, name: "李四", description: "张三的好友，稳重可靠" },
	{ id: 3, name: "王五", description: "神秘人物，身份成谜" },
	{ id: 4, name: "赵六", description: "反派角色，野心勃勃" },
];

// 初始关系数据
const initialRelationships: Relationship[] = [];

/**
 * 角色关系窗口组件
 * 管理角色间关系的 CRUD 操作
 */
export default function RelationshipWindows() {
	// 状态管理
	const [characters] = useState<Character[]>(sampleCharacters); // 在实际应用中，这应该从数据库获取
	const [relationships, setRelationships] =
		useState<Relationship[]>(initialRelationships);
	const [editingRelationship, setEditingRelationship] = useState<
		Relationship | undefined
	>(undefined);

	// 处理添加关系
	const handleAddRelationship = (
		relationshipData: Omit<
			Relationship,
			"id" | "character1Name" | "character2Name"
		>
	) => {
		// 查找角色名称
		const character1 = characters.find(
			(c) => c.id === relationshipData.characterId1
		);
		const character2 = characters.find(
			(c) => c.id === relationshipData.characterId2
		);

		if (!character1 || !character2) {
			alert("无法找到选择的角色");
			return;
		}

		const newRelationship: Relationship = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...relationshipData,
			character1Name: character1.name,
			character2Name: character2.name,
		};

		// 添加到列表末尾
		setRelationships([...relationships, newRelationship]);
	};

	// 处理编辑关系
	const handleEdit = (id: number) => {
		const relationship = relationships.find((r) => r.id === id);
		if (relationship) {
			setEditingRelationship(relationship);
		}
	};

	// 处理保存编辑
	const handleUpdateRelationship = (
		relationshipData: Omit<
			Relationship,
			"id" | "character1Name" | "character2Name"
		>
	) => {
		if (!editingRelationship) return;

		// 查找角色名称
		const character1 = characters.find(
			(c) => c.id === relationshipData.characterId1
		);
		const character2 = characters.find(
			(c) => c.id === relationshipData.characterId2
		);

		if (!character1 || !character2) {
			alert("无法找到选择的角色");
			return;
		}

		setRelationships(
			relationships.map((r) =>
				r.id === editingRelationship.id
					? {
							...r,
							...relationshipData,
							character1Name: character1.name,
							character2Name: character2.name,
					  }
					: r
			)
		);
		setEditingRelationship(undefined);
	};

	// 处理删除关系
	const handleDelete = (id: number) => {
		setRelationships(relationships.filter((r) => r.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingRelationship(undefined);
	};

	return (
		<div
			className="window-body"
			style={{ minHeight: 350, display: "flex", flexDirection: "column" }}
		>
			<h3>角色关系管理</h3>

			<div style={{ display: "flex", gap: 24, flexGrow: 1 }}>
				{/* 左侧：关系表单 */}
				<div style={{ flex: "0 0 40%" }}>
					{editingRelationship ? (
						<RelationshipForm
							relationship={editingRelationship}
							characters={characters}
							onSubmit={handleUpdateRelationship}
							onCancel={handleCancelEdit}
						/>
					) : (
						<RelationshipForm
							characters={characters}
							onSubmit={handleAddRelationship}
						/>
					)}
				</div>

				{/* 右侧：关系列表 */}
				<div style={{ flex: "0 0 60%" }}>
					<RelationshipList
						relationships={relationships}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</div>
			</div>
		</div>
	);
}
