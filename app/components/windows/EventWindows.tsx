import React, { useState } from "react";

import "98.css";

interface EventItem {
	id: number;
	name: string;
	description: string;
}

const initialEvents: EventItem[] = [];

export default function EventWindows() {
	const [events, setEvents] = useState<EventItem[]>(initialEvents);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newName, setNewName] = useState("");
	const [newDesc, setNewDesc] = useState("");

	const handleAdd = () => {
		if (!newName.trim()) return;
		setEvents([
			...events,
			{ id: Date.now(), name: newName, description: newDesc },
		]);
		setNewName("");
		setNewDesc("");
	};

	const handleEdit = (id: number) => {
		const event = events.find((e) => e.id === id);
		if (event) {
			setEditingId(id);
			setNewName(event.name);
			setNewDesc(event.description);
		}
	};

	const handleSave = () => {
		setEvents(
			events.map((e) =>
				e.id === editingId ? { ...e, name: newName, description: newDesc } : e
			)
		);
		setEditingId(null);
		setNewName("");
		setNewDesc("");
	};

	const handleDelete = (id: number) => {
		setEvents(events.filter((e) => e.id !== id));
	};

	return (
		<div className="window-body">
			<div className="field-row-stacked">
				<label htmlFor="event-name">事件名</label>
				<input
					id="event-name"
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row-stacked">
				<label htmlFor="event-desc">描述</label>
				<input
					id="event-desc"
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
				{events.map((e) => (
					<li key={e.id} style={{ marginBottom: 8 }}>
						<b>{e.name}</b>：{e.description}
						<button
							className="button"
							style={{ marginLeft: 8 }}
							onClick={() => handleEdit(e.id)}
						>
							编辑
						</button>
						<button
							className="button"
							style={{ marginLeft: 4 }}
							onClick={() => handleDelete(e.id)}
						>
							删除
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
