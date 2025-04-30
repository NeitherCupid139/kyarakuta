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
	// 添加 Wave 实例引用
	const waveInstanceRef = useRef<Wave | null>(null);

	// 首次加载时设置默认音乐和初始化波形动画
	useEffect(() => {
		if (musicList.length > 0) {
			setCurrentMusic(musicList[0]);
		}
	}, []);

	// 初始化波形动画
	useEffect(() => {
		// 清理之前的 Wave 实例
		if (waveInstanceRef.current) {
			// 由于 Wave 没有 destroy 方法，我们需要通过断开音频连接来清理
			// 重新创建音频元素来断开连接
			if (audioRef.current) {
				const oldAudio = audioRef.current;
				const newAudio = new Audio(oldAudio.src);
				newAudio.currentTime = oldAudio.currentTime;
				newAudio.volume = oldAudio.volume;
				newAudio.muted = oldAudio.muted;
				oldAudio.parentNode?.replaceChild(newAudio, oldAudio);
				audioRef.current = newAudio;
			}
			waveInstanceRef.current = null;
		}

		// 初始化新的 Wave 实例
		if (audioRef.current && canvasRef.current) {
			try {
				const wave = new Wave(audioRef.current, canvasRef.current);
				waveInstanceRef.current = wave;

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
			} catch (error) {
				console.error("初始化波形动画失败:", error);
			}
		}

		// 组件卸载时清理资源
		return () => {
			if (waveInstanceRef.current) {
				// 由于 Wave 没有 destroy 方法，我们需要通过断开音频连接来清理
				// 重新创建音频元素来断开连接
				if (audioRef.current) {
					const oldAudio = audioRef.current;
					const newAudio = new Audio(oldAudio.src);
					newAudio.currentTime = oldAudio.currentTime;
					newAudio.volume = oldAudio.volume;
					newAudio.muted = oldAudio.muted;
					oldAudio.parentNode?.replaceChild(newAudio, oldAudio);
					audioRef.current = newAudio;
				}
				waveInstanceRef.current = null;
			}
		};
	}, [currentMusic]); // 当当前音乐改变时重新初始化

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
				<div style={{ margin: "8px 0", padding: "8px", height: "200px" }}>
					<div
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
					<div className="field-row" style={{ justifyContent: "center" }}>
						<button
							className="button"
							onClick={playPrevious}
							style={{ padding: "4px" }}
						>
							<img
								src="/icons/previous.png"
								alt="上一首"
								width={16}
								height={16}
							/>
						</button>
						<button
							className="button"
							onClick={togglePlay}
							style={{ padding: "4px", margin: "0 8px" }}
						>
							{isPlaying ? (
								<img src="/icons/pause.png" alt="暂停" width={16} height={16} />
							) : (
								<img src="/icons/play.png" alt="播放" width={16} height={16} />
							)}
						</button>
						<button
							className="button"
							onClick={playNext}
							style={{ padding: "4px" }}
						>
							<img src="/icons/next.png" alt="下一首" width={16} height={16} />
						</button>
					</div>

					{/* 播放模式控制 */}
					<div
						className="field-row"
						style={{ justifyContent: "center", marginTop: "8px" }}
					>
						<button
							className="button"
							onClick={toggleRepeat}
							style={{
								padding: "4px",
								backgroundColor: isRepeat ? "#def" : "transparent",
							}}
						>
							<img
								src="/icons/repeat.png"
								alt="重复播放"
								width={16}
								height={16}
							/>
						</button>
						<button
							className="button"
							onClick={toggleShuffle}
							style={{
								padding: "4px",
								marginLeft: "8px",
								backgroundColor: isShuffle ? "#def" : "transparent",
							}}
						>
							<img
								src="/icons/shuffle.png"
								alt="随机播放"
								width={16}
								height={16}
							/>
						</button>
					</div>

					{/* 音量控制 */}
					<div
						className="field-row"
						style={{ justifyContent: "center", marginTop: "8px" }}
					>
						<div style={{ margin: "0 4px" }}>
							<div className="flex flex-row gap-1 items-center">
								<button
									className="button"
									onClick={volumeDown}
									style={{ padding: "4px" }}
								>
									<img
										src="/icons/quieter.png"
										alt="音量-"
										width={16}
										height={16}
									/>
								</button>
								<button
									className="button"
									onClick={toggleMute}
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										padding: "4px",
										minWidth: "40px",
									}}
								>
									{isMuted ? (
										<>
											<img
												src="/icons/cancelmute.png"
												alt="取消静音"
												width={16}
												height={16}
											/>
											<span style={{ fontSize: 10, marginTop: 2 }}>
												取消静音
											</span>
										</>
									) : (
										<>
											<img
												src="/icons/mute.png"
												alt="静音"
												width={16}
												height={16}
											/>
											<span style={{ fontSize: 10, marginTop: 2 }}>静音</span>
										</>
									)}
								</button>
								<button
									className="button"
									onClick={volumeUp}
									style={{ padding: "4px" }}
								>
									<img
										src="/icons/louder.png"
										alt="音量+"
										width={16}
										height={16}
									/>
								</button>
							</div>
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
						<div className="sunken-panel" style={{ width: "100%" }}>
							<table
								className="music-table"
								style={{ width: "100%", borderCollapse: "collapse" }}
							>
								<thead>
									<tr>
										<th
											style={{
												textAlign: "left",
												padding: "4px 8px",
												borderBottom: "1px solid #ddd",
											}}
										>
											<img
												src="/icons/music.png"
												alt="音乐"
												width={16}
												height={16}
												style={{ marginRight: "4px" }}
											/>
											标题
										</th>
										<th
											style={{
												textAlign: "left",
												padding: "4px 8px",
												borderBottom: "1px solid #ddd",
											}}
										>
											<img
												src="/icons/myfriend.png"
												alt="作者"
												width={16}
												height={16}
												style={{ marginRight: "4px" }}
											/>
											作者
										</th>
									</tr>
								</thead>
								<tbody>
									{musicList.map((music) => (
										<tr
											key={music.id}
											className="music-item"
											style={{
												cursor: "pointer",
												backgroundColor:
													currentMusic?.id === music.id
														? "#def"
														: "transparent",
												borderBottom: "1px solid #eee",
											}}
											onDoubleClick={() => playMusic(music)}
										>
											<td style={{ padding: "6px 8px" }}>{music.title}</td>
											<td style={{ padding: "6px 8px" }}>{music.author}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
