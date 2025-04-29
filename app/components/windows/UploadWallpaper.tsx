"use client";
import { useState, ChangeEvent } from "react";
import { useWallpaperStore, Wallpaper } from "@/app/store/wallpaperStore";
import { useWallpaperPreview } from "@hooks/useWallpaperPreview";

/**
 * 壁纸上传组件
 * 允许用户选择并上传本地图片作为壁纸
 */
export default function UploadWallpaper() {
	// 访问壁纸存储方法
	const { addWallpaper } = useWallpaperStore();
	// 使用预览钩子获取预览和应用功能
	const { previewWallpaperFunc, applyPreviewWallpaper } = useWallpaperPreview();
	// 本地状态管理
	const [fileName, setFileName] = useState<string>("");
	const [errorMsg, setErrorMsg] = useState<string>("");
	const [uploaded, setUploaded] = useState<string | null>(null);

	// 处理文件选择
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFileName(file.name);
		setErrorMsg("");
		setUploaded(null);

		// 检查文件类型
		if (!file.type.includes("image")) {
			setErrorMsg("请选择图片文件");
			return;
		}

		// 读取文件
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target?.result) {
				const dataUrl = event.target.result as string;

				// 创建新壁纸对象
				const newWallpaper: Wallpaper = {
					id: `custom-${Date.now()}`,
					name: file.name,
					path: dataUrl,
				};

				// 添加到壁纸列表
				addWallpaper(newWallpaper);

				// 更新状态并预览
				setUploaded(dataUrl);
				previewWallpaperFunc(dataUrl);

				// 重置表单
				setFileName("");
			}
		};

		reader.readAsDataURL(file);
	};

	return (
		<div className="window">
			<div className="window-body">
				<div className="mb-4">
					<label className="block mb-2">选择壁纸图片：</label>
					<div className="field-row">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full"
						/>
					</div>
					{fileName && <p className="mt-2">已选择: {fileName}</p>}
					{errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
					{uploaded && (
						<div className="mt-4">
							<p className="text-green-500">壁纸已上传并添加到壁纸库</p>
							<div className="mt-2">
								<button
									className="window active"
									onClick={applyPreviewWallpaper}
								>
									应用此壁纸
								</button>
							</div>
						</div>
					)}
				</div>
				<p className="text-sm text-gray-600">
					支持JPG, PNG, WebP等图片格式。上传的图片将保存在浏览器中。
				</p>
			</div>
		</div>
	);
}
