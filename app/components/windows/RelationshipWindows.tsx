import React, { useState } from "react";
import Window98 from "../Window98";
import "98.css";

interface Relationship {
	id: number;
	from: string;
	to: string;
	type: string;
	description: string;
}

const initialRelationships: Relationship[] = [];

export default function RelationshipWindows() {
	const [relationships, setRelationships] =
		useState<Relationship[]>(initialRelationships);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [type, setType] = useState("");
	const [desc, setDesc] = useState("");

	const handleAdd = () => {
		if (!from.trim() || !to.trim() || !type.trim()) return;
		setRelationships([
			...relationships,
			{ id: Date.now(), from, to, type, description: desc },
		]);
		setFrom("");
		setTo("");
		setType("");
		setDesc("");
	};

	const handleEdit = (id: number) => {
		const rel = relationships.find((r) => r.id === id);
		if (rel) {
			setEditingId(id);
			setFrom(rel.from);
			setTo(rel.to);
			setType(rel.type);
			setDesc(rel.description);
		}
	};

	const handleSave = () => {
		setRelationships(
			relationships.map((r) =>
				r.id === editingId ? { ...r, from, to, type, description: desc } : r
			)
		);
		setEditingId(null);
		setFrom("");
		setTo("");
		setType("");
		setDesc("");
	};

	const handleDelete = (id: number) => {
		setRelationships(relationships.filter((r) => r.id !== id));
	};

	return (
		<Window98 title="角色关系管理">
			<div className="window-body">
				<div className="field-row-stacked">
					<label htmlFor="from">角色A</label>
					<input
						id="from"
						type="text"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						style={{ marginBottom: 8 }}
					/>
				</div>
				<div className="field-row-stacked">
					<label htmlFor="to">角色B</label>
					<input
						id="to"
						type="text"
						value={to}
						onChange={(e) => setTo(e.target.value)}
						style={{ marginBottom: 8 }}
					/>
				</div>
				<div className="field-row-stacked">
					<label htmlFor="type">关系类型</label>
					<input
						id="type"
						type="text"
						value={type}
						onChange={(e) => setType(e.target.value)}
						style={{ marginBottom: 8 }}
					/>
				</div>
				<div className="field-row-stacked">
					<label htmlFor="desc">描述</label>
					<input
						id="desc"
						type="text"
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
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
								setFrom("");
								setTo("");
								setType("");
								setDesc("");
							}}
						>
							取消
						</button>
					)}
				</div>
				<ul style={{ marginTop: 16 }}>
					{relationships.map((r) => (
						<li key={r.id} style={{ marginBottom: 8 }}>
							<b>{r.from}</b> -[{r.type}] <b>{r.to}</b>：{r.description}
							<button
								className="button"
								style={{ marginLeft: 8 }}
								onClick={() => handleEdit(r.id)}
							>
								编辑
							</button>
							<button
								className="button"
								style={{ marginLeft: 4 }}
								onClick={() => handleDelete(r.id)}
							>
								删除
							</button>
						</li>
					))}
				</ul>
			</div>
		</Window98>
	);
}
