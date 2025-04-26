"use client";
import { useState, useEffect } from "react";
import { useWallpaperStore } from "@/app/store/wallpaperStore";
import { useWallpaperPreview } from "@/app/components/hooks/useWallpaperPreview";
import WallpaperPreview from "@/app/components/windows/WallpaperPreview";
import UploadWallpaper from "@/app/components/windows/UploadWallpaper";

// 壁纸设置组件
export default function Wallpaper() {
	// 使用壁纸store
	const { wallpapers, removeWallpaper } = useWallpaperStore();

	// 使用壁纸预览钩子
	const {
		displayWallpaper,
		previewWallpaper,
		previewWallpaperFunc,
		applyPreviewWallpaper,
		cancelPreview,
		resetToDefault,
	} = useWallpaperPreview();

	// 标签页状态
	const [activeTab, setActiveTab] = useState<"browse" | "upload" | "settings">(
		"browse"
	);

	// 更新桌面背景
	useEffect(() => {
		// 仅在客户端执行
		if (typeof document !== "undefined") {
			document
				.querySelector(".desktop")
				?.setAttribute(
					"style",
					`background-image: url(${displayWallpaper}); background-size: cover; background-position: center; padding: 0;`
				);
		}
	}, [displayWallpaper]);

	// 渲染标签页内容
	const renderTabContent = () => {
		switch (activeTab) {
			case "browse":
				return (
					<div className="window-body">
						<div className="grid grid-cols-2 gap-4">
							{wallpapers.map((wallpaper) => (
								<WallpaperPreview
									key={wallpaper.id}
									wallpaper={wallpaper}
									isSelected={previewWallpaper === wallpaper.path}
									onClick={() => previewWallpaperFunc(wallpaper.path)}
									onApply={applyPreviewWallpaper}
								/>
							))}
						</div>

						{previewWallpaper && (
							<div className="flex justify-between mt-4">
								<button
									className="window active"
									onClick={applyPreviewWallpaper}
								>
									应用壁纸
								</button>
								<button className="window" onClick={cancelPreview}>
									取消预览
								</button>
							</div>
						)}
					</div>
				);
			case "upload":
				return <UploadWallpaper />;
			case "settings":
				return (
					<div className="window-body">
						<div className="mb-4">
							<button className="window active" onClick={resetToDefault}>
								恢复默认壁纸
							</button>
						</div>

						<div>
							<h4>自定义壁纸列表</h4>
							<div className="mt-2">
								{wallpapers
									.filter((w) => w.id.startsWith("custom"))
									.map((wallpaper) => (
										<div
											key={wallpaper.id}
											className="flex justify-between items-center mb-2"
										>
											<span>{wallpaper.name}</span>
											<button
												className="window"
												onClick={() => removeWallpaper(wallpaper.id)}
											>
												删除
											</button>
										</div>
									))}

								{wallpapers.filter((w) => w.id.startsWith("custom")).length ===
									0 && <p className="text-gray-500">暂无自定义壁纸</p>}
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="p-4">
			<menu role="tablist">
				<li
					role="tab "
					className={`${activeTab === "browse" ? "active" : ""} px-2`}
					onClick={() => setActiveTab("browse")}
				>
					浏览壁纸
				</li>
				<li
					role="tab"
					className={`${activeTab === "upload" ? "active" : ""} px-2`}
					onClick={() => setActiveTab("upload")}
				>
					上传壁纸
				</li>
				<li
					role="tab"
					className={`${activeTab === "settings" ? "active" : ""} px-2`}
					onClick={() => setActiveTab("settings")}
				>
					壁纸设置
				</li>
			</menu>

			{renderTabContent()}
		</div>
	);
}
