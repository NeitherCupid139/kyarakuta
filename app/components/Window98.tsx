"use client";
import React, { useState, useRef } from "react";
import "98.css";

interface Window98Props {
	title: string;
	children: React.ReactNode;
	initialPosition?: { top: number; left: number };
	initialSize?: { width: number; height: number };
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onClose?: () => void;
}

export default function Window98({
	title,
	children,
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

	// 拖动窗口
	const onMouseDown = (e: React.MouseEvent) => {
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
			className="window"
			style={{
				position: "absolute",
				left: maximized ? 0 : position.left,
				top: maximized ? 0 : position.top,
				width: maximized ? "100vw" : size.width,
				height: maximized ? "100vh" : minimized ? 36 : size.height,
				zIndex: 1000,
				display: minimized ? "none" : undefined,
				minWidth,
				minHeight,
				maxWidth,
				maxHeight,
				boxSizing: "border-box",
			}}
		>
			<div
				className="title-bar"
				style={{ cursor: "move" }}
				onMouseDown={onMouseDown}
			>
				<div className="title-bar-text">{title}</div>
				<div className="title-bar-controls">
					<button
						aria-label="最小化"
						onClick={() => setMinimized(true)}
					></button>
					<button
						aria-label="最大化"
						onClick={() => setMaximized((m) => !m)}
					></button>
					<button aria-label="关闭" onClick={onClose}></button>
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
