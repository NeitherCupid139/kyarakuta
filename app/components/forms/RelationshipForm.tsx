import React, { useState, useEffect } from "react";
import { Character } from "./CharacterForm";

// 关系类型枚举
export const relationTypes = [
	"family", // 家人
	"friend", // 朋友
	"enemy", // 敌人
	"lover", // 恋人
	"colleague", // 同事
	"other", // 其他
] as const;

export type RelationType = (typeof relationTypes)[number];

// 关系类型中文映射
export const relationTypeLabels: Record<RelationType, string> = {
	family: "家人",
	friend: "朋友",
	enemy: "敌人",
	lover: "恋人",
	colleague: "同事",
	other: "其他",
};

// 角色关系接口定义
export interface Relationship {
	id: number;
	characterId1: number;
	characterId2: number;
	character1Name: string; // 角色1名称（用于显示）
	character2Name: string; // 角色2名称（用于显示）
	relationType: RelationType;
	description: string;
}

// 表单属性定义
interface RelationshipFormProps {
	relationship?: Relationship; // 可选，编辑时传入
	characters: Character[]; // 可选择的角色列表
	onSubmit: (
		relationship: Omit<Relationship, "id" | "character1Name" | "character2Name">
	) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 角色关系表单组件
 * 用于创建或编辑角色间的关系
 */
export default function RelationshipForm({
	relationship,
	characters,
	onSubmit,
	onCancel,
}: RelationshipFormProps) {
	// 表单状态
	const [characterId1, setCharacterId1] = useState<number>(0);
	const [characterId2, setCharacterId2] = useState<number>(0);
	const [relationType, setRelationType] = useState<RelationType>("other");
	const [description, setDescription] = useState("");

	// 加载现有关系数据
	useEffect(() => {
		if (relationship) {
			setCharacterId1(relationship.characterId1);
			setCharacterId2(relationship.characterId2);
			setRelationType(relationship.relationType);
			setDescription(relationship.description);
		}
	}, [relationship]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!characterId1 || !characterId2 || characterId1 === characterId2) {
			alert("请选择两个不同的角色");
			return;
		}

		// 提交数据
		onSubmit({
			characterId1,
			characterId2,
			relationType,
			description,
		});

		// 清空表单
		if (!relationship) {
			setCharacterId1(0);
			setCharacterId2(0);
			setRelationType("other");
			setDescription("");
		}
	};

	// 是否为编辑模式
	const isEditMode = !!relationship;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑角色关系" : "添加新角色关系"}</h4>

			<div className="field-row-stacked" style={{ marginBottom: 12 }}>
				<label htmlFor="character-1">角色A</label>
				<select
					id="character-1"
					value={characterId1}
					onChange={(e) => setCharacterId1(Number(e.target.value))}
					style={{ width: "100%", boxSizing: "border-box" }}
					required
				>
					<option value={0} disabled>
						请选择角色A
					</option>
					{characters.map((char) => (
						<option
							key={char.id}
							value={char.id}
							disabled={char.id === characterId2}
						>
							{char.name}
						</option>
					))}
				</select>
			</div>

			<div className="field-row-stacked" style={{ marginBottom: 12 }}>
				<label htmlFor="character-2">角色B</label>
				<select
					id="character-2"
					value={characterId2}
					onChange={(e) => setCharacterId2(Number(e.target.value))}
					style={{ width: "100%", boxSizing: "border-box" }}
					required
				>
					<option value={0} disabled>
						请选择角色B
					</option>
					{characters.map((char) => (
						<option
							key={char.id}
							value={char.id}
							disabled={char.id === characterId1}
						>
							{char.name}
						</option>
					))}
				</select>
			</div>

			<div className="field-row-stacked" style={{ marginBottom: 12 }}>
				<label htmlFor="relation-type">关系类型</label>
				<select
					id="relation-type"
					value={relationType}
					onChange={(e) => setRelationType(e.target.value as RelationType)}
					style={{ width: "100%", boxSizing: "border-box" }}
					required
				>
					{relationTypes.map((type) => (
						<option key={type} value={type}>
							{relationTypeLabels[type]}
						</option>
					))}
				</select>
			</div>

			<div className="field-row-stacked" style={{ marginBottom: 16 }}>
				<label htmlFor="relation-description">关系描述</label>
				<textarea
					id="relation-description"
					rows={4}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					style={{
						width: "100%",
						boxSizing: "border-box",
						resize: "vertical",
						minHeight: 60,
					}}
					placeholder="描述两个角色之间的关系..."
				/>
			</div>

			<div className="field-row">
				<div style={{ marginLeft: "auto" }}>
					<button type="submit" className="button">
						{isEditMode ? "保存" : "添加"}
					</button>

					{isEditMode && onCancel && (
						<button
							type="button"
							className="button"
							style={{ marginLeft: 8 }}
							onClick={onCancel}
						>
							取消
						</button>
					)}
				</div>
			</div>
		</form>
	);
}
