import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import WorldviewForm, { Worldview } from "@/app/components/forms/WorldviewForm";
import WorldviewList from "@/app/components/forms/WorldviewList";

// 初始世界观数据
const initialWorldviews: Worldview[] = [];

/**
 * 世界观窗口组件
 * 管理世界观信息的 CRUD 操作
 */
export default function WorldviewWindows() {
	// 状态管理
	const [worldviews, setWorldviews] = useState<Worldview[]>(initialWorldviews);
	const [editingWorldview, setEditingWorldview] = useState<
		Worldview | undefined
	>(undefined);

	// 处理添加世界观
	const handleAddWorldview = (worldviewData: Omit<Worldview, "id">) => {
		const newWorldview = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...worldviewData,
		};

		// 添加到列表末尾
		setWorldviews([...worldviews, newWorldview]);
	};

	// 处理编辑世界观
	const handleEdit = (id: number) => {
		const worldview = worldviews.find((w) => w.id === id);
		if (worldview) {
			setEditingWorldview(worldview);
		}
	};

	// 处理保存编辑
	const handleUpdateWorldview = (worldviewData: Omit<Worldview, "id">) => {
		if (!editingWorldview) return;

		setWorldviews(
			worldviews.map((w) =>
				w.id === editingWorldview.id ? { ...w, ...worldviewData } : w
			)
		);
		setEditingWorldview(undefined);
	};

	// 处理删除世界观
	const handleDelete = (id: number) => {
		setWorldviews(worldviews.filter((w) => w.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingWorldview(undefined);
	};

	// 分析世界观（未来实现）
	const handleAnalyzeWorldview = (worldview: Worldview) => {
		// 这里将来会实现世界观分析功能
		alert(
			`即将分析世界观"${worldview.title}"与章节的匹配度...\n\n${worldview.content}`
		);
	};

	return (
		<div
			className="window-body"
			style={{ minHeight: 350, display: "flex", flexDirection: "column" }}
		>
			<h3>世界观管理</h3>

			<div style={{ display: "flex", gap: 24, flexGrow: 1 }}>
				{/* 左侧：世界观表单 */}
				<div style={{ flex: "0 0 40%" }}>
					{editingWorldview ? (
						<WorldviewForm
							worldview={editingWorldview}
							onSubmit={handleUpdateWorldview}
							onCancel={handleCancelEdit}
						/>
					) : (
						<WorldviewForm onSubmit={handleAddWorldview} />
					)}
				</div>

				{/* 右侧：世界观列表 */}
				<div style={{ flex: "0 0 60%" }}>
					<WorldviewList
						worldviews={worldviews}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onAnalyze={handleAnalyzeWorldview}
					/>
				</div>
			</div>
		</div>
	);
}
