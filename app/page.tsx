"use client";
import "98.css";
import React, { useEffect, useRef, useState } from "react";
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
import SplashScreen from "./components/SplashScreen";
import { useSplashStore } from "./lib/splashStore";

export default function Home() {
	// 使用Zustand store
	const { isShowingSplash, resetSplashState } = useSplashStore();

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
	const randomPosition = () => {
		return {
			top: Math.random() * 300,
			left: Math.random() * 300,
		};
	};

	// 添加音频引用
	const clickSoundRef = useRef<HTMLAudioElement | null>(null);

	// 初始化音频
	useEffect(() => {
		clickSoundRef.current = new Audio("/audio/mouse-click.mp3");
	}, []);

	// 播放点击音效
	const playClickSound = () => {
		if (clickSoundRef.current) {
			clickSoundRef.current.currentTime = 0;
			clickSoundRef.current
				.play()
				.catch((err) => console.error("音频播放失败:", err));
		}
	};

	// 修改打开窗口逻辑，确保每种类型只能打开一个
	const handleOpen = (type: string) => {
		// 检查该类型窗口是否已打开
		const isAlreadyOpen = openWindows.some((window) => window.type === type);
		playClickSound();

		// 如果没有打开，则添加新窗口
		if (!isAlreadyOpen) {
			setOpenWindows((prev) => [
				...prev,
				{ type, id: Date.now() + Math.random() },
			]);
		} else {
			// 如果已打开，可以将该窗口置顶（通过移除再添加实现）
			setOpenWindows((prev) => {
				const filtered = prev.filter((w) => w.type !== type);
				const targetWindow = prev.find((w) => w.type === type);
				if (targetWindow) {
					return [...filtered, targetWindow];
				}
				return prev;
			});
		}
	};

	const handleClose = (id: number) => {
		setOpenWindows((prev) => prev.filter((w) => w.id !== id));
	};

	// 处理重置开机动画
	const handleResetSplash = () => {
		resetSplashState();
		// 刷新页面以触发开机动画
		window.location.reload();
	};

	// 如果正在显示开机动画，则渲染开机动画组件
	if (isShowingSplash) {
		return <SplashScreen />;
	}

	return (
		<div
			className="desktop min-h-screen min-w-screen"
			style={{ background: "#008080", padding: 0 }}
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
							onDoubleClick={() => handleOpen(icon.type)}
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

				{/* 添加重置开机动画按钮 */}
				<div style={{ marginBottom: 24, marginTop: 40 }}>
					<button
						className="icon"
						style={{
							background: "none",
							border: "none",
							boxShadow: "none",
							cursor: "pointer",
						}}
						onDoubleClick={handleResetSplash}
					>
						<Image src="/icons/startup.png" alt="重启" width={48} height={48} />
						<div
							style={{
								color: "white",
								fontSize: 14,
								marginTop: 4,
								textShadow: "1px 1px 2px #000",
							}}
						>
							重新开机
						</div>
					</button>
				</div>
			</div>

			{/* 弹窗区 */}
			{openWindows.map((win) => (
				<Window98
					initialPosition={randomPosition()}
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
