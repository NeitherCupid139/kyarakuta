"use client";

import React, { useState, useRef, useEffect } from "react";
import { Wave } from "@foobar404/wave";

// 音乐类型定义
interface Music {
	id: string;
	title: string;
	author: string;
	path: string;
}

// 音乐列表
const musicList: Music[] = [
	{
		id: "1",
		title: "复古音效",
		author: "Retro Sounds",
		path: "/music/retro-sounds-145816.mp3",
	},
	{
		id: "2",
		title: "另存为音效",
		author: "Save As Sound",
		path: "/music/save-as-115826.mp3",
	},
];

export default function MusicWindows() {
	// 状态管理
	const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(0.5);
	const [isMuted, setIsMuted] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [isRepeat, setIsRepeat] = useState(false);
	const [isShuffle, setIsShuffle] = useState(false);

	// 音频元素引用
	const audioRef = useRef<HTMLAudioElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// 首次加载时设置默认音乐和初始化波形动画
	useEffect(() => {
		if (musicList.length > 0) {
			setCurrentMusic(musicList[0]);
		}

		// 初始化波形动画
		if (audioRef.current && canvasRef.current) {
			const wave = new Wave(audioRef.current, canvasRef.current);

			// 添加波形动画
			wave.addAnimation(
				new wave.animations.Wave({
					lineWidth: 2,
					lineColor: "rgb(0, 255, 255)",
					count: 30,
				})
			);

			wave.addAnimation(
				new wave.animations.Square({
					count: 20,
					diameter: 50,
					lineColor: "rgba(255, 255, 255, 0.5)",
				})
			);
		}
	}, []);

	// 播放或暂停音乐
	const togglePlay = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}

		setIsPlaying(!isPlaying);
	};

	// 切换静音状态
	const toggleMute = () => {
		if (!audioRef.current) return;

		audioRef.current.muted = !isMuted;
		setIsMuted(!isMuted);
	};

	// 调整音量
	const changeVolume = (newVolume: number) => {
		if (!audioRef.current) return;

		// 确保音量在0-1之间
		const clampedVolume = Math.min(1, Math.max(0, newVolume));

		audioRef.current.volume = clampedVolume;
		setVolume(clampedVolume);

		// 如果音量大于0并且之前是静音状态，取消静音
		if (clampedVolume > 0 && isMuted) {
			audioRef.current.muted = false;
			setIsMuted(false);
		}
	};

	// 音量增加
	const volumeUp = () => {
		changeVolume(volume + 0.1);
	};

	// 音量减小
	const volumeDown = () => {
		changeVolume(volume - 0.1);
	};

	// 更新进度条
	const updateProgress = () => {
		if (!audioRef.current) return;

		setCurrentTime(audioRef.current.currentTime);
	};

	// 加载元数据时设置持续时间
	const handleLoadedMetadata = () => {
		if (!audioRef.current) return;

		setDuration(audioRef.current.duration);
	};

	// 播放结束时处理
	const handleEnded = () => {
		setIsPlaying(false);

		// 如果开启了重复播放，重新开始播放
		if (isRepeat && audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play();
			setIsPlaying(true);
			return;
		}

		// 否则播放下一首
		playNext();
	};

	// 跳转到指定时间
	const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!audioRef.current) return;

		const newTime = parseFloat(e.target.value);
		audioRef.current.currentTime = newTime;
		setCurrentTime(newTime);
	};

	// 播放下一首
	const playNext = () => {
		if (!currentMusic) return;

		const currentIndex = musicList.findIndex(
			(music) => music.id === currentMusic.id
		);
		let nextIndex = 0;

		// 如果开启了随机播放，随机选择一首（但不是当前这首）
		if (isShuffle) {
			let randomIndex;
			do {
				randomIndex = Math.floor(Math.random() * musicList.length);
			} while (randomIndex === currentIndex && musicList.length > 1);

			nextIndex = randomIndex;
		} else {
			// 否则顺序播放下一首
			nextIndex = (currentIndex + 1) % musicList.length;
		}

		setCurrentMusic(musicList[nextIndex]);
		setCurrentTime(0);

		// 如果当前是播放状态，自动播放下一首
		if (isPlaying && audioRef.current) {
			// 使用setTimeout确保状态更新和DOM更新后再播放
			setTimeout(() => {
				if (audioRef.current) {
					audioRef.current.play();
				}
			}, 100);
		}
	};

	// 播放上一首
	const playPrevious = () => {
		if (!currentMusic) return;

		const currentIndex = musicList.findIndex(
			(music) => music.id === currentMusic.id
		);
		let prevIndex = 0;

		// 如果开启了随机播放，随机选择一首（但不是当前这首）
		if (isShuffle) {
			let randomIndex;
			do {
				randomIndex = Math.floor(Math.random() * musicList.length);
			} while (randomIndex === currentIndex && musicList.length > 1);

			prevIndex = randomIndex;
		} else {
			// 否则顺序播放上一首
			prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
		}

		setCurrentMusic(musicList[prevIndex]);
		setCurrentTime(0);

		// 如果当前是播放状态，自动播放上一首
		if (isPlaying && audioRef.current) {
			// 使用setTimeout确保状态更新和DOM更新后再播放
			setTimeout(() => {
				if (audioRef.current) {
					audioRef.current.play();
				}
			}, 100);
		}
	};

	// 切换重复播放
	const toggleRepeat = () => {
		setIsRepeat(!isRepeat);
	};

	// 切换随机播放
	const toggleShuffle = () => {
		setIsShuffle(!isShuffle);
	};

	// 播放指定音乐
	const playMusic = (music: Music) => {
		setCurrentMusic(music);
		setCurrentTime(0);

		// 选择新音乐后自动开始播放
		setIsPlaying(true);

		// 使用setTimeout确保状态更新和DOM更新后再播放
		setTimeout(() => {
			if (audioRef.current) {
				audioRef.current.play();
			}
		}, 100);
	};

	// 格式化时间（秒 -> MM:SS）
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};

	return (
		<div
			className="window-body"
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* 音频播放器元素 */}
			<audio
				ref={audioRef}
				src={currentMusic?.path}
				onTimeUpdate={updateProgress}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={handleEnded}
				style={{ display: "none" }}
			/>

			{/* 音乐播放器主界面 */}
			<div
				className="music-player"
				style={{
					display: "flex",
					flexDirection: "column",
					flex: "1 1 auto",
				}}
			>
				{/* 当前播放信息 */}
				<div className="current-music">
					<h3>当前播放：{currentMusic?.title || "无"}</h3>
				</div>

				{/* 波形动画窗口 */}
				<div
					className="window"
					style={{ margin: "8px 0", padding: "8px", height: "200px" }}
				>
					<div className="title-bar">
						<div className="title-bar-text">音乐可视化</div>
					</div>
					<div
						className="window-body"
						style={{
							height: "calc(100% - 20px)",
							padding: "4px",
							backgroundColor: "#000",
						}}
					>
						<canvas
							ref={canvasRef}
							style={{
								width: "100%",
								height: "100%",
								backgroundColor: "#000",
							}}
						/>
					</div>
				</div>

				{/* 播放控制区 */}
				<div className="controls" style={{ marginTop: "8px" }}>
					{/* 播放控制区 */}
					<div
						className="flex flex-row flex-wrap gap-3 items-center justify-center"
						style={{ alignItems: "center", justifyContent: "center" }}
					>
						{/* 播放模式 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<button
								className="button"
								onClick={toggleRepeat}
								style={{ color: isRepeat ? "blue" : "" }}
							>
								<img src="/icons/loop.png" alt="循环" width={16} height={16} />
							</button>
							<span style={{ fontSize: 12 }}>循环</span>
						</div>

						{/* 上一首按钮 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<button className="button" onClick={playPrevious}>
								<img
									src="/icons/previous.png"
									alt="上一首"
									width={16}
									height={16}
								/>
							</button>
							<span style={{ fontSize: 12 }}>上一首</span>
						</div>

						{/* 播放/暂停按钮 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<button className="button" onClick={togglePlay}>
								{isPlaying ? (
									<img src="/icons/pause.png" alt="暂停" width={16} height={16} />
								) : (
									<img src="/icons/play.png" alt="播放" width={16} height={16} />
								)}
							</button>
							<span style={{ fontSize: 12 }}>{isPlaying ? "暂停" : "播放"}</span>
						</div>

						{/* 下一首按钮 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<button className="button" onClick={playNext}>
								<img src="/icons/next.png" alt="下一首" width={16} height={16} />
							</button>
							<span style={{ fontSize: 12 }}>下一首</span>
						</div>

						{/* 随机播放 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<button
								className="button"
								onClick={toggleShuffle}
								style={{ color: isShuffle ? "blue" : "" }}
							>
								<img src="/icons/shuffle.png" alt="随机" width={16} height={16} />
							</button>
							<span style={{ fontSize: 12 }}>随机</span>
						</div>

						{/* 音量控制 */}
						<div className="flex flex-col items-center" style={{ minWidth: 56 }}>
							<div className="flex flex-row gap-1 items-center">
								<button className="button" onClick={volumeDown}>
									<img
										src="/icons/quieter.png"
										alt="音量-"
										width={16}
										height={16}
									/>
								</button>
								<button className="button" onClick={toggleMute}>
									{isMuted ? (
										<img
											src="/icons/cancelmute.png"
											alt="取消静音"
											width={16}
											height={16}
										/>
									) : (
										<img
											src="/icons/mute.png"
											alt="静音"
											width={16}
											height={16}
										/>
									)}
								</button>
								<button className="button" onClick={volumeUp}>
									<img
										src="/icons/louder.png"
										alt="音量+"
										width={16}
										height={16}
									/>
								</button>
							</div>
							<span style={{ fontSize: 12 }}>音量</span>
						</div>
					</div>
				</div>

				{/* 进度条 */}
				<div style={{ marginTop: "8px" }}>
					<div style={{ display: "flex", alignItems: "center" }}>
						<span style={{ marginRight: "8px" }}>
							{formatTime(currentTime)}
						</span>
						<input
							type="range"
							min={0}
							max={duration || 0}
							value={currentTime}
							onChange={seekTo}
							style={{ flex: 1 }}
						/>
						<span style={{ marginLeft: "8px" }}>{formatTime(duration)}</span>
					</div>
				</div>

				{/* 音乐列表 */}
				<div
					className="music-list"
					style={{ marginTop: "16px", flex: "1 1 auto" }}
				>
					<h4>音乐列表</h4>
					<div
						className="field-row"
						style={{
							border: "1px solid #ddd",
							padding: "8px",
							height: "calc(100% - 40px)",
							overflowY: "auto",
						}}
					>
						{musicList.map((music) => (
							<div
								key={music.id}
								className="music-item"
								style={{
									padding: "4px 8px",
									cursor: "pointer",
									backgroundColor:
										currentMusic?.id === music.id ? "#def" : "transparent",
								}}
								onDoubleClick={() => playMusic(music)}
							>
								{music.title}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
