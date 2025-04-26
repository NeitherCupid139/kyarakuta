"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function FacetimeWindows() {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isCameraOn, setIsCameraOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);
	const [myPeerId] = useState(() => Math.random().toString(36).substr(2, 9));
	const [targetPeerId, setTargetPeerId] = useState("");
	const [isCallInProgress, setIsCallInProgress] = useState(false);

	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const peerConnection = useRef<RTCPeerConnection | null>(null);

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
			} catch (error) {
				console.error("获取媒体设备失败:", error);
			}
		};
		initLocalStream();

		return () => {
			localStream?.getTracks().forEach((track) => track.stop());
		};
	}, []);

	// 处理呼叫
	const handleCall = async () => {
		if (!localStream || !targetPeerId) return;

		peerConnection.current = new RTCPeerConnection();

		localStream.getTracks().forEach((track) => {
			peerConnection.current?.addTrack(track, localStream);
		});

		peerConnection.current.ontrack = (event) => {
			setRemoteStream(event.streams[0]);
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = event.streams[0];
			}
		};

		try {
			const offer = await peerConnection.current.createOffer();
			await peerConnection.current.setLocalDescription(offer);
			// 这里应该发送offer到对方
			setIsCallInProgress(true);
		} catch (error) {
			console.error("创建呼叫失败:", error);
		}
	};

	// 处理挂断
	const handleHangup = () => {
		peerConnection.current?.close();
		setRemoteStream(null);
		setIsCallInProgress(false);
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

	return (
		<div className="window-body h-full flex flex-col p-4 gap-4">
			{/* ID区域 */}
			<div className="field-row-stacked mb-4">
				<div className="field-row gap-2">
					<label>我的ID：</label>
					<input type="text" value={myPeerId} readOnly className="w-40" />
				</div>
				<div className="field-row gap-2">
					<label>对方ID：</label>
					<input
						type="text"
						value={targetPeerId}
						onChange={(e) => setTargetPeerId(e.target.value)}
						placeholder="输入对方ID"
						className="w-40"
					/>
				</div>
			</div>

			<div className="flex-1 flex gap-4">
				{/* 本地视频预览 */}
				<div className="field-row-stacked flex-1">
					<label>本地预览</label>
					<div className="relative w-full h-[240px] bg-black">
						<video
							ref={localVideoRef}
							autoPlay
							muted
							playsInline
							className="w-full h-full object-cover"
						/>
					</div>
				</div>

				{/* 远程视频显示 */}
				<div className="field-row-stacked flex-1">
					<label>远程视频</label>
					<div className="relative w-full h-[240px] bg-black">
						<video
							ref={remoteVideoRef}
							autoPlay
							playsInline
							className="w-full h-full object-cover"
						/>
						{!remoteStream && (
							<div className="absolute inset-0 flex items-center justify-center text-white">
								等待连接...
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 控制按钮 */}
			<div className="field-row justify-between">
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
					<button
						onClick={handleCall}
						disabled={isCallInProgress}
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
					<button
						onClick={handleHangup}
						disabled={!isCallInProgress}
						style={{ width: "100px" }}
					>
						<Image
							src="/icons/hangup.png"
							alt="挂断"
							width={16}
							height={16}
							className="inline-block mr-2"
						/>
						挂断
					</button>
				</div>
			</div>
		</div>
	);
}
