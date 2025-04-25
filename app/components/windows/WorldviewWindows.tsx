import React, { useState } from "react";
import Window98 from "../Window98";
import "98.css";

interface Worldview {
  id: number;
  title: string;
  content: string;
}

const initialWorldviews: Worldview[] = [];

export default function WorldviewWindows() {
  const [worldviews, setWorldviews] = useState<Worldview[]>(initialWorldviews);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setWorldviews([
      ...worldviews,
      { id: Date.now(), title: newTitle, content: newContent },
    ]);
    setNewTitle("");
    setNewContent("");
  };

  const handleEdit = (id: number) => {
    const worldview = worldviews.find((w) => w.id === id);
    if (worldview) {
      setEditingId(id);
      setNewTitle(worldview.title);
      setNewContent(worldview.content);
    }
  };

  const handleSave = () => {
    setWorldviews(
      worldviews.map((w) =>
        w.id === editingId ? { ...w, title: newTitle, content: newContent } : w
      )
    );
    setEditingId(null);
    setNewTitle("");
    setNewContent("");
  };

  const handleDelete = (id: number) => {
    setWorldviews(worldviews.filter((w) => w.id !== id));
  };

  return (
    <Window98 title="世界观信息管理">
      <div className="window-body">
        <div className="field-row-stacked">
          <label htmlFor="worldview-title">标题</label>
          <input
            id="worldview-title"
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ marginBottom: 8 }}
          />
        </div>
        <div className="field-row-stacked">
          <label htmlFor="worldview-content">内容</label>
          <input
            id="worldview-content"
            type="text"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            style={{ marginBottom: 8 }}
          />
        </div>
        <div className="field-row">
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
                setNewContent("");
              }}
            >
              取消
            </button>
          )}
        </div>
        <ul style={{ marginTop: 16 }}>
          {worldviews.map((w) => (
            <li key={w.id} style={{ marginBottom: 8 }}>
              <b>{w.title}</b>：{w.content}
              <button
                className="button"
                style={{ marginLeft: 8 }}
                onClick={() => handleEdit(w.id)}
              >
                编辑
              </button>
              <button
                className="button"
                style={{ marginLeft: 4 }}
                onClick={() => handleDelete(w.id)}
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
