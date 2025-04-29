"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "98.css";

// 简单的模拟信令服务器（真实环境中应该使用WebSocket或HTTP服务）
class SignalingService {
	private static instance: SignalingService;
	private offers: Record<string, RTCSessionDescriptionInit> = {};
	private answers: Record<string, RTCSessionDescriptionInit> = {};
	private iceCandidates: Record<string, RTCIceCandidateInit[]> = {};

	private constructor() {}

	public static getInstance(): SignalingService {
		if (!SignalingService.instance) {
			SignalingService.instance = new SignalingService();
		}
		return SignalingService.instance;
	}

	public sendOffer(peerId: string, offer: RTCSessionDescriptionInit): void {
		this.offers[peerId] = offer;
	}

	public getOffer(peerId: string): RTCSessionDescriptionInit | null {
		return this.offers[peerId] || null;
	}

	public sendAnswer(peerId: string, answer: RTCSessionDescriptionInit): void {
		this.answers[peerId] = answer;
	}

	public getAnswer(peerId: string): RTCSessionDescriptionInit | null {
		return this.answers[peerId] || null;
	}

	public addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): void {
		if (!this.iceCandidates[peerId]) {
			this.iceCandidates[peerId] = [];
		}
		this.iceCandidates[peerId].push(candidate);
	}

	public getIceCandidates(peerId: string): RTCIceCandidateInit[] {
		return this.iceCandidates[peerId] || [];
	}

	public clearIceCandidates(peerId: string): void {
		this.iceCandidates[peerId] = [];
	}

	public clearSignaling(peerId: string): void {
		delete this.offers[peerId];
		delete this.answers[peerId];
		delete this.iceCandidates[peerId];
	}
}

export default function FacetimeWindows() {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isCameraOn, setIsCameraOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);
	const [myPeerId] = useState(() => Math.random().toString(36).substr(2, 9));
	const [targetPeerId, setTargetPeerId] = useState("");
	const [isCallInProgress, setIsCallInProgress] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [callStatus, setCallStatus] = useState<
		"idle" | "calling" | "connected" | "incoming"
	>("idle");

	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const peerConnection = useRef<RTCPeerConnection | null>(null);
	const signalingService = useRef(SignalingService.getInstance());
	const pollingInterval = useRef<NodeJS.Timeout | null>(null);

	// ICE服务器配置
	const iceServers = {
		iceServers: [
			{ urls: "stun:stun.l.google.com:19302" },
			{ urls: "stun:stun1.l.google.com:19302" },
		],
	};

	// 检查是否有新的Offer
	const checkForOffer = () => {
		if (!targetPeerId) return;

		const offer = signalingService.current.getOffer(myPeerId);
		if (offer && callStatus === "idle") {
			setCallStatus("incoming");
			setTargetPeerId(targetPeerId);

			// 自动接听
			handleAnswer();
		}
	};

	// 检查是否有新的Answer
	const checkForAnswer = () => {
		if (!targetPeerId || callStatus !== "calling") return;

		const answer = signalingService.current.getAnswer(targetPeerId);
		if (answer && peerConnection.current) {
			handleIncomingAnswer(answer);
		}
	};

	// 检查是否有新的ICE候选
	const checkForIceCandidates = () => {
		if (!targetPeerId) return;

		const candidates = signalingService.current.getIceCandidates(myPeerId);
		if (candidates.length > 0 && peerConnection.current) {
			candidates.forEach((candidate) => {
				peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
			});
			signalingService.current.clearIceCandidates(myPeerId);
		}
	};

	// 设置轮询检查新消息
	useEffect(() => {
		pollingInterval.current = setInterval(() => {
			checkForOffer();
			checkForAnswer();
			checkForIceCandidates();
		}, 1000);

		return () => {
			if (pollingInterval.current) {
				clearInterval(pollingInterval.current);
			}
		};
	}, [targetPeerId, callStatus]);

	// 初始化本地视频流
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
				setIsLoading(false);
			} catch (error) {
				console.error("获取媒体设备失败:", error);
				setError(
					"无法访问摄像头或麦克风，请确保允许浏览器访问摄像头和麦克风权限"
				);
				setIsLoading(false);
			}
		};
		initLocalStream();

		return () => {
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
			}
			if (peerConnection.current) {
				peerConnection.current.close();
			}
		};
	}, []);

	// 初始化WebRTC连接
	const initPeerConnection = () => {
		peerConnection.current = new RTCPeerConnection(iceServers);

		// 添加本地媒体流
		if (localStream) {
			localStream.getTracks().forEach((track) => {
				peerConnection.current?.addTrack(track, localStream);
			});
		}

		// 监听远程流
		peerConnection.current.ontrack = (event) => {
			setRemoteStream(event.streams[0]);
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = event.streams[0];
			}
			setCallStatus("connected");
		};

		// 监听ICE候选
		peerConnection.current.onicecandidate = (event) => {
			if (event.candidate && targetPeerId) {
				signalingService.current.addIceCandidate(
					targetPeerId,
					event.candidate.toJSON()
				);
			}
		};

		// 监听连接状态变化
		peerConnection.current.onconnectionstatechange = () => {
			if (
				peerConnection.current?.connectionState === "disconnected" ||
				peerConnection.current?.connectionState === "failed"
			) {
				handleHangup();
			}
		};
	};

	// 处理呼叫
	const handleCall = async () => {
		if (!localStream || !targetPeerId) return;

		initPeerConnection();

		try {
			const offer = await peerConnection.current!.createOffer();
			await peerConnection.current!.setLocalDescription(offer);

			// 发送offer到模拟的信令服务器
			signalingService.current.sendOffer(targetPeerId, offer);
			setCallStatus("calling");
		} catch (error) {
			console.error("创建呼叫失败:", error);
			setError("创建呼叫失败，请重试");
		}
	};

	// 处理接听
	const handleAnswer = async () => {
		if (!localStream) return;

		initPeerConnection();

		try {
			const offer = signalingService.current.getOffer(myPeerId);
			if (!offer) return;

			await peerConnection.current!.setRemoteDescription(
				new RTCSessionDescription(offer)
			);
			const answer = await peerConnection.current!.createAnswer();
			await peerConnection.current!.setLocalDescription(answer);

			// 发送answer到模拟的信令服务器
			signalingService.current.sendAnswer(targetPeerId, answer);
			setCallStatus("connected");
		} catch (error) {
			console.error("接听呼叫失败:", error);
			setError("接听呼叫失败，请重试");
		}
	};

	// 处理接收到的应答
	const handleIncomingAnswer = async (answer: RTCSessionDescriptionInit) => {
		try {
			if (peerConnection.current) {
				await peerConnection.current.setRemoteDescription(
					new RTCSessionDescription(answer)
				);
				setCallStatus("connected");
			}
		} catch (error) {
			console.error("设置远程描述失败:", error);
			setError("连接失败，请重试");
		}
	};

	// 处理挂断
	const handleHangup = () => {
		// 关闭连接
		peerConnection.current?.close();
		peerConnection.current = null;

		// 清理信令
		if (targetPeerId) {
			signalingService.current.clearSignaling(targetPeerId);
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
						<input type="text" value={myPeerId} readOnly className="w-full" />
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
							<video
								ref={localVideoRef}
								autoPlay
								muted
								playsInline
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
							<video
								ref={remoteVideoRef}
								autoPlay
								playsInline
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
