"use client";
import "98.css";
import React, { useState } from "react";
import Window98 from "./components/Window98";
import ChapterWindows from "./components/windows/ChapterWindows";
import Image from "next/image";
import AboutWindows from "./components/windows/AboutWindows";
import WorkWindows from "./components/windows/WorkWindows";
import EventWindows from "./components/windows/EventWindows";
import CharacterWindows from "./components/windows/CharacterWindows";
import RelationshipWindows from "./components/windows/RelationshipWindows";
import WorldviewWindows from "./components/windows/WorldviewWindows";
import TimelineWindows from "./components/windows/TimelineWindows";

export default function Home() {
	const [openWindows, setOpenWindows] = useState<
		{ type: string; id: number }[]
	>([]);
	const iconConfigs = [
		{ type: "work", label: "作品管理", icon: "/icons/work.png" },
		{ type: "chapter", label: "章节管理", icon: "/icons/chapter.png" },
		{ type: "event", label: "事件管理", icon: "/icons/event.png" },
		{ type: "character", label: "角色管理", icon: "/icons/character.png" },
		{ type: "relation", label: "角色关系", icon: "/icons/relation.png" },
		{ type: "world", label: "世界观信息", icon: "/icons/world.png" },
		{ type: "timeline", label: "时间线", icon: "/icons/timeline.png" },
		{ type: "about", label: "关于", icon: "/icons/about.png" },
	];

	const handleOpen = (type: string) => {
		setOpenWindows((prev) => [
			...prev,
			{ type, id: Date.now() + Math.random() },
		]);
	};
	const handleClose = (id: number) => {
		setOpenWindows((prev) => prev.filter((w) => w.id !== id));
	};

	return (
		<div
			className="desktop"
			style={{ minHeight: "100vh", background: "#008080", padding: 0 }}
		>
			{/* 桌面图标区 */}
			<div style={{ position: "absolute", top: 32, left: 32 }}>
				{iconConfigs.map((icon) => (
					<div style={{ marginBottom: 24 }} key={icon.type}>
						<button
							className="icon"
							style={{
								background: "none",
								border: "none",
								boxShadow: "none",
								cursor: "pointer",
							}}
							onClick={() => handleOpen(icon.type)}
						>
							<Image src={icon.icon} alt={icon.label} width={48} height={48} />
							<div
								style={{
									color: "white",
									fontSize: 14,
									marginTop: 4,
									textShadow: "1px 1px 2px #000",
								}}
							>
								{icon.label}
							</div>
						</button>
					</div>
				))}
			</div>

			{/* 弹窗区 */}
			{openWindows.map((win) => (
				<Window98
					key={win.id}
					title={
						iconConfigs.find((c) => c.type === win.type)?.label || win.type
					}
					iconUrl={iconConfigs.find((c) => c.type === win.type)?.icon}
					onClose={() => handleClose(win.id)}
				>
					{(() => {
						switch (win.type) {
							case "work":
								return <WorkWindows />;
							case "chapter":
								return <ChapterWindows />;
							case "event":
								return <EventWindows />;
							case "character":
								return <CharacterWindows />;
							case "relation":
								return <RelationshipWindows />;
							case "world":
								return <WorldviewWindows />;
							case "timeline":
								return <TimelineWindows />;
							case "about":
								return <AboutWindows />;
							default:
								return <div>未知窗口</div>;
						}
					})()}
				</Window98>
			))}
		</div>
	);
}
