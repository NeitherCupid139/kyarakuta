"use client";
import Image from "next/image";
import { useProcessStore } from "@/app/store/processStore";
import { useState, useEffect, useRef } from "react";
import { useSplashStore } from "@/app/lib/splashStore";
import { Modal } from "@/app/components/windows/ModalWindows";

export default function Navbar() {
	// 从进程存储中获取状态和方法
	const { processOpenTable, updateProcessState } = useProcessStore();
	// 从splash存储中获取重置方法
	const { resetSplashState } = useSplashStore();
	const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState("");

	// 音频引用
	const clickSoundRef = useRef<HTMLAudioElement | null>(null);

	// 调试用：输出当前进程列表
	useEffect(() => {
		console.log("任务栏进程列表更新:", processOpenTable);
	}, [processOpenTable]);

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

	// 更新时间
	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const hours = now.getHours().toString().padStart(2, "0");
			const minutes = now.getMinutes().toString().padStart(2, "0");
			setCurrentTime(`${hours}:${minutes}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 60000);
		return () => clearInterval(interval);
	}, []);

	// 点击其他区域关闭开始菜单
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest(".start-menu") && !target.closest(".start-button")) {
				setIsStartMenuOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	// 处理关机按钮点击
	const handleShutdown = async () => {
		// 播放点击音效
		playClickSound();

		// 显示确认对话框
		const confirmed = await Modal.confirm("确定要关闭系统吗？", {
			title: "系统关机",
			icon: "/icons/shutdown.png",
		});

		if (confirmed) {
			// 重置开机动画状态
			resetSplashState();
			// 刷新页面触发开机动画
			window.location.reload();
		}

		// 关闭开始菜单
		setIsStartMenuOpen(false);
	};

	// 处理进程点击
	const handleProcessClick = (processName: string) => {
		// 查找当前进程状态
		const process = processOpenTable.find((p) => p.name === processName);

		console.log("点击任务栏进程:", processName, process);

		if (process) {
			// 播放点击音效
			playClickSound();

			try {
				// 如果是最小化状态，则恢复窗口
				if (process.state === "minimize") {
					console.log("尝试恢复最小化窗口:", processName, process.type);

					// 更新进程状态为normal
					updateProcessState(processName, "normal");

					// 创建事件详情
					const detail = {
						windowName: processName,
						windowType: process.type, // 使用type属性关联窗口
					};

					console.log("发送恢复窗口事件:", detail);

					// 触发自定义事件，通知窗口恢复
					const event = new CustomEvent("restoreWindow", { detail });
					window.dispatchEvent(event);

					console.log("恢复窗口事件已发送");
				} else {
					console.log("尝试激活窗口:", processName, process.type);

					// 如果不是最小化状态，则设置为活动窗口
					updateProcessState(processName, "normal");

					// 创建事件详情
					const detail = {
						windowName: processName,
						windowType: process.type, // 使用type属性关联窗口
					};

					console.log("发送窗口置前事件:", detail);

					// 触发窗口置前事件
					const event = new CustomEvent("bringToFront", { detail });
					window.dispatchEvent(event);

					console.log("窗口置前事件已发送");
				}
			} catch (error) {
				console.error("处理进程点击事件错误:", error);
			}
		} else {
			console.warn("找不到点击的进程:", processName);
		}
	};

	// 获取按钮的样式类名
	const getButtonClassName = (process: {
		state: "minimize" | "maximize" | "normal" | "close";
	}) => {
		let className =
			"window-button flex items-center gap-1 px-2 h-8 focus:outline-none";

		// 最小化状态使用不同样式
		if (process.state === "minimize") {
			className += " minimized";
		} else if (process.state === "normal" || process.state === "maximize") {
			className += " active";
		}

		return className;
	};

	return (
		<div className="absolute bottom-0 left-0 w-full z-50">
			<div className="window taskbar flex items-center h-10">
				{/* 开始按钮 */}
				<button
					className="start-button window-button flex items-center gap-2 px-2 h-8 focus:outline-none"
					onClick={() => {
						playClickSound();
						setIsStartMenuOpen(!isStartMenuOpen);
					}}
				>
					<Image src="/icons/windows.png" alt="开始" width={20} height={20} />
					<span className="font-bold">开始</span>
				</button>

				{/* 进程列表 */}
				<div className="flex-1 flex items-center gap-1 px-1 h-full overflow-x-auto">
					{processOpenTable.map((process, index) => (
						<button
							key={index}
							className={getButtonClassName(process)}
							onClick={() => handleProcessClick(process.name)}
							title={
								process.state === "minimize"
									? `恢复 ${process.name}`
									: process.name
							}
						>
							<Image
								src={process.icon}
								alt={process.name}
								width={16}
								height={16}
							/>
							<span className="text-sm truncate max-w-[120px]">
								{process.name}
							</span>
						</button>
					))}
				</div>

				{/* 系统托盘 */}
				<div className="flex items-center h-full px-2 border-l">
					<span className="text-sm select-none">{currentTime}</span>
				</div>
			</div>

			{/* 开始菜单 */}
			{isStartMenuOpen && (
				<div className="start-menu window absolute bottom-10 left-0 w-64 shadow-lg">
					<div className="title-bar bg-blue-800 p-2 flex items-center">
						<Image
							src="/icons/windows.png"
							alt="Windows 98"
							width={24}
							height={24}
						/>
						<span className="text-white font-bold ml-2">Kyarakuta 98</span>
					</div>
					<div className="window-body p-2">
						<button
							className="w-full text-left px-2 py-1 focus:outline-none flex items-center menu-item"
							onMouseEnter={(e) => {
								e.currentTarget.classList.add("hover");
							}}
							onMouseLeave={(e) => {
								e.currentTarget.classList.remove("hover");
							}}
						>
							<Image
								src="/icons/programs.png"
								alt="程序"
								width={16}
								height={16}
								className="mr-2"
							/>
							程序
						</button>

						<hr className="my-1" />
						<button
							className="w-full text-left px-2 py-1 focus:outline-none flex items-center menu-item"
							onMouseEnter={(e) => {
								e.currentTarget.classList.add("hover");
							}}
							onMouseLeave={(e) => {
								e.currentTarget.classList.remove("hover");
							}}
							onClick={handleShutdown}
						>
							<Image
								src="/icons/shutdown.png"
								alt="关机"
								width={16}
								height={16}
								className="mr-2"
							/>
							关机...
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
