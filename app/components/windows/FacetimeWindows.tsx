"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "98.css";
import { Peer, MediaConnection } from "peerjs";

export default function FacetimeWindows() {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isCameraOn, setIsCameraOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);
	const [peerId, setPeerId] = useState<string>("");
	const [targetPeerId, setTargetPeerId] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [callStatus, setCallStatus] = useState<
		"idle" | "calling" | "connected" | "incoming"
	>("idle");

	// 引用
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const localCanvasRef = useRef<HTMLCanvasElement>(null);
	const remoteCanvasRef = useRef<HTMLCanvasElement>(null);
	const peerRef = useRef<Peer | null>(null);
	const currentCallRef = useRef<MediaConnection | null>(null);

	// 初始化本地视频流和PeerJS
	useEffect(() => {
		const initLocalStream = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				setLocalStream(stream);
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}

				// 初始化PeerJS
				const peer = new Peer();

				peer.on("open", (id) => {
					setPeerId(id);
					setIsLoading(false);
					console.log("我的ID是:", id);
				});

				// 处理来电
				peer.on("call", (call) => {
					setCallStatus("incoming");
					setTargetPeerId(call.peer);

					currentCallRef.current = call;

					// 自动接听
					handleAnswer();
				});

				peer.on("error", (err) => {
					console.error("PeerJS错误:", err);
					setError(`连接错误: ${err.message}`);
				});

				peerRef.current = peer;
			} catch (error) {
				console.error("获取媒体设备失败:", error);
				setError(
					"无法访问摄像头或麦克风，请确保允许浏览器访问摄像头和麦克风权限"
				);
				setIsLoading(false);
			}
		};
		initLocalStream();

		// 组件卸载时清理资源
		return () => {
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
			}
			if (currentCallRef.current) {
				currentCallRef.current.close();
			}
			if (peerRef.current) {
				peerRef.current.destroy();
			}
		};
	}, []);

	// 处理呼叫
	const handleCall = () => {
		if (!localStream || !targetPeerId || !peerRef.current) return;

		try {
			// 使用PeerJS发起呼叫
			const call = peerRef.current.call(targetPeerId, localStream);
			currentCallRef.current = call;

			// 监听远程流
			call.on("stream", (remoteVideoStream) => {
				setRemoteStream(remoteVideoStream);
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = remoteVideoStream;
				}
				setCallStatus("connected");
			});

			call.on("close", () => {
				handleHangup();
			});

			call.on("error", (err) => {
				console.error("呼叫错误:", err);
				setError(`呼叫失败: ${err}`);
				handleHangup();
			});

			setCallStatus("calling");
		} catch (error) {
			console.error("创建呼叫失败:", error);
			setError("创建呼叫失败，请重试");
		}
	};

	// 处理接听
	const handleAnswer = () => {
		if (!localStream || !currentCallRef.current) return;

		try {
			// 使用PeerJS接听呼叫
			currentCallRef.current.answer(localStream);

			// 监听远程流
			currentCallRef.current.on("stream", (remoteVideoStream) => {
				setRemoteStream(remoteVideoStream);
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = remoteVideoStream;
				}
				setCallStatus("connected");
			});

			currentCallRef.current.on("close", () => {
				handleHangup();
			});
		} catch (error) {
			console.error("接听呼叫失败:", error);
			setError("接听呼叫失败，请重试");
		}
	};

	// 处理挂断
	const handleHangup = () => {
		// 关闭连接
		if (currentCallRef.current) {
			currentCallRef.current.close();
			currentCallRef.current = null;
		}

		// 重置状态
		setRemoteStream(null);
		setCallStatus("idle");
	};

	// 切换摄像头
	const toggleCamera = () => {
		if (localStream) {
			const videoTrack = localStream.getVideoTracks()[0];
			videoTrack.enabled = !videoTrack.enabled;
			setIsCameraOn(!isCameraOn);
		}
	};

	// 切换麦克风
	const toggleMic = () => {
		if (localStream) {
			const audioTrack = localStream.getAudioTracks()[0];
			audioTrack.enabled = !audioTrack.enabled;
			setIsMicOn(!isMicOn);
		}
	};

	// 绘制本地视频到画布
	useEffect(() => {
		let running = true;
		function drawLocalVideo() {
			if (!running) return;
			const video = localVideoRef.current;
			const canvas = localCanvasRef.current;
			if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
				// 以视频实际尺寸为准
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				}
			}
			requestAnimationFrame(drawLocalVideo);
		}
		drawLocalVideo();
		return () => {
			running = false;
		};
	}, []);

	// 绘制远程视频到画布
	useEffect(() => {
		let running = true;
		function drawRemoteVideo() {
			if (!running) return;
			const video = remoteVideoRef.current;
			const canvas = remoteCanvasRef.current;
			if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
				// 以视频实际尺寸为准
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				}
			}
			requestAnimationFrame(drawRemoteVideo);
		}
		drawRemoteVideo();
		return () => {
			running = false;
		};
	}, [remoteStream]);

	// 显示错误信息
	if (error) {
		return (
			<div className="window-body h-full flex flex-col p-4 gap-4 items-center justify-center">
				<div className="window" style={{ width: "70%" }}>
					<div className="title-bar">
						<div className="title-bar-text">错误</div>
					</div>
					<div className="window-body">
						<p>{error}</p>
						<div className="field-row" style={{ justifyContent: "flex-end" }}>
							<button onClick={() => setError(null)}>确定</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// 加载状态
	if (isLoading) {
		return (
			<div className="window-body h-full flex flex-col p-4 gap-4 items-center justify-center">
				<div className="text-center">
					<p>正在初始化视频通话...</p>
					<progress></progress>
				</div>
			</div>
		);
	}

	return (
		<div className="window-body h-full flex flex-col p-4 gap-4">
			<h3>视频通话</h3>

			{/* ID区域 */}
			<div className="window">
				<div className="title-bar">
					<div className="title-bar-text">连接信息</div>
				</div>
				<div className="window-body p-4">
					<div className="field-row-stacked mb-2">
						<label>我的ID</label>
						<input type="text" value={peerId} readOnly className="w-full" />
					</div>
					<div className="field-row-stacked">
						<label>对方ID</label>
						<input
							type="text"
							value={targetPeerId}
							onChange={(e) => setTargetPeerId(e.target.value)}
							placeholder="输入对方ID"
							className="w-full"
							disabled={callStatus !== "idle"}
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 flex gap-4">
				{/* 本地视频预览 */}
				<div className="window flex-1">
					<div className="title-bar">
						<div className="title-bar-text">本地预览</div>
					</div>
					<div className="window-body p-0">
						<div className="relative w-full h-[240px] bg-black">
							{/* 隐藏 video，仅用于采集数据 */}
							<video
								ref={localVideoRef}
								autoPlay
								muted
								playsInline
								className="hidden absolute top-0 left-0 w-full h-full"
							/>
							{/* 展示画布效果 */}
							<canvas
								ref={localCanvasRef}
								width={320}
								height={240}
								className="w-full h-full object-cover"
							/>
							{!isCameraOn && (
								<div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
									摄像头已关闭
								</div>
							)}
						</div>
					</div>
				</div>

				{/* 远程视频显示 */}
				<div className="window flex-1">
					<div className="title-bar">
						<div className="title-bar-text">远程视频</div>
					</div>
					<div className="window-body p-0">
						<div className="relative w-full h-[240px] bg-black">
							{/* 隐藏 video，仅用于采集数据 */}
							<video
								ref={remoteVideoRef}
								autoPlay
								playsInline
								className="hidden absolute top-0 left-0 w-full h-full"
							/>
							{/* 展示画布效果 */}
							<canvas
								ref={remoteCanvasRef}
								width={320}
								height={240}
								className="w-full h-full object-cover"
							/>
							{!remoteStream && (
								<div className="absolute inset-0 flex items-center justify-center text-white">
									{callStatus === "calling" ? "正在呼叫..." : "等待连接..."}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* 呼叫状态信息 */}
			{callStatus !== "idle" && callStatus !== "connected" && (
				<div className="status-bar">
					<p className="status-bar-field">
						{callStatus === "calling"
							? `正在呼叫 ${targetPeerId}...`
							: "有来电..."}
					</p>
				</div>
			)}

			{/* 控制按钮 */}
			<div className="window">
				<div className="title-bar">
					<div className="title-bar-text">控制</div>
				</div>
				<div className="window-body p-4">
					<div className="flex justify-between">
						<div className="flex gap-2">
							<button
								className={`${isCameraOn ? "" : "active"}`}
								onClick={toggleCamera}
								style={{ width: "100px" }}
							>
								<Image
									src={`/icons/${isCameraOn ? "camera" : "camera-off"}.png`}
									alt="摄像头"
									width={16}
									height={16}
									className="inline-block mr-2"
								/>
								摄像头
							</button>
							<button
								className={`${isMicOn ? "" : "active"}`}
								onClick={toggleMic}
								style={{ width: "100px" }}
							>
								<Image
									src={`/icons/${isMicOn ? "mic" : "mic-off"}.png`}
									alt="麦克风"
									width={16}
									height={16}
									className="inline-block mr-2"
								/>
								麦克风
							</button>
						</div>

						<div className="flex gap-2">
							{callStatus === "idle" && (
								<button
									onClick={handleCall}
									disabled={!targetPeerId}
									style={{ width: "100px" }}
								>
									<Image
										src="/icons/call.png"
										alt="呼叫"
										width={16}
										height={16}
										className="inline-block mr-2"
									/>
									呼叫
								</button>
							)}
							{callStatus === "incoming" && (
								<button onClick={handleAnswer} style={{ width: "100px" }}>
									<Image
										src="/icons/call.png"
										alt="接听"
										width={16}
										height={16}
										className="inline-block mr-2"
									/>
									接听
								</button>
							)}
							{callStatus !== "idle" && (
								<button onClick={handleHangup} style={{ width: "100px" }}>
									<Image
										src="/icons/hangup.png"
										alt="挂断"
										width={16}
										height={16}
										className="inline-block mr-2"
									/>
									挂断
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
