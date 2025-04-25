import React, { useState } from "react";

import "98.css";

interface Character {
	id: number;
	name: string;
	description: string;
}

const initialCharacters: Character[] = [];

export default function CharacterWindows() {
	const [characters, setCharacters] = useState<Character[]>(initialCharacters);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newName, setNewName] = useState("");
	const [newDesc, setNewDesc] = useState("");

	const handleAdd = () => {
		if (!newName.trim()) return;
		setCharacters([
			...characters,
			{ id: Date.now(), name: newName, description: newDesc },
		]);
		setNewName("");
		setNewDesc("");
	};

	const handleEdit = (id: number) => {
		const character = characters.find((c) => c.id === id);
		if (character) {
			setEditingId(id);
			setNewName(character.name);
			setNewDesc(character.description);
		}
	};

	const handleSave = () => {
		setCharacters(
			characters.map((c) =>
				c.id === editingId ? { ...c, name: newName, description: newDesc } : c
			)
		);
		setEditingId(null);
		setNewName("");
		setNewDesc("");
	};

	const handleDelete = (id: number) => {
		setCharacters(characters.filter((c) => c.id !== id));
	};

	return (
		<div className="window-body">
			<div className="field-row-stacked">
				<label htmlFor="character-name">角色名</label>
				<input
					id="character-name"
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row-stacked">
				<label htmlFor="character-desc">描述</label>
				<input
					id="character-desc"
					type="text"
					value={newDesc}
					onChange={(e) => setNewDesc(e.target.value)}
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
							setNewName("");
							setNewDesc("");
						}}
					>
						取消
					</button>
				)}
			</div>
			<ul style={{ marginTop: 16 }}>
				{characters.map((c) => (
					<li key={c.id} style={{ marginBottom: 8 }}>
						<b>{c.name}</b>：{c.description}
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
