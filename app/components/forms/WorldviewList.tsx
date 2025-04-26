import React from "react";
import { Worldview } from "./WorldviewForm";

// 列表属性定义
interface WorldviewListProps {
	worldviews: Worldview[]; // 世界观列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
	onAnalyze?: (worldview: Worldview) => void; // 可选，分析回调
}

/**
 * 世界观列表组件
 * 展示世界观列表并提供编辑、删除和分析操作
 */
export default function WorldviewList({
	worldviews,
	onEdit,
	onDelete,
	onAnalyze,
}: WorldviewListProps) {
	// 列表为空时显示的内容
	if (worldviews.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无世界观信息，请添加新世界观
			</div>
		);
	}

	return (
		<div className="worldview-list">
			<h4>世界观列表</h4>
			<div
				className="worldviews-container"
				style={{ maxHeight: 400, overflowY: "auto" }}
			>
				{worldviews.map((worldview) => (
					<div
						key={worldview.id}
						className="worldview-card"
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
								alignItems: "center",
								marginBottom: 8,
							}}
						>
							<h5 style={{ margin: 0 }}>{worldview.title}</h5>
							<div>
								{onAnalyze && (
									<button
										className="button"
										onClick={() => onAnalyze(worldview)}
										title="分析章节是否符合世界观"
										style={{ marginRight: 4 }}
									>
										分析
									</button>
								)}
								<button className="button" onClick={() => onEdit(worldview.id)}>
									编辑
								</button>
								<button
									className="button"
									style={{ marginLeft: 4 }}
									onClick={() => {
										// 二次确认删除
										if (
											window.confirm(`确定要删除世界观"${worldview.title}"吗？`)
										) {
											onDelete(worldview.id);
										}
									}}
								>
									删除
								</button>
							</div>
						</div>
						<div
							className="worldview-content"
							style={{
								fontSize: 14,
								lineHeight: 1.5,
								maxHeight: 120,
								overflowY: "auto",
								backgroundColor: "#fff",
								padding: 8,
								border: "1px solid #ddd",
								borderRadius: 4,
							}}
						>
							{worldview.content || <em>无内容</em>}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
