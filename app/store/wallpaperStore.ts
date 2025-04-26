"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 壁纸列表类型
export type Wallpaper = {
	id: string;
	name: string;
	path: string;
	thumbnail?: string;
};

// 定义壁纸store接口
interface WallpaperStore {
	// 当前壁纸路径
	currentWallpaper: string;
	// 可用壁纸列表
	wallpapers: Wallpaper[];
	// 设置当前壁纸
	setCurrentWallpaper: (path: string) => void;
	// 添加壁纸
	addWallpaper: (wallpaper: Wallpaper) => void;
	// 删除壁纸
	removeWallpaper: (id: string) => void;
	// 重置为默认壁纸
	resetToDefault: () => void;
}

// 默认壁纸
const DEFAULT_WALLPAPER = "/wallpaper/tan.webp";

// 预设壁纸列表
const defaultWallpapers: Wallpaper[] = [
	{ id: "default", name: "默认壁纸", path: "/wallpaper/tan.webp" },
	{ id: "anime", name: "动漫壁纸", path: "/wallpaper/anime.jpg" },
	{ id: "asuka", name: "明日香壁纸", path: "/wallpaper/Asuka98.jpg" },
	{ id: "classic", name: "经典壁纸", path: "/wallpaper/unnamed.jpg" },
];

// 创建持久化的Zustand store
export const useWallpaperStore = create<WallpaperStore>()(
	persist(
		(set) => ({
			currentWallpaper: DEFAULT_WALLPAPER,
			wallpapers: defaultWallpapers,

			setCurrentWallpaper: (path: string) => set({ currentWallpaper: path }),

			addWallpaper: (wallpaper: Wallpaper) =>
				set((state) => ({
					wallpapers: [...state.wallpapers, wallpaper],
				})),

			removeWallpaper: (id: string) =>
				set((state) => ({
					wallpapers: state.wallpapers.filter((w) => w.id !== id),
					// 如果删除的是当前壁纸，重置为默认壁纸
					currentWallpaper:
						state.wallpapers.find((w) => w.id === id)?.path ===
						state.currentWallpaper
							? DEFAULT_WALLPAPER
							: state.currentWallpaper,
				})),

			resetToDefault: () => set({ currentWallpaper: DEFAULT_WALLPAPER }),
		}),
		{
			name: "wallpaper-storage", // localStorage键名
			storage: createJSONStorage(() => localStorage),
		}
	)
);
