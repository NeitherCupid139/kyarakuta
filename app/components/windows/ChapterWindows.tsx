import React, { useState } from "react";
import "98.css";

interface Chapter {
	id: number;
	title: string;
	summary: string;
}

const initialChapters: Chapter[] = [];

export default function ChapterWindows() {
	const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newTitle, setNewTitle] = useState("");
	const [newSummary, setNewSummary] = useState("");

	const handleAdd = () => {
		if (!newTitle.trim()) return;
		setChapters([
			...chapters,
			{ id: Date.now(), title: newTitle, summary: newSummary },
		]);
		setNewTitle("");
		setNewSummary("");
	};

	const handleEdit = (id: number) => {
		const chapter = chapters.find((c) => c.id === id);
		if (chapter) {
			setEditingId(id);
			setNewTitle(chapter.title);
			setNewSummary(chapter.summary);
		}
	};

	const handleSave = () => {
		setChapters(
			chapters.map((c) =>
				c.id === editingId ? { ...c, title: newTitle, summary: newSummary } : c
			)
		);
		setEditingId(null);
		setNewTitle("");
		setNewSummary("");
	};

	const handleDelete = (id: number) => {
		setChapters(chapters.filter((c) => c.id !== id));
	};

	return (
		<div className="window-body">
			<div className="field-row-stacked">
				<label htmlFor="chapter-title">章节标题</label>
				<input
					id="chapter-title"
					type="text"
					value={newTitle}
					onChange={(e) => setNewTitle(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row-stacked">
				<label htmlFor="chapter-summary">章节概要</label>
				<input
					id="chapter-summary"
					type="text"
					value={newSummary}
					onChange={(e) => setNewSummary(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row">
				{editingId ? (
					<button className="button" onClick={handleSave}>
						保存
					</button>
				) : (
					<button className="button" onClick={handleAdd}>
						添加
					</button>
				)}
				{editingId && (
					<button
						className="button"
						style={{ marginLeft: 8 }}
						onClick={() => {
							setEditingId(null);
							setNewTitle("");
							setNewSummary("");
						}}
					>
						取消
					</button>
				)}
			</div>
			<ul style={{ marginTop: 16 }}>
				{chapters.map((c) => (
					<li key={c.id} style={{ marginBottom: 8 }}>
						<b>{c.title}</b>：{c.summary}
						<button
							className="button"
							style={{ marginLeft: 8 }}
							onClick={() => handleEdit(c.id)}
						>
							编辑
						</button>
						<button
							className="button"
							style={{ marginLeft: 4 }}
							onClick={() => handleDelete(c.id)}
						>
							删除
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
