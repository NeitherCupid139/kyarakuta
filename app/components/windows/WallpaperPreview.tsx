"use client";
import Image from "next/image";
import { Wallpaper } from "@/app/store/wallpaperStore";

// 壁纸预览组件
type WallpaperPreviewProps = {
	wallpaper: Wallpaper;
	isSelected: boolean;
	onClick: () => void;
	onApply: () => void;
};

export default function WallpaperPreview({
	wallpaper,
	isSelected,
	onClick,
}: WallpaperPreviewProps) {
	return (
		<div
			className={`border-2 p-1 cursor-pointer transition-all ${
				isSelected ? "border-blue-500" : "border-gray-300"
			}`}
			onClick={onClick}
		>
			<div className="relative w-full h-32 mb-1">
				<Image
					src={wallpaper.path}
					alt={wallpaper.name}
					fill
					className="object-cover"
				/>
			</div>
			<div className="flex flex-col">
				<span className="text-sm font-bold">{wallpaper.name}</span>
			</div>
		</div>
	);
}
