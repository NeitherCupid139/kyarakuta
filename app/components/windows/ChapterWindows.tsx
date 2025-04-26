import React, { useState } from "react";
import "98.css";

// 导入自定义组件
import ChapterForm, { Chapter } from "@/app/components/forms/ChapterForm";
import ChapterList from "@/app/components/forms/ChapterList";

// 初始章节数据
const initialChapters: Chapter[] = [];

/**
 * 章节窗口组件
 * 管理章节的 CRUD 操作
 */
export default function ChapterWindows() {
	// 状态管理
	const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
	const [editingChapter, setEditingChapter] = useState<Chapter | undefined>(
		undefined
	);

	// 处理添加章节
	const handleAddChapter = (chapterData: Omit<Chapter, "id">) => {
		const newChapter = {
			id: Date.now(), // 使用时间戳作为临时 ID
			...chapterData,
		};

		// 添加到列表末尾
		setChapters([...chapters, newChapter]);
	};

	// 处理编辑章节
	const handleEdit = (id: number) => {
		const chapter = chapters.find((c) => c.id === id);
		if (chapter) {
			setEditingChapter(chapter);
		}
	};

	// 处理保存编辑
	const handleUpdateChapter = (chapterData: Omit<Chapter, "id">) => {
		if (!editingChapter) return;

		setChapters(
			chapters.map((c) =>
				c.id === editingChapter.id ? { ...c, ...chapterData } : c
			)
		);
		setEditingChapter(undefined);
	};

	// 处理删除章节
	const handleDelete = (id: number) => {
		setChapters(chapters.filter((c) => c.id !== id));
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setEditingChapter(undefined);
	};

	return (
		<div
			className="window-body"
			style={{ minHeight: 350, display: "flex", flexDirection: "column" }}
		>
			<h3>章节管理</h3>

			<div style={{ display: "flex", gap: 24, flexGrow: 1 }}>
				{/* 左侧：章节表单 */}
				<div style={{ flex: "0 0 50%" }}>
					{editingChapter ? (
						<ChapterForm
							chapter={editingChapter}
							onSubmit={handleUpdateChapter}
							onCancel={handleCancelEdit}
						/>
					) : (
						<ChapterForm onSubmit={handleAddChapter} />
					)}
				</div>

				{/* 右侧：章节列表 */}
				<div style={{ flex: "0 0 50%" }}>
					<ChapterList
						chapters={chapters}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</div>
			</div>
		</div>
	);
}
