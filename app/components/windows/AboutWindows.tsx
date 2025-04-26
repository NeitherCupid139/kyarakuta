"use client";
import React, { useState, useEffect } from "react";
import "98.css";
import Image from "next/image";

// 弹跳图片组件
function BouncingImage() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [direction, setDirection] = useState({ x: 1, y: 1 });
	const speed = 1;
	const containerSize = { width: 120, height: 120 };

	useEffect(() => {
		const interval = setInterval(() => {
			setPosition((prev) => {
				let newX = prev.x + direction.x * speed;
				let newY = prev.y + direction.y * speed;
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
					src="/icons/win98.png"
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

				{/* 作者介绍 */}
				<div className="field-row-stacked mb-4">
					<label>关于作者</label>
					<div className="sunken-panel p-2">
						<p className="mb-2">
							我是一名热爱创作的作家和程序员，专注于小说、剧本和交互式叙事创作。
						</p>
						<p className="mb-2">
							通过这个工具，我希望能帮助其他创作者更好地组织他们的创作素材和角色关系。
						</p>
						<p>喜欢科幻、奇幻题材，特别关注角色成长和世界构建。</p>
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

				{/* 联系方式 */}
				<div className="field-row-stacked">
					<label>联系方式</label>
					<div className="sunken-panel p-2">
						<div className="mb-2 flex items-center">
							<img
								src="/icons/phone.png"
								alt="Email"
								className="mr-2"
								width={16}
								height={16}
							/>
							<span>example@kyarakuta.com</span>
						</div>
						<div className="mb-2 flex items-center">
							<img
								src="/icons/chat.png"
								alt="微信"
								className="mr-2"
								width={16}
								height={16}
							/>
							<span>Kyarakuta_Creator</span>
						</div>
						<div className="flex items-center">
							<img
								src="/icons/globe.svg"
								alt="GitHub"
								className="mr-2"
								width={16}
								height={16}
							/>
							<a
								href="https://github.com/kyarakuta"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-800 hover:underline"
							>
								github.com/kyarakuta
							</a>
						</div>
					</div>
				</div>

				{/* 版权信息 */}
				<div className="mt-6 text-center text-xs text-gray-600">
					© 2023 角色管理工具 | 保留所有权利
				</div>
			</div>
		</div>
	);
}
