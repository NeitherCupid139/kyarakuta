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

	// Floyd–Steinberg 抖动算法
	function applyFloydSteinbergDither(
		imageData: ImageData,
		width: number,
		height: number
	) {
		const data = imageData.data;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const idx = (y * width + x) * 4;
				const oldPixel = data[idx]; // 只取灰度
				const newPixel = oldPixel < 128 ? 0 : 255;
				const quantError = oldPixel - newPixel;
				data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
				// 扩散误差
				function distributeError(x1: number, y1: number, factor: number) {
					if (x1 < 0 || x1 >= width || y1 < 0 || y1 >= height) return;
					const idx1 = (y1 * width + x1) * 4;
					data[idx1] = clamp(data[idx1] + quantError * factor);
					data[idx1 + 1] = clamp(data[idx1 + 1] + quantError * factor);
					data[idx1 + 2] = clamp(data[idx1 + 2] + quantError * factor);
				}
				distributeError(x + 1, y, 7 / 16);
				distributeError(x - 1, y + 1, 3 / 16);
				distributeError(x, y + 1, 5 / 16);
				distributeError(x + 1, y + 1, 1 / 16);
			}
		}
		function clamp(v: number) {
			return Math.max(0, Math.min(255, v));
		}
	}

	// 状态
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// 初始化摄像头
	useEffect(() => {
		const initCamera = async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: false,
				});
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

	// 实时抖动处理
	useEffect(() => {
		let running = true;
		function draw() {
			if (!running) return;
			const video = videoRef.current;
			const canvas = canvasRef.current;
			if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
				// 以视频实际尺寸为准
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					// 灰度化
					for (let i = 0; i < imageData.data.length; i += 4) {
						const avg =
							(imageData.data[i] +
								imageData.data[i + 1] +
								imageData.data[i + 2]) /
							3;
						imageData.data[i] =
							imageData.data[i + 1] =
							imageData.data[i + 2] =
								avg;
					}
					applyFloydSteinbergDither(imageData, canvas.width, canvas.height);
					ctx.putImageData(imageData, 0, 0);
				}
			}
			requestAnimationFrame(draw);
		}
		draw();
		return () => {
			running = false;
		};
	}, []);

	// 拍照功能
	const handleCapture = () => {
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;
		// 直接导出当前 canvas（已抖动处理）为图片
		const photoUrl = canvas.toDataURL("image/jpeg");
		onCapture(photoUrl);
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
		<div
			className="flex flex-col items-center justify-center p-4 gap-3"
			style={{ minHeight: 360 }}
		>
			{/* 摄像头视频区域 */}
			<div className="window" style={{ width: 340, maxWidth: "100%" }}>
				<div className="title-bar">
					<div className="title-bar-text">摄像头画面</div>
				</div>
				<div
					className="window-body flex items-center justify-center bg-black p-0"
					style={{ height: 260 }}
				>
					{/* 隐藏 video，仅用于采集数据 */}
					<video
						ref={videoRef}
						autoPlay
						playsInline
						className="hidden"
						style={{ maxHeight: 240, borderRadius: 2 }}
					/>
					{/* 展示抖动效果的 canvas */}
					<canvas
						ref={canvasRef}
						width={320}
						height={240}
						className="w-full h-full object-contain"
						style={{ maxHeight: 240, borderRadius: 2, background: "black" }}
					/>
				</div>
			</div>

			{/* 拍照按钮 */}
			<div className="flex flex-row items-center justify-center gap-2 mt-2">
				<button
					className="button"
					onClick={handleCapture}
					style={{ minWidth: 80 }}
				>
					📸 拍照
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
