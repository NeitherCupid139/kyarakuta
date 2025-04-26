import React from "react";
import { Work } from "./WorkForm";

// 列表属性定义
interface WorkListProps {
	works: Work[]; // 作品列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
}

/**
 * 作品列表组件
 * 展示作品列表并提供编辑和删除操作
 */
export default function WorkList({ works, onEdit, onDelete }: WorkListProps) {
	// 列表为空时显示的内容
	if (works.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无作品，请添加新作品
			</div>
		);
	}

	return (
		<table className="table98" style={{ width: "100%" }}>
			<thead>
				<tr>
					<th>标题</th>
					<th>描述</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				{works.map((work) => (
					<tr key={work.id}>
						<td>{work.title}</td>
						<td>{work.description}</td>
						<td>
							<button className="button" onClick={() => onEdit(work.id)}>
								编辑
							</button>
							<button
								className="button"
								style={{ marginLeft: 8 }}
								onClick={() => {
									// 二次确认删除
									if (window.confirm(`确定要删除作品"${work.title}"吗？`)) {
										onDelete(work.id);
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
	);
}
