"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSplashStore } from "@/app/lib/splashStore";

// 开机动画组件
const SplashScreen: React.FC = () => {
	// 使用Zustand store
	const {
		setHasShownSplash,
		setIsShowingSplash,
		isShowingPowerButton,
		setIsShowingPowerButton,
	} = useSplashStore();

	// 音频元素引用
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// 动画状态
	const [animationStage, setAnimationStage] = useState<number>(0);
	const [progressValue, setProgressValue] = useState<number>(0);
	// 是否已启动
	const [isBooting, setIsBooting] = useState<boolean>(false);

	// 处理动画完成
	const handleAnimationComplete = () => {
		// 设置已显示开机动画
		setHasShownSplash(true);
		setIsShowingSplash(false);
	};

	// 处理开机按钮点击
	const handlePowerButtonClick = () => {
		setIsBooting(true);
		setIsShowingPowerButton(false);

		// 创建音频元素并播放
		audioRef.current = new Audio("/audio/o98.wav");

		// 播放音频
		if (audioRef.current) {
			audioRef.current.volume = 0.8;
			audioRef.current.play().catch((error) => {
				console.error("音频播放失败:", error);
			});
		}
	};

	// 监控启动状态，启动后开始动画
	useEffect(() => {
		if (!isBooting) return;

		// 开始进度条动画 - 调整为7秒
		// 每70ms增加1%，总共7000ms
		let progress = 0;
		const interval = setInterval(() => {
			progress += 1;
			setProgressValue(progress);

			// 第一阶段：显示初始Windows logo
			if (progress === 20) {
				setAnimationStage(1);
			}
			// 第二阶段：显示加载进度条
			else if (progress === 40) {
				setAnimationStage(2);
			}
			// 第三阶段：显示启动完成信息
			else if (progress === 80) {
				setAnimationStage(3);
			}
			// 完成阶段：结束动画
			else if (progress >= 100) {
				clearInterval(interval);

				// 延迟一会后完成开机动画
				setTimeout(() => {
					handleAnimationComplete();
				}, 1000);
			}
		}, 70); // 进度更新速度改为70ms，使总时长约为7秒

		// 清理函数
		return () => {
			clearInterval(interval);
		};
	}, [isBooting, setHasShownSplash, setIsShowingSplash]);

	// 组件卸载时清理音频
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	// 渲染开机按钮界面
	if (isShowingPowerButton) {
		return (
			<div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
				<div
					onClick={handlePowerButtonClick}
					className="cursor-pointer flex flex-col items-center p-4"
				>
					<Image
						src="/icons/poweron.png"
						alt="poweron"
						width={100}
						height={100}
						unoptimized
					/>
				</div>
			</div>
		);
	}

	// 渲染开机动画界面
	return (
		<div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
			<div style={{ width: "500px", textAlign: "center" }}>
				<div className="window-body flex flex-col items-center p-4 ">
					{/* 不同阶段显示不同内容 */}
					{animationStage >= 0 && (
						<div className="my-4">
							<Image
								src="/icons/start.png"
								alt="Windows 98"
								width={200}
								height={200}
								unoptimized
							/>
						</div>
					)}

					{animationStage >= 1 && (
						<div className="text-white text-xl my-4">
							Starting Kyarakuta 98...
						</div>
					)}

					{animationStage >= 2 && (
						<div className="w-full my-4">
							<div className="flex justify-between text-white mb-2">
								<span>Loading system files...</span>
								<span>{progressValue}%</span>
							</div>
							{/* 使用默认样式进度条，确保显示效果 */}
							<div
								style={{
									width: "100%",
									height: "20px",
									border: "2px inset #a0a0a0",
									padding: "2px",
									backgroundColor: "#fff",
									position: "relative",
								}}
							>
								<div
									style={{
										width: `${progressValue}%`,
										height: "100%",
										backgroundColor: "#000080",
										transition: "width 0.1s ease",
									}}
								></div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SplashScreen;
