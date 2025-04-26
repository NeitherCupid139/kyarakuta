import React from "react";
import { Relationship, relationTypeLabels } from "./RelationshipForm";

// 列表属性定义
interface RelationshipListProps {
	relationships: Relationship[]; // 角色关系列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
}

/**
 * 角色关系列表组件
 * 展示角色关系列表并提供编辑和删除操作
 */
export default function RelationshipList({
	relationships,
	onEdit,
	onDelete,
}: RelationshipListProps) {
	// 列表为空时显示的内容
	if (relationships.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无角色关系，请添加新关系
			</div>
		);
	}

	return (
		<div className="relationship-list">
			<h4>角色关系列表</h4>
			<div
				className="relationships-container"
				style={{ maxHeight: 400, overflowY: "auto" }}
			>
				<table className="table98" style={{ width: "100%" }}>
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
						{relationships.map((rel) => (
							<tr key={rel.id}>
								<td>{rel.character1Name}</td>
								<td>
									<span
										className="relationship-type"
										style={{
											display: "inline-block",
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: "#e0e0e0",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									>
										{relationTypeLabels[rel.relationType]}
									</span>
								</td>
								<td>{rel.character2Name}</td>
								<td>{rel.description || <em>无描述</em>}</td>
								<td>
									<button className="button" onClick={() => onEdit(rel.id)}>
										编辑
									</button>
									<button
										className="button"
										style={{ marginLeft: 4 }}
										onClick={() => {
											// 二次确认删除
											if (
												window.confirm(
													`确定要删除 "${rel.character1Name}" 和 "${rel.character2Name}" 之间的关系吗？`
												)
											) {
												onDelete(rel.id);
											}
										}}
									>
										删除
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
