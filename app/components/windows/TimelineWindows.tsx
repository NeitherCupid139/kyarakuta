import React, { useState } from "react";

import "98.css";

interface TimelineItem {
	id: number;
	time: string;
	event: string;
	description: string;
}

const initialTimeline: TimelineItem[] = [];

export default function TimelineWindows() {
	const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newTime, setNewTime] = useState("");
	const [newEvent, setNewEvent] = useState("");
	const [newDesc, setNewDesc] = useState("");

	const handleAdd = () => {
		if (!newTime.trim() || !newEvent.trim()) return;
		setTimeline([
			...timeline,
			{ id: Date.now(), time: newTime, event: newEvent, description: newDesc },
		]);
		setNewTime("");
		setNewEvent("");
		setNewDesc("");
	};

	const handleEdit = (id: number) => {
		const item = timeline.find((t) => t.id === id);
		if (item) {
			setEditingId(id);
			setNewTime(item.time);
			setNewEvent(item.event);
			setNewDesc(item.description);
		}
	};

	const handleSave = () => {
		setTimeline(
			timeline.map((t) =>
				t.id === editingId
					? { ...t, time: newTime, event: newEvent, description: newDesc }
					: t
			)
		);
		setEditingId(null);
		setNewTime("");
		setNewEvent("");
		setNewDesc("");
	};

	const handleDelete = (id: number) => {
		setTimeline(timeline.filter((t) => t.id !== id));
	};

	return (
		<div className="window-body">
			<div className="field-row-stacked">
				<label htmlFor="timeline-time">时间点</label>
				<input
					id="timeline-time"
					type="text"
					value={newTime}
					onChange={(e) => setNewTime(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row-stacked">
				<label htmlFor="timeline-event">事件</label>
				<input
					id="timeline-event"
					type="text"
					value={newEvent}
					onChange={(e) => setNewEvent(e.target.value)}
					style={{ marginBottom: 8 }}
				/>
			</div>
			<div className="field-row-stacked">
				<label htmlFor="timeline-desc">描述</label>
				<input
					id="timeline-desc"
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
							setNewTime("");
							setNewEvent("");
							setNewDesc("");
						}}
					>
						取消
					</button>
				)}
			</div>
			<ul style={{ marginTop: 16 }}>
				{timeline.map((t) => (
					<li key={t.id} style={{ marginBottom: 8 }}>
						<b>{t.time}</b>：{t.event} - {t.description}
						<button
							className="button"
							style={{ marginLeft: 8 }}
							onClick={() => handleEdit(t.id)}
						>
							编辑
						</button>
						<button
							className="button"
							style={{ marginLeft: 4 }}
							onClick={() => handleDelete(t.id)}
						>
							删除
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
