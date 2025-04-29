import React, { useState, useRef, useEffect } from "react";
import { useCharacterRelations } from "@/app/hooks/useCharacterRelations";
import type { CharacterRelation, Work } from "@/app/db/schema";

/**
 * 角色关系管理组件
 * 实现角色关系的增删改查功能和图形化展示
 */
const CharacterRelationsWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取角色关系相关操作
	const {
		relations,
		characters,
		loading,
		error,
		createRelation,
		updateRelation,
		deleteRelation,
		hasRelation,
		getRelationGraphData,
	} = useCharacterRelations(work?.id || "");

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedRelation, setSelectedRelation] =
		useState<CharacterRelation | null>(null);
	const [formData, setFormData] = useState({
		characterIdA: "",
		characterIdB: "",
		relationType: "",
		description: "",
	});

	// 关系图状态
	const [graphView, setGraphView] = useState(false);
	const graphRef = useRef<HTMLDivElement>(null);

	// 关系类型选项
	const relationTypes = [
		{ value: "family", label: "家庭关系" },
		{ value: "friend", label: "朋友" },
		{ value: "lover", label: "恋人" },
		{ value: "enemy", label: "敌人" },
		{ value: "colleague", label: "同事" },
		{ value: "master", label: "师徒" },
		{ value: "other", label: "其他" },
	];

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 选择编辑关系
	const handleSelectRelation = (relation: CharacterRelation) => {
		setSelectedRelation(relation);
		setFormData({
			characterIdA: relation.characterIdA,
			characterIdB: relation.characterIdB,
			relationType: relation.relationType,
			description: relation.description || "",
		});
		setEditMode("edit");
	};

	// 准备创建新关系
	const handleCreateNew = () => {
		setSelectedRelation(null);
		setFormData({
			characterIdA: "",
			characterIdB: "",
			relationType: "",
			description: "",
		});
		setEditMode("create");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedRelation(null);
	};

	// 保存关系
	const handleSave = async () => {
		try {
			if (editMode === "create") {
				// 创建新关系
				await createRelation({
					characterIdA: formData.characterIdA,
					characterIdB: formData.characterIdB,
					relationType: formData.relationType,
					description: formData.description || null,
				});
			} else if (editMode === "edit" && selectedRelation) {
				// 更新现有关系
				await updateRelation(selectedRelation.id, {
					relationType: formData.relationType,
					description: formData.description || null,
				});
			}
			setEditMode(null);
			setSelectedRelation(null);
		} catch (err) {
			console.error("保存角色关系失败:", err);
			alert(err instanceof Error ? err.message : "保存角色关系失败");
		}
	};

	// 删除关系
	const handleDelete = async (relation: CharacterRelation) => {
		if (window.confirm("确定要删除这个角色关系吗？")) {
			try {
				await deleteRelation(relation.id);
			} catch (err) {
				console.error("删除角色关系失败:", err);
			}
		}
	};

	// 获取角色名称
	const getCharacterName = (characterId: string) => {
		const character = characters.find((c) => c.id === characterId);
		return character ? character.name : "未知角色";
	};

	// 获取关系类型显示名称
	const getRelationTypeName = (type: string) => {
		const relationType = relationTypes.find((rt) => rt.value === type);
		return relationType ? relationType.label : type;
	};

	// 绘制关系图
	useEffect(() => {
		if (graphView && graphRef.current && characters.length > 0) {
			// 此处简单模拟，实际应用中可以使用D3.js等图形库
			const graphData = getRelationGraphData();
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			// 清空画布
			graphRef.current.innerHTML = "";
			canvas.width = graphRef.current.clientWidth;
			canvas.height = 400;
			graphRef.current.appendChild(canvas);

			// 计算节点位置（简单圆形布局）
			const radius = Math.min(canvas.width, canvas.height) * 0.4;
			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;

			const nodePositions: Record<string, { x: number; y: number }> = {};

			// 计算每个节点的位置
			graphData.nodes.forEach((node, i) => {
				const angle = (i / graphData.nodes.length) * Math.PI * 2;
				nodePositions[node.id] = {
					x: centerX + radius * Math.cos(angle),
					y: centerY + radius * Math.sin(angle),
				};
			});

			// 绘制连接线
			ctx.strokeStyle = "#999";
			ctx.lineWidth = 1;

			graphData.edges.forEach((edge) => {
				const source = nodePositions[edge.source];
				const target = nodePositions[edge.target];

				if (source && target) {
					ctx.beginPath();
					ctx.moveTo(source.x, source.y);
					ctx.lineTo(target.x, target.y);
					ctx.stroke();

					// 绘制关系类型标签
					const midX = (source.x + target.x) / 2;
					const midY = (source.y + target.y) / 2;

					ctx.fillStyle = "#333";
					ctx.font = "10px Arial";
					ctx.fillText(getRelationTypeName(edge.type), midX, midY);
				}
			});

			// 绘制节点
			graphData.nodes.forEach((node) => {
				const pos = nodePositions[node.id];

				if (pos) {
					// 绘制节点圆形
					ctx.beginPath();
					ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
					ctx.fillStyle = "#3498db";
					ctx.fill();

					// 绘制名称标签
					ctx.fillStyle = "#fff";
					ctx.font = "12px Arial";
					ctx.textAlign = "center";
					ctx.fillText(node.name, pos.x, pos.y);
				}
			});
		}
	}, [graphView, characters, relations, getRelationGraphData]);

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
								{editMode === "create" ? "创建新角色关系" : "编辑角色关系"}
							</h2>

							{editMode === "create" && (
								<div className="field-row mb-4">
									<div className="field-row-stacked w-1/2 mr-2">
										<label htmlFor="characterIdA">角色A</label>
										<select
											id="characterIdA"
											name="characterIdA"
											value={formData.characterIdA}
											onChange={handleInputChange}
											required
											className="w-full"
										>
											<option value="">选择角色</option>
											{characters.map((character) => (
												<option key={character.id} value={character.id}>
													{character.name}
												</option>
											))}
										</select>
									</div>

									<div className="field-row-stacked w-1/2 ml-2">
										<label htmlFor="characterIdB">角色B</label>
										<select
											id="characterIdB"
											name="characterIdB"
											value={formData.characterIdB}
											onChange={handleInputChange}
											required
											className="w-full"
											disabled={!formData.characterIdA}
										>
											<option value="">选择角色</option>
											{characters
												.filter(
													(character) =>
														character.id !== formData.characterIdA &&
														(!formData.characterIdA ||
															!hasRelation(formData.characterIdA, character.id))
												)
												.map((character) => (
													<option key={character.id} value={character.id}>
														{character.name}
													</option>
												))}
										</select>
									</div>
								</div>
							)}

							{editMode === "edit" && (
								<div className="field-row mb-4">
									<div className="field-row-stacked w-full">
										<label>相关角色</label>
										<div className="p-2 border">
											{getCharacterName(formData.characterIdA)} 与{" "}
											{getCharacterName(formData.characterIdB)}
										</div>
									</div>
								</div>
							)}

							<div className="field-row-stacked mb-4">
								<label htmlFor="relationType">关系类型</label>
								<select
									id="relationType"
									name="relationType"
									value={formData.relationType}
									onChange={handleInputChange}
									required
									className="w-full"
								>
									<option value="">选择关系类型</option>
									{relationTypes.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="description">关系描述</label>
								<textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={4}
									className="w-full"
								/>
							</div>

							<div className="field-row mt-4">
								<button onClick={handleCancel}>取消</button>
								<button
									onClick={handleSave}
									disabled={
										!formData.relationType ||
										(editMode === "create" &&
											(!formData.characterIdA || !formData.characterIdB))
									}
								>
									保存
								</button>
							</div>
						</div>
					) : (
						// 关系列表/图形界面
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg">
									{work ? `${work.title} - 角色关系` : "角色关系"}
								</h2>
								<div>
									<button
										onClick={() => setGraphView(!graphView)}
										className="mr-2"
									>
										{graphView ? "列表视图" : "图形视图"}
									</button>
									<button onClick={handleCreateNew}>添加新关系</button>
								</div>
							</div>

							{graphView ? (
								// 图形视图
								<div ref={graphRef} className="border p-2 h-96 w-full">
									{characters.length === 0 ? (
										<p className="text-center p-4">请先创建角色</p>
									) : relations.length === 0 ? (
										<p className="text-center p-4">暂无角色关系数据</p>
									) : (
										<p className="text-center p-4">加载关系图...</p>
									)}
								</div>
							) : (
								// 列表视图
								<>
									{relations.length === 0 ? (
										<p>暂无角色关系，点击&quot;添加新关系&quot;按钮创建。</p>
									) : (
										<table className="w-full">
											<thead>
												<tr>
													<th>角色A</th>
													<th>关系</th>
													<th>角色B</th>
													<th>描述</th>
													<th>操作</th>
												</tr>
											</thead>
											<tbody>
												{relations.map((relation) => (
													<tr key={relation.id} className="hover:bg-gray-100">
														<td>{getCharacterName(relation.characterIdA)}</td>
														<td>
															{getRelationTypeName(relation.relationType)}
														</td>
														<td>{getCharacterName(relation.characterIdB)}</td>
														<td>{relation.description || "-"}</td>
														<td>
															<div className="flex gap-2">
																<button
																	onClick={() => handleSelectRelation(relation)}
																>
																	编辑
																</button>
																<button onClick={() => handleDelete(relation)}>
																	删除
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CharacterRelationsWindows;
