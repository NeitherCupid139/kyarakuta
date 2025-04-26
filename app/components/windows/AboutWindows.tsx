"use client";
import React, { useState, useEffect } from "react";
import "98.css";

// 弹跳图片组件
function BouncingImage() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [direction, setDirection] = useState({ x: 1, y: 1 });
	const speed = 1;
	const containerSize = { width: 120, height: 120 };

	useEffect(() => {
		const interval = setInterval(() => {
			setPosition((prev) => {
				const newX = prev.x + direction.x * speed;
				const newY = prev.y + direction.y * speed;
				let newDirX = direction.x;
				let newDirY = direction.y;

				// 检查边界碰撞
				if (newX <= 0 || newX >= containerSize.width - 50) {
					newDirX = -direction.x;
				}
				if (newY <= 0 || newY >= containerSize.height - 50) {
					newDirY = -direction.y;
				}

				// 更新方向
				if (newDirX !== direction.x || newDirY !== direction.y) {
					setDirection({ x: newDirX, y: newDirY });
				}

				return { x: newX, y: newY };
			});
		}, 30);

		return () => clearInterval(interval);
	}, [direction]);

	return (
		<div
			className="sunken-panel flex items-center justify-center relative"
			style={{
				width: containerSize.width,
				height: containerSize.height,
				margin: "0 auto 16px auto",
				overflow: "hidden",
			}}
		>
			<div
				className="absolute"
				style={{
					transform: `translate(${position.x}px, ${position.y}px)`,
					width: "48px",
					height: "48px",
				}}
			>
				<img
					src="/icons/myfriend.png"
					alt="Windows 98 Logo"
					width={48}
					height={48}
				/>
			</div>
		</div>
	);
}

// 进度条组件
function ProgressBar({ value }: { value: number }) {
	return (
		<div className="w-full h-4 bg-gray-200 relative overflow-hidden">
			<div className="h-full bg-blue-800" style={{ width: `${value}%` }}></div>
		</div>
	);
}

export default function AboutWindows() {
	const [loadingProgress, setLoadingProgress] = useState(0);

	useEffect(() => {
		if (loadingProgress < 100) {
			const timer = setTimeout(() => {
				setLoadingProgress((prev) => Math.min(prev + 5, 100));
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [loadingProgress]);

	return (
		<div className="window-body" style={{ height: "100%", overflow: "auto" }}>
			<div className="p-4">
				{/* 标题区域 */}
				<div className="flex items-center justify-center mb-4">
					<img
						src="/icons/about.png"
						alt="关于"
						className="mr-2"
						width={24}
						height={24}
					/>
					<h2 className="text-center text-xl font-bold">角色管理工具</h2>
				</div>

				{/* 弹跳照片 */}
				<BouncingImage />

				{/* 加载进度条 */}
				<div className="mb-4">
					<label>系统加载</label>
					<ProgressBar value={loadingProgress} />
					<div className="text-right text-xs mt-1">{loadingProgress}%</div>
				</div>

				{/* 项目信息 */}
				<div className="field-row-stacked mb-4">
					<label>项目信息</label>
					<div className="sunken-panel p-2">
						<table className="w-full">
							<tbody>
								<tr>
									<td className="font-bold">项目名称:</td>
									<td>角色管理工具 (Kyarakuta)</td>
								</tr>
								<tr>
									<td className="font-bold">版本:</td>
									<td>0.1.0</td>
								</tr>
								<tr>
									<td className="font-bold">技术栈:</td>
									<td>Next.js, React, 98.css, TailwindCSS</td>
								</tr>
								<tr>
									<td className="font-bold">许可证:</td>
									<td>MIT</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* 功能列表 */}
				<div className="field-row-stacked mb-4">
					<label>主要功能</label>
					<div className="sunken-panel p-2">
						<ul className="list-disc pl-5">
							<li>角色管理与关系图谱</li>
							<li>章节与事件时间线</li>
							<li>世界观设定记录</li>
							<li>地图编辑与场景规划</li>
							<li>AI辅助创作与分析</li>
						</ul>
					</div>
				</div>

				{/* 版权信息 */}
				<div className="mt-6 text-center text-xs text-gray-600">
					© 2025 Kyarakuta | 保留所有权利
				</div>
			</div>
		</div>
	);
}
