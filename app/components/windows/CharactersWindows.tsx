import React, { useState } from "react";
import { useCharacters } from "@/app/hooks/useCharacters";
import type { Character, Work } from "@/app/db/schema";

/**
 * 角色管理组件
 * 实现角色的增删改查功能和自定义属性管理
 */
const CharactersWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取角色相关操作
	const {
		characters,
		loading,
		error,
		createCharacter,
		updateCharacter,
		deleteCharacter,
		updateCharacterAttributes,
		removeCharacterAttribute,
	} = useCharacters(work?.id || "");

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
		null
	);
	const [selectedTab, setSelectedTab] = useState<"basic" | "attributes">(
		"basic"
	);
	const [formData, setFormData] = useState({
		name: "",
		avatar: "",
		background: "",
		personality: "",
		goals: "",
	});

	// 自定义属性表单状态
	const [newAttributeKey, setNewAttributeKey] = useState("");
	const [newAttributeValue, setNewAttributeValue] = useState("");

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 选择编辑角色
	const handleSelectCharacter = (character: Character) => {
		setSelectedCharacter(character);
		setFormData({
			name: character.name,
			avatar: character.avatar || "",
			background: character.background || "",
			personality: character.personality || "",
			goals: character.goals || "",
		});
		setEditMode("edit");
		setSelectedTab("basic");
	};

	// 准备创建新角色
	const handleCreateNew = () => {
		setSelectedCharacter(null);
		setFormData({
			name: "",
			avatar: "",
			background: "",
			personality: "",
			goals: "",
		});
		setEditMode("create");
		setSelectedTab("basic");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedCharacter(null);
	};

	// 保存角色
	const handleSave = async () => {
		try {
			if (editMode === "create") {
				// 创建新角色
				await createCharacter({
					name: formData.name,
					avatar: formData.avatar || null,
					background: formData.background || null,
					personality: formData.personality || null,
					goals: formData.goals || null,
				});
			} else if (editMode === "edit" && selectedCharacter) {
				// 更新现有角色
				await updateCharacter(selectedCharacter.id, {
					name: formData.name,
					avatar: formData.avatar || null,
					background: formData.background || null,
					personality: formData.personality || null,
					goals: formData.goals || null,
				});
			}
			setEditMode(null);
			setSelectedCharacter(null);
		} catch (err) {
			console.error("保存角色失败:", err);
		}
	};

	// 删除角色
	const handleDelete = async (character: Character) => {
		if (window.confirm(`确定要删除角色"${character.name}"吗？`)) {
			try {
				await deleteCharacter(character.id);
			} catch (err) {
				console.error("删除角色失败:", err);
			}
		}
	};

	// 添加自定义属性
	const handleAddAttribute = async () => {
		if (!selectedCharacter || !newAttributeKey.trim()) return;

		try {
			await updateCharacterAttributes(selectedCharacter.id, {
				[newAttributeKey]: newAttributeValue,
			});

			// 重置输入
			setNewAttributeKey("");
			setNewAttributeValue("");
		} catch (err) {
			console.error("添加角色属性失败:", err);
		}
	};

	// 删除自定义属性
	const handleRemoveAttribute = async (attributeKey: string) => {
		if (!selectedCharacter) return;

		try {
			await removeCharacterAttribute(selectedCharacter.id, attributeKey);
		} catch (err) {
			console.error("删除角色属性失败:", err);
		}
	};

	return (
		<div className="flex flex-col h-full">
			{loading ? (
				<p>加载中...</p>
			) : error ? (
				<p className="text-red-500">错误: {error.message}</p>
			) : (
				<div className="flex flex-col h-full">
					{editMode ? (
						// 编辑/创建表单
						<div className="p-4">
							<h2 className="mb-4">
								{editMode === "create" ? "创建新角色" : "编辑角色"}
							</h2>

							<div className="tabs">
								<button
									className={selectedTab === "basic" ? "active" : ""}
									onClick={() => setSelectedTab("basic")}
								>
									基本信息
								</button>
								{editMode === "edit" && (
									<button
										className={selectedTab === "attributes" ? "active" : ""}
										onClick={() => setSelectedTab("attributes")}
									>
										自定义属性
									</button>
								)}
							</div>

							{selectedTab === "basic" ? (
								// 基本信息表单
								<div className="mt-4">
									<div className="field-row-stacked mb-4">
										<label htmlFor="name">角色名称</label>
										<input
											id="name"
											name="name"
											type="text"
											value={formData.name}
											onChange={handleInputChange}
											required
										/>
									</div>

									<div className="field-row-stacked mb-4">
										<label htmlFor="avatar">角色头像URL</label>
										<input
											id="avatar"
											name="avatar"
											type="text"
											value={formData.avatar}
											onChange={handleInputChange}
										/>
										{formData.avatar && (
											<div className="mt-2 flex justify-center">
												<img
													src={formData.avatar}
													alt="角色头像预览"
													className="h-24 w-24 object-cover border"
													onError={(e) =>
														(e.currentTarget.style.display = "none")
													}
												/>
											</div>
										)}
									</div>

									<div className="field-row-stacked mb-4">
										<label htmlFor="personality">性格特点</label>
										<textarea
											id="personality"
											name="personality"
											rows={3}
											value={formData.personality}
											onChange={handleInputChange}
										/>
									</div>

									<div className="field-row-stacked mb-4">
										<label htmlFor="goals">目标动机</label>
										<textarea
											id="goals"
											name="goals"
											rows={3}
											value={formData.goals}
											onChange={handleInputChange}
										/>
									</div>

									<div className="field-row-stacked mb-4">
										<label htmlFor="background">角色背景</label>
										<textarea
											id="background"
											name="background"
											rows={5}
											value={formData.background}
											onChange={handleInputChange}
										/>
									</div>

									<div className="field-row mt-4">
										<button onClick={handleCancel}>取消</button>
										<button onClick={handleSave} disabled={!formData.name}>
											保存
										</button>
									</div>
								</div>
							) : (
								// 自定义属性表单
								<div className="mt-4">
									<div className="mb-4">
										<h3 className="mb-2">当前属性</h3>
										{selectedCharacter?.attributes &&
										Object.keys(selectedCharacter.attributes).length > 0 ? (
											<table className="w-full">
												<thead>
													<tr>
														<th>属性名</th>
														<th>值</th>
														<th>操作</th>
													</tr>
												</thead>
												<tbody>
													{Object.entries(selectedCharacter.attributes).map(
														([key, value]) => (
															<tr key={key}>
																<td>{key}</td>
																<td>{value as string}</td>
																<td>
																	<button
																		onClick={() => handleRemoveAttribute(key)}
																	>
																		删除
																	</button>
																</td>
															</tr>
														)
													)}
												</tbody>
											</table>
										) : (
											<p>暂无自定义属性</p>
										)}
									</div>

									<div className="mt-4">
										<h3 className="mb-2">添加新属性</h3>
										<div className="field-row mb-2">
											<input
												type="text"
												placeholder="属性名"
												value={newAttributeKey}
												onChange={(e) => setNewAttributeKey(e.target.value)}
												className="mr-2"
											/>
											<input
												type="text"
												placeholder="属性值"
												value={newAttributeValue}
												onChange={(e) => setNewAttributeValue(e.target.value)}
											/>
										</div>
										<button
											onClick={handleAddAttribute}
											disabled={!newAttributeKey.trim()}
										>
											添加属性
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						// 角色列表
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg">
									{work ? `${work.title} - 角色列表` : "角色列表"}
								</h2>
								<button onClick={handleCreateNew}>创建新角色</button>
							</div>

							{characters.length === 0 ? (
								<p>暂无角色，点击&quot;创建新角色&quot;按钮添加。</p>
							) : (
								<div className="grid grid-cols-2 gap-4">
									{characters.map((character) => (
										<div
											key={character.id}
											className="border p-3 cursor-pointer hover:bg-gray-50"
											onClick={() => handleSelectCharacter(character)}
										>
											<div className="flex items-center gap-3">
												{character.avatar ? (
													<img
														src={character.avatar}
														alt={character.name}
														className="w-12 h-12 object-cover border"
														onError={(e) =>
															(e.currentTarget.style.display = "none")
														}
													/>
												) : (
													<div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
														{character.name.charAt(0)}
													</div>
												)}
												<div className="flex-grow">
													<h3 className="font-bold">{character.name}</h3>
													<p className="text-sm truncate">
														{character.personality || "无性格描述"}
													</p>
												</div>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(character);
													}}
													className="delete-button"
												>
													×
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CharactersWindows;
