import React from "react";
import { Chapter } from "./ChapterForm";
import { Modal } from "@/app/components/windows/ModalWindows";

// 列表属性定义
interface ChapterListProps {
	chapters: Chapter[]; // 章节列表
	onEdit: (id: number) => void; // 编辑回调
	onDelete: (id: number) => void; // 删除回调
}

/**
 * 章节列表组件
 * 展示章节列表并提供编辑和删除操作
 */
export default function ChapterList({
	chapters,
	onEdit,
	onDelete,
}: ChapterListProps) {
	// 列表为空时显示的内容
	if (chapters.length === 0) {
		return (
			<div
				className="field-row"
				style={{ justifyContent: "center", padding: "16px 0" }}
			>
				暂无章节，请添加新章节
			</div>
		);
	}

	// 处理章节删除
	const handleDeleteChapter = async (chapter: Chapter) => {
		// 二次确认删除
		const confirmed = await Modal.confirm(
			`确定要删除章节"${chapter.title}"吗？`,
			{
				title: "删除章节",
				icon: "/icons/delete.png",
			}
		);

		if (confirmed) {
			onDelete(chapter.id);
		}
	};

	return (
		<div className="chapter-list">
			<h4>章节列表</h4>
			<ul style={{ listStyleType: "none", padding: 0 }}>
				{chapters.map((chapter, index) => (
					<li
						key={chapter.id}
						style={{
							marginBottom: 16,
							padding: 12,
							border: "1px solid #dfdfdf",
							borderRadius: 4,
							background: "#f8f8f8",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 8,
							}}
						>
							<strong>
								{index + 1}. {chapter.title}
							</strong>
							<div>
								<button className="button" onClick={() => onEdit(chapter.id)}>
									编辑
								</button>
								<button
									className="button"
									style={{ marginLeft: 8 }}
									onClick={() => handleDeleteChapter(chapter)}
								>
									删除
								</button>
							</div>
						</div>
						<div style={{ fontSize: 14, lineHeight: 1.5 }}>
							{chapter.summary || <em>暂无概要</em>}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
