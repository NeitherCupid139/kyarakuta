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
import CustomAttributesWindow from "./components/windows/CustomAttributesWindow";
import CharacterChatWindow from "./components/ai/CharacterChatWindow";
import ChapterConsistencyAnalyzer from "./components/ai/ChapterConsistencyAnalyzer";
import SplashScreen from "./components/SplashScreen";
import { useSplashStore } from "./lib/splashStore";
import Wallpaper from "./components/windows/Wallpaper";
import MusicWindows from "./components/windows/MusicWindows";
import MapWindows from "./components/windows/MapWindows";
import CameraWindows from "./components/windows/CameraWindows";
import AlbumWindows from "./components/windows/AlbumWindows";
import FacetimeWindows from "./components/windows/FacetimeWindows";
import Navbar from "./components/Navbar";
import { useProcessStore } from "./store/process";
import ModalWindows from "./components/windows/ModalWindows";

export default function Home() {
	// 使用Zustand store
	const { isShowingSplash } = useSplashStore();
	const { addProcess, removeProcess, updateProcessState } = useProcessStore();

	// 定义窗口数据类型
	type WindowData = {
		character?: {
			id: number;
			name: string;
			description: string;
			traits: string;
			background: string;
		};
		chapter?: {
			id: number;
			title: string;
			content: string;
		};
	};

	const [openWindows, setOpenWindows] = useState<
		{ type: string; id: number; data?: WindowData }[]
	>([]);

	const iconConfigs = [
		{ type: "work", label: "作品管理", icon: "/icons/work.png" },
		{ type: "chapter", label: "章节管理", icon: "/icons/chapter.png" },
		{ type: "event", label: "事件管理", icon: "/icons/event.png" },
		{ type: "character", label: "角色管理", icon: "/icons/character.png" },
		{ type: "relation", label: "角色关系", icon: "/icons/relation.png" },
		{ type: "world", label: "世界观信息", icon: "/icons/world.png" },
		{ type: "timeline", label: "时间线", icon: "/icons/timeline.png" },
		{ type: "custom", label: "自定义属性", icon: "/icons/custom.png" },
		{ type: "character-chat", label: "角色对话", icon: "/icons/chat.png" },
		{ type: "chapter-analysis", label: "章节分析", icon: "/icons/analyze.png" },
		{ type: "about", label: "关于", icon: "/icons/about.png" },
		{ type: "wallpaper", label: "壁纸", icon: "/icons/wallpaper.png" },
		{ type: "music", label: "音乐", icon: "/icons/music.png" },
		{ type: "map", label: "地图", icon: "/icons/map.png" },
		{ type: "camera", label: "相机", icon: "/icons/camera.png" },
		{ type: "album", label: "相册", icon: "/icons/album.png" },
		{ type: "facetime", label: "视频通话", icon: "/icons/phone.png" },
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

	// 处理窗口事件
	useEffect(() => {
		console.log("设置页面级窗口事件监听器");

		// 处理恢复窗口事件
		const handleRestoreWindow = (e: Event) => {
			try {
				const event = e as CustomEvent;
				const { windowName, windowType } = event.detail;

				console.log("页面接收到恢复窗口事件:", { windowName, windowType });

				// 找到对应的窗口，将其置顶
				setOpenWindows((prev) => {
					// 通过type查找窗口
					const matchedByType = windowType
						? prev.find((w) => w.type === windowType)
						: null;

					// 通过名称查找窗口
					const matchedByName = prev.find((w) => {
						const iconConfig = iconConfigs.find((c) => c.type === w.type);
						return iconConfig?.label === windowName;
					});

					const targetWindow = matchedByType || matchedByName;

					console.log("找到窗口匹配结果:", {
						matchedByType: !!matchedByType,
						matchedByName: !!matchedByName,
						targetWindow: targetWindow?.type,
					});

					if (targetWindow) {
						// 过滤掉目标窗口
						const filtered = prev.filter((w) => w.id !== targetWindow.id);
						// 更新进程状态为normal
						const iconConfig = iconConfigs.find(
							(c) => c.type === targetWindow.type
						);
						if (iconConfig) {
							updateProcessState(iconConfig.label, "normal");
							console.log("更新进程状态:", iconConfig.label, "normal");
						}
						console.log("将窗口移到顶层:", targetWindow.type);
						// 返回新数组，将目标窗口放在最后（即顶层）
						return [...filtered, targetWindow];
					}
					console.warn("未找到匹配窗口", { windowName, windowType });
					return prev;
				});
			} catch (error) {
				console.error("处理恢复窗口事件错误:", error);
			}
		};

		// 处理窗口置前事件
		const handleBringToFront = (e: Event) => {
			try {
				const event = e as CustomEvent;
				const { windowName, windowType } = event.detail;

				console.log("页面接收到窗口置前事件:", { windowName, windowType });

				// 找到对应的窗口，将其置顶
				setOpenWindows((prev) => {
					// 通过type查找窗口
					const matchedByType = windowType
						? prev.find((w) => w.type === windowType)
						: null;

					// 通过名称查找窗口
					const matchedByName = prev.find((w) => {
						const iconConfig = iconConfigs.find((c) => c.type === w.type);
						return iconConfig?.label === windowName;
					});

					const targetWindow = matchedByType || matchedByName;

					console.log("找到窗口匹配结果:", {
						matchedByType: !!matchedByType,
						matchedByName: !!matchedByName,
						targetWindow: targetWindow?.type,
					});

					if (targetWindow) {
						// 过滤掉目标窗口
						const filtered = prev.filter((w) => w.id !== targetWindow.id);
						// 更新进程状态为normal
						const iconConfig = iconConfigs.find(
							(c) => c.type === targetWindow.type
						);
						if (iconConfig) {
							updateProcessState(iconConfig.label, "normal");
							console.log("更新进程状态:", iconConfig.label, "normal");
						}
						console.log("将窗口移到顶层:", targetWindow.type);
						// 返回新数组，将目标窗口放在最后（即顶层）
						return [...filtered, targetWindow];
					}
					console.warn("未找到匹配窗口", { windowName, windowType });
					return prev;
				});
			} catch (error) {
				console.error("处理窗口置前事件错误:", error);
			}
		};

		// 添加事件监听
		window.addEventListener("restoreWindow", handleRestoreWindow);
		window.addEventListener("bringToFront", handleBringToFront);

		// 组件卸载时移除事件监听
		return () => {
			console.log("移除页面级窗口事件监听器");
			window.removeEventListener("restoreWindow", handleRestoreWindow);
			window.removeEventListener("bringToFront", handleBringToFront);
		};
	}, [iconConfigs, updateProcessState]);

	// 修改打开窗口逻辑，确保每种类型只能打开一个
	const handleOpen = (type: string, data?: WindowData) => {
		// 检查该类型窗口是否已打开
		const isAlreadyOpen = openWindows.some((window) => window.type === type);
		playClickSound();

		// 获取图标配置
		const iconConfig = iconConfigs.find((config) => config.type === type);

		// 如果没有打开，则添加新窗口
		if (!isAlreadyOpen) {
			const newWindow = { type, id: Date.now() + Math.random(), data };
			setOpenWindows((prev) => [...prev, newWindow]);
			// 添加到进程列表
			if (iconConfig) {
				addProcess({
					name: iconConfig.label,
					icon: iconConfig.icon,
					state: "normal",
					// 添加type属性，用于关联窗口类型
					type: type,
				});
			}
		} else {
			// 如果已打开，可以将该窗口置顶（通过移除再添加实现）
			setOpenWindows((prev) => {
				const filtered = prev.filter((w) => w.type !== type);
				const targetWindow = prev.find((w) => w.type === type);
				if (targetWindow) {
					// 更新进程状态为活动
					if (iconConfig) {
						updateProcessState(iconConfig.label, "normal");
					}
					return [...filtered, targetWindow];
				}
				return prev;
			});
		}
	};

	const handleClose = (id: number) => {
		// 获取要关闭的窗口
		const windowToClose = openWindows.find((w) => w.id === id);
		if (windowToClose) {
			// 从进程列表中移除
			const iconConfig = iconConfigs.find((c) => c.type === windowToClose.type);
			if (iconConfig) {
				removeProcess(iconConfig.label);
			}
			// 从窗口列表中移除
			setOpenWindows((prev) => prev.filter((w) => w.id !== id));
		}
	};

	// 如果正在显示开机动画，则渲染开机动画组件
	if (isShowingSplash) {
		return <SplashScreen />;
	}

	// 模拟数据，实际项目应该从数据库获取
	const mockCharacter = {
		id: 1,
		name: "示例角色",
		description: "这是一个示例角色，用于测试角色对话功能。",
		traits: "友善、乐观、幽默",
		background: "来自一个遥远的国度，喜欢探险和结交朋友。",
	};

	const mockChapter = {
		id: 1,
		title: "示例章节",
		content: "这是一个示例章节内容，可以在这里输入您要分析的章节文本。",
	};

	return (
		<div
			className="desktop min-h-screen min-w-screen relative"
			style={{ background: "#008080", padding: 0 }}
		>
			{/* 添加 ModalWindows 组件 */}
			<ModalWindows />

			{/* 桌面图标区 */}
			{/* 自动换列 */}
			<div
				className="grid grid-cols-3 h-full"
				style={{ position: "absolute", top: 32, left: 32 }}
			>
				{iconConfigs.map((icon) => (
					<div style={{ marginBottom: 24 }} key={icon.type}>
						<button
							className="icon"
							style={{
								background: "none",
								border: "1px solid transparent",
								boxShadow: "none",
								cursor: "pointer",
								padding: "4px 8px",
							}}
							onMouseDown={(e) => {
								e.currentTarget.style.border = "1px dotted white";
							}}
							onMouseUp={(e) => {
								e.currentTarget.style.border = "1px solid transparent";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.border = "1px solid transparent";
							}}
							onDoubleClick={() => {
								// 根据类型传递不同的数据
								if (icon.type === "character-chat") {
									handleOpen(icon.type, { character: mockCharacter });
								} else if (icon.type === "chapter-analysis") {
									handleOpen(icon.type, { chapter: mockChapter });
								} else {
									handleOpen(icon.type);
								}
							}}
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
			{openWindows.map((win) => {
				// 获取当前窗口索引，用于zIndex计算
				const windowIndex = openWindows.findIndex((w) => w.id === win.id);
				const zIndex = 1000 + windowIndex;

				// 处理置顶方法
				const handleBringToFront = () => {
					setOpenWindows((prev) => {
						const filtered = prev.filter((w) => w.id !== win.id);
						return [...filtered, prev.find((w) => w.id === win.id)!];
					});
					// 更新进程状态为活动
					const iconConfig = iconConfigs.find((c) => c.type === win.type);
					if (iconConfig) {
						updateProcessState(iconConfig.label, "normal");
					}
				};

				// 根据窗口类型渲染不同组件
				const renderWindowContent = () => {
					switch (win.type) {
						case "custom":
							return (
								<CustomAttributesWindow
									onClose={() => handleClose(win.id)}
									zIndex={zIndex}
									onBringToFront={handleBringToFront}
								/>
							);
						case "character-chat":
							return (
								<CharacterChatWindow
									onClose={() => handleClose(win.id)}
									character={win.data?.character || mockCharacter}
								/>
							);
						case "chapter-analysis":
							return (
								<ChapterConsistencyAnalyzer
									onClose={() => handleClose(win.id)}
									chapterId={win.data?.chapter?.id}
									chapterTitle={win.data?.chapter?.title}
									chapterContent={win.data?.chapter?.content}
								/>
							);
						default:
							return (
								<Window98
									initialPosition={randomPosition()}
									title={
										iconConfigs.find((c) => c.type === win.type)?.label ||
										win.type
									}
									iconUrl={iconConfigs.find((c) => c.type === win.type)?.icon}
									onClose={() => handleClose(win.id)}
									windowType={win.type}
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
											case "wallpaper":
												return <Wallpaper />;
											case "music":
												return <MusicWindows />;
											case "map":
												return <MapWindows />;
											case "camera":
												return <CameraWindows />;
											case "album":
												return <AlbumWindows />;
											case "facetime":
												return <FacetimeWindows />;
											default:
												return <div>未知窗口</div>;
										}
									})()}
								</Window98>
							);
					}
				};

				return (
					<React.Fragment key={win.id}>{renderWindowContent()}</React.Fragment>
				);
			})}

			{/* Navbar组件 */}
			<Navbar />
		</div>
	);
}
