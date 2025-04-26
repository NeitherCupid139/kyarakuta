"use client";
import React, { useState, useRef, useEffect } from "react";
import "98.css";

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
		e.stopPropagation();
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
	};

	// 处理最小化
	const handleMinimize = () => {
		playClickSound();
		setMinimized(true);
	};

	// 处理最大化
	const handleMaximize = () => {
		playClickSound();
		setMaximized((m) => !m);
	};

	// 处理关闭
	const handleClose = () => {
		playClickSound();
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
				},
			},
		];
		return handles.map((h) => (
			<div
				key={h.edge}
				onMouseDown={onResizeMouseDown(h.edge)}
				style={{
					position: "absolute",
					zIndex: 10,
					background: "transparent",
					...h.style,
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
				height: maximized ? "100vh" : minimized ? 36 : size.height,
				zIndex, // 使用zIndex状态
				display: minimized ? "none" : undefined,
				// 在最大化状态下不限制窗口尺寸
				minWidth: maximized ? "unset" : minWidth,
				minHeight: maximized ? "unset" : minHeight,
				maxWidth: maximized ? "none" : maxWidth,
				maxHeight: maximized ? "none" : maxHeight,
				boxSizing: "border-box",
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
				<div className="window-body">{children}</div>
			)}
			{maximized && !minimized && (
				<div
					className="window-body"
					style={{ height: "calc(100vh - 36px)", overflow: "auto" }}
				>
					{children}
				</div>
			)}
			{/* 八向缩放拖拽点 */}
			{renderResizeHandles()}
		</div>
	);
}
