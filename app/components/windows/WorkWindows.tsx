import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import WorkForm, { Work } from "@/app/components/forms/WorkForm";
import WorkList from "@/app/components/forms/WorkList";

// 初始作品数据
const initialWorks: Work[] = [
	{ id: 1, title: "作品一", description: "这是第一个作品的描述。" },
	{ id: 2, title: "作品二", description: "这是第二个作品的描述。" },
	{ id: 3, title: "作品三", description: "这是第三个作品的描述。" },
];

/**
 * 作品窗口组件
 * 管理作品的 CRUD 操作
 */
export default function WorkWindows() {
	// 状态管理
	const [works, setWorks] = useState<Work[]>(initialWorks);
	const [editingWork, setEditingWork] = useState<Work | undefined>(undefined);

	// 处理添加作品
	const handleAddWork = (workData: Omit<Work, "id">) => {
		const newWork = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...workData,
		};
		setWorks([...works, newWork]);
	};

	// 处理编辑作品
	const handleEdit = (id: number) => {
		const work = works.find((w) => w.id === id);
		if (work) {
			setEditingWork(work);
		}
	};

	// 处理保存编辑
	const handleUpdateWork = (workData: Omit<Work, "id">) => {
		if (!editingWork) return;

		setWorks(
			works.map((w) => (w.id === editingWork.id ? { ...w, ...workData } : w))
		);
		setEditingWork(undefined);
	};

	// 处理删除作品
	const handleDelete = (id: number) => {
		setWorks(works.filter((w) => w.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingWork(undefined);
	};

	return (
		<div className="window-body">
			<h3>作品列表</h3>

			{/* 作品列表 */}
			<WorkList works={works} onEdit={handleEdit} onDelete={handleDelete} />

			<div style={{ marginTop: 24 }}>
				{/* 编辑或添加作品表单 */}
				{editingWork ? (
					<WorkForm
						work={editingWork}
						onSubmit={handleUpdateWork}
						onCancel={handleCancelEdit}
					/>
				) : (
					<WorkForm onSubmit={handleAddWork} />
				)}
			</div>
		</div>
	);
}
