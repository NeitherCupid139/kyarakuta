import React, { useState } from "react";

import "98.css";

interface Work {
	id: number;
	title: string;
	description: string;
}

const initialWorks: Work[] = [
	{ id: 1, title: "作品一", description: "这是第一个作品的描述。" },
	{ id: 2, title: "作品二", description: "这是第二个作品的描述。" },
	{ id: 3, title: "作品三", description: "这是第三个作品的描述。" },
];

export default function WorkWindows() {
	const [works, setWorks] = useState<Work[]>(initialWorks);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");

	// 添加作品
	const handleAdd = () => {
		if (!newTitle.trim()) return;
		setWorks([
			...works,
			{ id: Date.now(), title: newTitle, description: newDesc },
		]);
		setNewTitle("");
		setNewDesc("");
	};

	// 编辑作品
	const handleEdit = (id: number) => {
		const work = works.find((w) => w.id === id);
		if (work) {
			setEditingId(id);
			setNewTitle(work.title);
			setNewDesc(work.description);
		}
	};
	const handleSave = () => {
		setWorks(
			works.map((w) =>
				w.id === editingId ? { ...w, title: newTitle, description: newDesc } : w
			)
		);
		setEditingId(null);
		setNewTitle("");
		setNewDesc("");
	};
	// 删除作品
	const handleDelete = (id: number) => {
		setWorks(works.filter((w) => w.id !== id));
	};

	return (
		<div className="window-body" style={{ minHeight: 350 }}>
			<h3>作品列表</h3>
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
								<button className="button" onClick={() => handleEdit(work.id)}>
									编辑
								</button>
								<button
									className="button"
									style={{ marginLeft: 8 }}
									onClick={() => handleDelete(work.id)}
								>
									删除
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div style={{ marginTop: 24 }}>
				<h4>{editingId ? "编辑作品" : "添加新作品"}</h4>
				<div className="field-row" style={{ marginBottom: 8 }}>
  <label htmlFor="work-title" style={{ minWidth: 60 }}>标题</label>
  <input
    id="work-title"
    type="text"
    value={newTitle}
    onChange={e => setNewTitle(e.target.value)}
    style={{ marginRight: 8, flex: 1 }}
  />
  <label htmlFor="work-desc" style={{ minWidth: 60 }}>描述</label>
  <input
    id="work-desc"
    type="text"
    value={newDesc}
    onChange={e => setNewDesc(e.target.value)}
    style={{ marginRight: 8, flex: 2 }}
  />
  {editingId ? (
    <button className="button" onClick={handleSave}>保存</button>
  ) : (
    <button className="button" onClick={handleAdd}>添加</button>
  )}
  {editingId && (
    <button
      className="button"
      style={{ marginLeft: 8 }}
      onClick={() => {
        setEditingId(null);
        setNewTitle("");
        setNewDesc("");
      }}
    >
      取消
    </button>
  )}
</div>
			</div>
		</div>
	);
}
