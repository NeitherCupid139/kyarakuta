"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useWallpaperStore } from "@/app/store/wallpaperStore";

// 创建壁纸上下文
type WallpaperContextType = {
	applyWallpaperToDesktop: () => void;
};

const WallpaperContext = createContext<WallpaperContextType | undefined>(
	undefined
);

// 壁纸提供器组件
export function WallpaperProvider({ children }: { children: React.ReactNode }) {
	const { currentWallpaper } = useWallpaperStore();

	// 应用壁纸到桌面
	const applyWallpaperToDesktop = () => {
		if (typeof document !== "undefined") {
			document
				.querySelector(".desktop")
				?.setAttribute(
					"style",
					`background-image: url(${currentWallpaper}); background-size: cover; background-position: center; padding: 0;`
				);
		}
	};

	// 初始化和壁纸变化时应用到桌面
	useEffect(() => {
		applyWallpaperToDesktop();
	}, [currentWallpaper]);

	return (
		<WallpaperContext.Provider value={{ applyWallpaperToDesktop }}>
			{children}
		</WallpaperContext.Provider>
	);
}

// 壁纸上下文Hook
export function useWallpaperContext() {
	const context = useContext(WallpaperContext);
	if (context === undefined) {
		throw new Error(
			"useWallpaperContext must be used within a WallpaperProvider"
		);
	}
	return context;
}
