"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 定义store接口
interface SplashStore {
	// 是否已经显示过开机动画
	hasShownSplash: boolean;
	// 是否正在显示开机动画
	isShowingSplash: boolean;
	// 是否在显示开机按钮界面
	isShowingPowerButton: boolean;
	// 设置已显示开机动画状态
	setHasShownSplash: (value: boolean) => void;
	// 设置是否正在显示开机动画
	setIsShowingSplash: (value: boolean) => void;
	// 设置是否显示开机按钮界面
	setIsShowingPowerButton: (value: boolean) => void;
	// 重置开机状态（用于重新显示开机动画）
	resetSplashState: () => void;
}

// 创建持久化的Zustand store
export const useSplashStore = create<SplashStore>()(
	persist(
		(set) => ({
			hasShownSplash: false,
			isShowingSplash: true,
			isShowingPowerButton: true,

			setHasShownSplash: (value: boolean) => set({ hasShownSplash: value }),
			setIsShowingSplash: (value: boolean) => set({ isShowingSplash: value }),
			setIsShowingPowerButton: (value: boolean) =>
				set({ isShowingPowerButton: value }),

			// 重置状态方法
			resetSplashState: () =>
				set({
					hasShownSplash: false,
					isShowingSplash: true,
					isShowingPowerButton: true,
				}),
		}),
		{
			name: "splash-storage", // localStorage键名
			storage: createJSONStorage(() => localStorage),
		}
	)
);
