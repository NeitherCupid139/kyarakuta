"use client";
import React, { useState, useRef, useEffect } from "react";
import "98.css";
import { useProcessStore } from "../store/processStore";

interface Window98Props {
	title: string;
	children: React.ReactNode;
	iconUrl?: string;
	initialPosition?: { top: number; left: number };
	initialSize?: { width: number; height: number };
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onClose?: () => void;
	windowType?: string; // 窗口类型，用于匹配任务栏进程
}

// 为所有窗口设置一个全局计数器，用于管理z-index
let globalZIndexCounter = 1000;

export default function Window98({
	title,
	children,
	iconUrl,
	initialPosition = { top: 100, left: 100 },
	initialSize = { width: 500, height: 300 },
	minWidth = 300,
	minHeight = 300,
	maxWidth = 1200,
	maxHeight = 900,
	onClose,
	windowType,
}: Window98Props) {
	const [minimized, setMinimized] = useState(false);
	const [maximized, setMaximized] = useState(false);
	const [position, setPosition] = useState(initialPosition);
	const [size, setSize] = useState(initialSize);
	const [dragging, setDragging] = useState(false);
	const [resizing, setResizing] = useState<null | {
		edge: string;
		startX: number;
		startY: number;
		startW: number;
		startH: number;
		startL: number;
		startT: number;
	}>(null);
	const dragOffset = useRef({ x: 0, y: 0 });
	// 添加zIndex状态
	const [zIndex, setZIndex] = useState(globalZIndexCounter);
	// 添加音频引用
	const clickSoundRef = useRef<HTMLAudioElement | null>(null);
	// 使用进程管理store
	const { updateProcessState } = useProcessStore();

	// 调试信息：窗口初始化
	useEffect(() => {
		console.log(`窗口初始化: title=${title}, type=${windowType}`);
	}, [title, windowType]);

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

	// 从任务栏恢复窗口的事件监听
	useEffect(() => {
		// 监听restoreWindow事件
		const handleRestoreWindow = (e: Event) => {
			try {
				const event = e as CustomEvent;
				const { windowName, windowType: eventWindowType } = event.detail;

				console.log("收到恢复窗口事件:", {
					windowName,
					eventWindowType,
					currentTitle: title,
					currentType: windowType,
					isMinimized: minimized,
				});

				// 通过名称或类型匹配窗口
				const isMatchedWindow =
					windowName === title ||
					(windowType && eventWindowType && windowType === eventWindowType);

				console.log("窗口匹配结果:", isMatchedWindow);

				// 如果当前窗口是事件目标窗口且处于最小化状态，则恢复窗口
				if (isMatchedWindow && minimized) {
					console.log("正在恢复窗口:", title, windowType);
					setMinimized(false);
					bringToFront();
					playClickSound();
				}
			} catch (error) {
				console.error("恢复窗口事件处理错误:", error);
			}
		};

		// 监听bringToFront事件
		const handleBringToFront = (e: Event) => {
			try {
				const event = e as CustomEvent;
				const { windowName, windowType: eventWindowType } = event.detail;

				console.log("收到窗口置前事件:", {
					windowName,
					eventWindowType,
					currentTitle: title,
					currentType: windowType,
				});

				// 通过名称或类型匹配窗口
				const isMatchedWindow =
					windowName === title ||
					(windowType && eventWindowType && windowType === eventWindowType);

				console.log("窗口匹配结果:", isMatchedWindow);

				// 如果当前窗口是事件目标窗口，则置前
				if (isMatchedWindow) {
					console.log("正在置前窗口:", title, windowType);
					bringToFront();
					playClickSound();
				}
			} catch (error) {
				console.error("窗口置前事件处理错误:", error);
			}
		};

		// 添加调试日志
		console.log(
			`设置窗口事件监听: title=${title}, type=${windowType}, minimized=${minimized}`
		);

		// 添加事件监听
		window.addEventListener("restoreWindow", handleRestoreWindow);
		window.addEventListener("bringToFront", handleBringToFront);

		// 清理函数
		return () => {
			console.log(`移除窗口事件监听: title=${title}, type=${windowType}`);
			window.removeEventListener("restoreWindow", handleRestoreWindow);
			window.removeEventListener("bringToFront", handleBringToFront);
		};
	}, [title, minimized, windowType]);

	// 处理窗口置顶
	const bringToFront = () => {
		globalZIndexCounter += 1;
		setZIndex(globalZIndexCounter);
	};

	// 拖动窗口
	const onMouseDown = (e: React.MouseEvent) => {
		// 点击标题栏时提升z-index
		bringToFront();

		setDragging(true);
		dragOffset.current = {
			x: e.clientX - position.left,
			y: e.clientY - position.top,
		};
		document.body.style.userSelect = "none";
	};
	const onMouseMove = (e: MouseEvent) => {
		if (dragging) {
			const winW = size.width;
			const winH = size.height;
			const minLeft = 0;
			const minTop = 0;
			const maxLeft = window.innerWidth - winW;
			const maxTop = window.innerHeight - winH;
			let left = e.clientX - dragOffset.current.x;
			let top = e.clientY - dragOffset.current.y;
			left = Math.max(minLeft, Math.min(left, maxLeft));
			top = Math.max(minTop, Math.min(top, maxTop));
			setPosition({ left, top });
		}
	};
	const onMouseUp = () => {
		setDragging(false);
		document.body.style.userSelect = "";
	};
	// 拖拽调整大小，支持四边和四角
	const onResizeMouseDown = (edge: string) => (e: React.MouseEvent) => {
		// 播放点击音效
		playClickSound();

		setResizing({
			edge,
			startX: e.clientX,
			startY: e.clientY,
			startW: size.width,
			startH: size.height,
			startL: position.left,
			startT: position.top,
		});
		document.body.style.userSelect = "none";
	};
	const onResizeMouseMove = (e: MouseEvent) => {
		if (!resizing) return;
		const { edge, startX, startY, startW, startH, startL, startT } = resizing;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		let newW = startW;
		let newH = startH;
		let newL = startL;
		let newT = startT;
		const desktopW = window.innerWidth;
		const desktopH = window.innerHeight;
		// 右侧(e)
		if (edge === "e" || edge === "ne" || edge === "se")
			newW = Math.min(maxWidth, Math.max(minWidth, startW + dx));
		// 左侧(w)
		if (edge === "w" || edge === "nw" || edge === "sw") {
			newW = Math.min(maxWidth, Math.max(minWidth, startW - dx));
			newL = startL + (startW - newW);
		}
		// 下侧(s)
		if (edge === "s" || edge === "se" || edge === "sw")
			newH = Math.min(maxHeight, Math.max(minHeight, startH + dy));
		// 上侧(n)
		if (edge === "n" || edge === "ne" || edge === "nw") {
			newH = Math.min(maxHeight, Math.max(minHeight, startH - dy));
		}
		// 边界检测
		if (newL < 0) {
			newW += newL; // 减少宽度
			newL = 0;
		}
		if (newT < 0) {
			newH += newT;
			newT = 0;
		}
		if (newL + newW > desktopW) {
			newW = desktopW - newL;
		}
		if (newT + newH > desktopH) {
			newH = desktopH - newT;
		}
		newW = Math.max(minWidth, Math.min(maxWidth, newW));
		newH = Math.max(minHeight, Math.min(maxHeight, newH));
		setSize({ width: newW, height: newH });
		setPosition({ left: newL, top: newT });
	};
	const onResizeMouseUp = () => {
		setResizing(null);
		document.body.style.userSelect = "";
	};
	React.useEffect(() => {
		if (dragging) {
			window.addEventListener("mousemove", onMouseMove);
			window.addEventListener("mouseup", onMouseUp);
		} else {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
		// eslint-disable-next-line
	}, [dragging]);

	React.useEffect(() => {
		if (resizing) {
			window.addEventListener("mousemove", onResizeMouseMove);
			window.addEventListener("mouseup", onResizeMouseUp);
		} else {
			window.removeEventListener("mousemove", onResizeMouseMove);
			window.removeEventListener("mouseup", onResizeMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", onResizeMouseMove);
			window.removeEventListener("mouseup", onResizeMouseUp);
		};
	}, [resizing]);

	// 窗口点击时提升z-index
	const handleWindowClick = () => {
		bringToFront();
		// 更新进程状态为活动
		updateProcessState(title, "normal");
	};

	// 处理最小化
	const handleMinimize = () => {
		console.log("窗口最小化:", title, windowType);
		playClickSound();
		setMinimized(true);
		// 更新进程状态为最小化
		updateProcessState(title, "minimize");
	};

	// 处理最大化
	const handleMaximize = () => {
		console.log("窗口最大化/恢复:", title, windowType, !maximized);
		playClickSound();
		setMaximized((m) => !m);
		// 更新进程状态
		updateProcessState(title, maximized ? "normal" : "maximize");
	};

	// 处理关闭
	const handleClose = () => {
		console.log("窗口关闭:", title, windowType);
		playClickSound();
		// 更新进程状态为关闭
		updateProcessState(title, "close");
		if (onClose) onClose();
	};

	// 渲染八个拖拽点
	const renderResizeHandles = () => {
		if (maximized || minimized) return null;
		const handles = [
			{
				edge: "n",
				style: {
					top: -4,
					left: "50%",
					marginLeft: -8,
					cursor: "ns-resize",
					width: 16,
					height: 8,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "s",
				style: {
					bottom: -4,
					left: "50%",
					marginLeft: -8,
					cursor: "ns-resize",
					width: 16,
					height: 8,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "e",
				style: {
					right: -4,
					top: "50%",
					marginTop: -8,
					cursor: "ew-resize",
					width: 8,
					height: 16,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "w",
				style: {
					left: -4,
					top: "50%",
					marginTop: -8,
					cursor: "ew-resize",
					width: 8,
					height: 16,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "ne",
				style: {
					right: -4,
					top: -4,
					cursor: "nesw-resize",
					width: 12,
					height: 12,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "nw",
				style: {
					left: -4,
					top: -4,
					cursor: "nwse-resize",
					width: 12,
					height: 12,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "se",
				style: {
					right: -4,
					bottom: -4,
					cursor: "nwse-resize",
					width: 12,
					height: 12,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
			{
				edge: "sw",
				style: {
					left: -4,
					bottom: -4,
					cursor: "nesw-resize",
					width: 12,
					height: 12,
					backgroundColor: "rgba(0, 0, 0, 0.1)",
					borderRadius: "4px",
				},
			},
		];
		return handles.map((h) => (
			<div
				key={h.edge}
				onMouseDown={onResizeMouseDown(h.edge)}
				className="resize-handle"
				style={{
					position: "absolute",
					zIndex: 10,
					...h.style,
					transition: "background-color 0.2s",
				}}
			/>
		));
	};

	return (
		<div
			className="window overflow-hidden"
			style={{
				position: "absolute",
				left: maximized ? 0 : position.left,
				top: maximized ? 0 : position.top,
				width: maximized ? "100%" : size.width,
				height: maximized ? "100vh" : size.height,
				zIndex, // 使用zIndex状态
				display: minimized ? "none" : undefined,
				// 在最大化状态下不限制窗口尺寸
				minWidth: maximized ? "unset" : minWidth,
				minHeight: maximized ? "unset" : minHeight,
				maxWidth: maximized ? "none" : maxWidth,
				maxHeight: maximized ? "none" : maxHeight,
				boxSizing: "border-box",
				// 添加边框，使窗口边界更加明显
				border: "1px solid #000080",
				// 添加阴影效果，增强立体感
				boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
			}}
			onClick={handleWindowClick}
		>
			<div
				className="title-bar"
				style={{ cursor: "move" }}
				onMouseDown={onMouseDown}
			>
				<div
					className="title-bar-text"
					style={{ display: "flex", alignItems: "center", gap: 6 }}
				>
					{iconUrl && (
						<img
							src={iconUrl}
							alt="window icon"
							style={{
								width: 16,
								height: 16,
								marginRight: 4,
								display: "inline-block",
							}}
						/>
					)}
					{title}
				</div>
				<div className="title-bar-controls">
					<button aria-label="Minimize" onClick={handleMinimize}></button>
					<button aria-label="Maximize" onClick={handleMaximize}></button>
					<button aria-label="Close" onClick={handleClose}></button>
				</div>
			</div>
			{!minimized && !maximized && (
				<div
					className="window-body"
					style={{
						height: `calc(${size.height}px - 36px)`,
						overflow: "auto",
						display: "flex",
						flexDirection: "column",
						padding: 0,
					}}
				>
					<div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
						{children}
					</div>
				</div>
			)}
			{maximized && !minimized && (
				<div
					className="window-body"
					style={{
						height: "calc(100vh - 36px)",
						overflow: "auto",
						display: "flex",
						flexDirection: "column",
						padding: 0,
					}}
				>
					<div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
						{children}
					</div>
				</div>
			)}
			{/* 八向缩放拖拽点 */}
			{renderResizeHandles()}

			{/* 右下角调整大小指示器 */}
			{!maximized && !minimized && (
				<div
					style={{
						position: "absolute",
						bottom: 2,
						right: 2,
						width: 12,
						height: 12,
						backgroundImage:
							'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path d="M0 12L12 12L12 0" stroke="%23000080" stroke-width="1" fill="none"/></svg>\')',
						backgroundRepeat: "no-repeat",
						backgroundSize: "contain",
						pointerEvents: "none",
					}}
				/>
			)}
		</div>
	);
}
