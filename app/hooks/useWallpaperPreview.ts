"use client";

import { useState, useEffect } from "react";
import { useWallpaperStore } from "@/app/store/wallpaperStore";

/**
 * 壁纸预览与管理的自定义钩子
 * 用于处理壁纸的预览、应用和重置功能
 */
export function useWallpaperPreview() {
	// 从壁纸存储中获取当前壁纸和设置方法
	const {
		currentWallpaper,
		setCurrentWallpaper,
		resetToDefault: resetStore,
	} = useWallpaperStore();

	// 预览壁纸状态
	const [previewWallpaper, setPreviewWallpaper] = useState<string | null>(null);

	// 显示的壁纸：如果有预览则显示预览，否则显示当前壁纸
	const displayWallpaper = previewWallpaper || currentWallpaper;

	// 预览壁纸方法
	const previewWallpaperFunc = (path: string) => {
		setPreviewWallpaper(path);
	};

	// 应用预览壁纸
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

	// 重置为默认壁纸
	const resetToDefault = () => {
		resetStore();
		setPreviewWallpaper(null);
	};

	// 组件卸载时取消预览
	useEffect(() => {
		return () => {
			setPreviewWallpaper(null);
		};
	}, []);

	return {
		displayWallpaper,
		previewWallpaper,
		previewWallpaperFunc,
		applyPreviewWallpaper,
		cancelPreview,
		resetToDefault,
	};
}
