import React, { useState, useEffect } from "react";

// 角色接口定义
export interface Character {
	id: number;
	name: string;
	description: string;
	// 注意：在实际应用中还需要添加 attributes 字段用于自定义属性
}

// 表单属性定义
interface CharacterFormProps {
	character?: Character; // 可选，编辑时传入
	onSubmit: (character: Omit<Character, "id">) => void; // 提交表单时的回调
	onCancel?: () => void; // 可选，取消编辑时的回调
}

/**
 * 角色表单组件
 * 用于创建或编辑角色信息
 */
export default function CharacterForm({
	character,
	onSubmit,
	onCancel,
}: CharacterFormProps) {
	// 表单状态
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	// 加载现有角色数据
	useEffect(() => {
		if (character) {
			setName(character.name);
			setDescription(character.description);
		}
	}, [character]);

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 校验表单输入
		if (!name.trim()) return;

		// 提交数据
		onSubmit({
			name,
			description,
		});

		// 清空表单
		setName("");
		setDescription("");
	};

	// 是否为编辑模式
	const isEditMode = !!character;

	return (
		<form onSubmit={handleSubmit}>
			<h4>{isEditMode ? "编辑角色" : "添加新角色"}</h4>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="character-name">角色名称</label>
				<input
					id="character-name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: 8, width: "100%", boxSizing: "border-box" }}
					required
				/>
			</div>

			<div className="field-row-stacked" style={{ maxWidth: "100%" }}>
				<label htmlFor="character-description">角色描述</label>
				<textarea
					id="character-description"
					rows={6}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					style={{
						width: "100%",
						boxSizing: "border-box",
						resize: "vertical",
						minHeight: 100,
					}}
					placeholder="描述角色的外貌、性格、背景故事等信息..."
				/>
			</div>

			{/* 未来可以在这里添加自定义属性编辑器 */}

			<div className="field-row" style={{ marginTop: 16 }}>
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
		</form>
	);
}
