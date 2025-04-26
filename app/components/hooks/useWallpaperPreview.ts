"use client";
import { useState } from "react";
import { useWallpaperStore } from "@/app/store/wallpaperStore";

// 壁纸预览钩子
export const useWallpaperPreview = () => {
	// 获取当前壁纸和设置方法
	const { currentWallpaper, setCurrentWallpaper, resetToDefault } =
		useWallpaperStore();

	// 预览状态
	const [previewWallpaper, setPreviewWallpaper] = useState<string | null>(null);

	// 是否处于预览模式
	const isPreviewMode = previewWallpaper !== null;

	// 预览壁纸
	const previewWallpaperFunc = (path: string) => {
		setPreviewWallpaper(path);
	};

	// 应用预览的壁纸
	const applyPreviewWallpaper = () => {
		if (previewWallpaper) {
			setCurrentWallpaper(previewWallpaper);
			setPreviewWallpaper(null);
		}
	};

	// 取消预览
	const cancelPreview = () => {
		setPreviewWallpaper(null);
	};

	// 获取当前显示的壁纸（预览或正式设置的）
	const displayWallpaper = previewWallpaper || currentWallpaper;

	return {
		currentWallpaper,
		previewWallpaper,
		displayWallpaper,
		isPreviewMode,
		previewWallpaperFunc,
		applyPreviewWallpaper,
		cancelPreview,
		setCurrentWallpaper,
		resetToDefault,
	};
};
