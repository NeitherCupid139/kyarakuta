import React, { useState } from "react";
import { useChapters } from "@/app/hooks/useChapters";
import type { Chapter, Work } from "@/app/db/schema";

/**
 * 章节管理窗口组件
 * 实现章节的增删改查和排序功能
 */
const ChaptersWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取章节相关操作
	const {
		chapters,
		loading,
		error,
		createChapter,
		updateChapter,
		deleteChapter,
		reorderChapters,
	} = useChapters(work?.id || "");

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		content: "",
	});

	// 处理拖拽排序相关
	const [draggedChapter, setDraggedChapter] = useState<Chapter | null>(null);

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 选择编辑章节
	const handleSelectChapter = (chapter: Chapter) => {
		setSelectedChapter(chapter);
		setFormData({
			title: chapter.title,
			content: chapter.content || "",
		});
		setEditMode("edit");
	};

	// 准备创建新章节
	const handleCreateNew = () => {
		setSelectedChapter(null);
		setFormData({
			title: "",
			content: "",
		});
		setEditMode("create");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedChapter(null);
	};

	// 保存章节
	const handleSave = async () => {
		try {
			if (editMode === "create") {
				// 创建新章节
				await createChapter({
					title: formData.title,
					content: formData.content || null,
					nextChapterId: null,
					order: chapters.length, // 默认顺序值
				});
			} else if (editMode === "edit" && selectedChapter) {
				// 更新现有章节
				await updateChapter(selectedChapter.id, {
					title: formData.title,
					content: formData.content || null,
				});
			}
			setEditMode(null);
			setSelectedChapter(null);
		} catch (err) {
			console.error("保存章节失败:", err);
		}
	};

	// 删除章节
	const handleDelete = async (chapter: Chapter) => {
		if (window.confirm(`确定要删除章节"${chapter.title}"吗？`)) {
			try {
				await deleteChapter(chapter.id);
			} catch (err) {
				console.error("删除章节失败:", err);
			}
		}
	};

	// 开始拖拽
	const handleDragStart = (chapter: Chapter) => {
		setDraggedChapter(chapter);
	};

	// 拖拽结束
	const handleDragEnd = () => {
		setDraggedChapter(null);
	};

	// 拖拽进入目标区域
	const handleDragOver = (e: React.DragEvent, targetChapter: Chapter) => {
		e.preventDefault();
		if (!draggedChapter || draggedChapter.id === targetChapter.id) return;
	};

	// 放置拖拽项
	const handleDrop = (e: React.DragEvent, targetChapter: Chapter) => {
		e.preventDefault();
		if (!draggedChapter || draggedChapter.id === targetChapter.id) return;

		// 重新排序章节
		const reordered = [...chapters];
		const draggedIndex = reordered.findIndex((c) => c.id === draggedChapter.id);
		const targetIndex = reordered.findIndex((c) => c.id === targetChapter.id);

		reordered.splice(draggedIndex, 1);
		reordered.splice(targetIndex, 0, draggedChapter);

		// 更新顺序值
		const updatedChapters = reordered.map((chapter, index) => ({
			...chapter,
			order: index,
		}));

		reorderChapters(updatedChapters);
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
								{editMode === "create" ? "创建新章节" : "编辑章节"}
							</h2>
							<div className="field-row-stacked mb-4">
								<label htmlFor="title">章节标题</label>
								<input
									id="title"
									name="title"
									type="text"
									value={formData.title}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="content">章节内容</label>
								<textarea
									id="content"
									name="content"
									value={formData.content}
									onChange={handleInputChange}
									rows={10}
									className="w-full"
								/>
							</div>

							<div className="field-row mt-4">
								<button onClick={handleCancel}>取消</button>
								<button onClick={handleSave} disabled={!formData.title}>
									保存
								</button>
							</div>
						</div>
					) : (
						// 章节列表
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg">章节列表</h2>
								<button onClick={handleCreateNew}>添加新章节</button>
							</div>

							{chapters.length === 0 ? (
								<p>暂无章节，点击&quot;添加新章节&quot;按钮开始创作。</p>
							) : (
								<div className="border border-gray-300">
									{chapters.map((chapter) => (
										<div
											key={chapter.id}
											className="p-3 border-b border-gray-300 flex justify-between items-center hover:bg-gray-100 cursor-move"
											draggable
											onDragStart={() => handleDragStart(chapter)}
											onDragEnd={handleDragEnd}
											onDragOver={(e) => handleDragOver(e, chapter)}
											onDrop={(e) => handleDrop(e, chapter)}
											style={{
												background:
													draggedChapter?.id === chapter.id
														? "#e6f7ff"
														: "inherit",
											}}
										>
											<div className="flex items-center">
												<span className="mr-2">{chapter.order + 1}.</span>
												<span>{chapter.title}</span>
											</div>
											<div className="flex gap-2">
												<button onClick={() => handleSelectChapter(chapter)}>
													编辑
												</button>
												<button onClick={() => handleDelete(chapter)}>
													删除
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

export default ChaptersWindows;
