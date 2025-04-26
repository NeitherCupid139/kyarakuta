"use client";

import React, { useState, useRef, useEffect } from "react";
import "98.css";
import { usePhotoStorage } from "@/app/hooks/usePhotoStorage";

/**
 * 相机视图组件
 * 负责显示摄像头画面和拍照功能
 */
const CameraView: React.FC<{
	onCapture: (photoUrl: string) => void;
}> = ({ onCapture }) => {
	// 引用
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// 状态
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// 初始化摄像头
	useEffect(() => {
		const initCamera = async () => {
			try {
				// 获取摄像头权限和视频流
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: false,
				});

				// 设置视频流
				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
				}

				setStream(mediaStream);
				setIsLoading(false);
			} catch (err) {
				console.error("摄像头访问错误:", err);
				setError("无法访问摄像头，请确保允许浏览器访问摄像头权限");
				setIsLoading(false);
			}
		};

		initCamera();

		// 组件卸载时清理资源
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	// 拍照功能
	const handleCapture = () => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;

		// 设置canvas尺寸匹配视频
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// 在canvas上绘制当前视频帧
		const context = canvas.getContext("2d");
		if (context) {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);

			// 获取照片URL
			const photoUrl = canvas.toDataURL("image/jpeg");
			onCapture(photoUrl);
		}
	};

	// 如果有错误，显示错误信息
	if (error) {
		return (
			<div className="p-4 flex flex-col items-center justify-center h-[300px]">
				<div className="window" style={{ width: "70%" }}>
					<div className="title-bar">
						<div className="title-bar-text">错误</div>
					</div>
					<div className="window-body">
						<p>{error}</p>
						<div className="field-row" style={{ justifyContent: "flex-end" }}>
							<button>确定</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// 加载状态
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[300px]">
				<div className="text-center">
					<p>正在打开摄像头...</p>
					<progress></progress>
				</div>
			</div>
		);
	}

	return (
		<div className="p-2 flex flex-col">
			{/* 显示摄像头视频 */}
			<div className="relative bg-black" style={{ height: "300px" }}>
				<video
					ref={videoRef}
					autoPlay
					playsInline
					className="w-full h-full object-contain"
				/>
			</div>

			{/* 拍照按钮 */}
			<div className="mt-2 flex justify-center">
				<button className="px-4" onClick={handleCapture}>
					拍照
				</button>
			</div>

			{/* 隐藏的canvas用于捕获照片 */}
			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
};

/**
 * 滤镜选项组件
 */
const FilterOptions: React.FC<{
	selectedFilter: string;
	onFilterChange: (filter: string) => void;
}> = ({ selectedFilter, onFilterChange }) => {
	// 可用的滤镜
	const filters = [
		{ id: "none", name: "无滤镜" },
		{ id: "grayscale", name: "黑白" },
		{ id: "sepia", name: "复古" },
		{ id: "blur", name: "模糊" },
		{ id: "brightness", name: "明亮" },
	];

	return (
		<div className="my-2">
			<fieldset>
				<legend>选择滤镜</legend>
				<div className="flex flex-wrap gap-2">
					{filters.map((filter) => (
						<div key={filter.id} className="field-row">
							<input
								id={`filter-${filter.id}`}
								type="radio"
								name="filter"
								checked={selectedFilter === filter.id}
								onChange={() => onFilterChange(filter.id)}
							/>
							<label htmlFor={`filter-${filter.id}`}>{filter.name}</label>
						</div>
					))}
				</div>
			</fieldset>
		</div>
	);
};

/**
 * 照片预览组件
 */
const PhotoPreview: React.FC<{
	photoUrl: string | null;
	filter: string;
	onSave: () => void;
	onDiscard: () => void;
}> = ({ photoUrl, filter, onSave, onDiscard }) => {
	if (!photoUrl) return null;

	// 根据滤镜应用CSS类
	const getFilterStyle = () => {
		switch (filter) {
			case "grayscale":
				return "filter grayscale(100%)";
			case "sepia":
				return "filter sepia(100%)";
			case "blur":
				return "filter blur(2px)";
			case "brightness":
				return "filter brightness(150%)";
			default:
				return "";
		}
	};

	return (
		<div className="window my-4">
			<div className="title-bar">
				<div className="title-bar-text">照片预览</div>
			</div>
			<div className="window-body">
				<div className="flex flex-col items-center">
					<div className="bg-black p-2 mb-2" style={{ maxWidth: "320px" }}>
						<img
							src={photoUrl}
							alt="拍摄预览"
							className={`max-w-full ${getFilterStyle()}`}
						/>
					</div>
					<div className="flex gap-4">
						<button onClick={onDiscard}>丢弃</button>
						<button onClick={onSave}>保存到相册</button>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * 相机窗口组件
 * 允许用户拍照并保存到相册
 */
export default function CameraWindows() {
	// 使用照片存储hook
	const { addPhoto } = usePhotoStorage();

	// 状态
	const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
	const [selectedFilter, setSelectedFilter] = useState<string>("none");
	const [photoTitle, setPhotoTitle] = useState<string>("");

	// 处理拍照
	const handleCapture = (photoUrl: string) => {
		setCapturedPhoto(photoUrl);
	};

	// 处理丢弃照片
	const handleDiscard = () => {
		setCapturedPhoto(null);
	};

	// 处理保存照片
	const handleSave = () => {
		if (!capturedPhoto) return;

		// 应用滤镜（这里需要实际处理图像，简化为仅保存滤镜信息）
		addPhoto({
			url: capturedPhoto,
			title: photoTitle || `照片 ${new Date().toLocaleString()}`,
			takenAt: new Date(),
			filter: selectedFilter !== "none" ? selectedFilter : undefined,
		});

		// 清空状态，准备拍摄下一张
		setCapturedPhoto(null);
		setSelectedFilter("none");
		setPhotoTitle("");
	};

	return (
		<div className="window-body">
			<h3>相机</h3>

			{!capturedPhoto ? (
				<>
					{/* 相机视图 */}
					<CameraView onCapture={handleCapture} />
				</>
			) : (
				<div className="p-2">
					{/* 预览和保存表单 */}
					<div className="field-row-stacked mb-2">
						<label htmlFor="photoTitle">照片标题</label>
						<input
							id="photoTitle"
							type="text"
							value={photoTitle}
							onChange={(e) => setPhotoTitle(e.target.value)}
							placeholder="输入照片标题（可选）"
						/>
					</div>

					{/* 滤镜选项 */}
					<FilterOptions
						selectedFilter={selectedFilter}
						onFilterChange={setSelectedFilter}
					/>

					{/* 照片预览 */}
					<PhotoPreview
						photoUrl={capturedPhoto}
						filter={selectedFilter}
						onSave={handleSave}
						onDiscard={handleDiscard}
					/>
				</div>
			)}
		</div>
	);
}
