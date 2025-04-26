"use client";
import { useState, ChangeEvent } from "react";
import { useWallpaperStore, Wallpaper } from "@/app/store/wallpaperStore";

// 壁纸上传组件
export default function UploadWallpaper() {
	const { addWallpaper } = useWallpaperStore();
	const [fileName, setFileName] = useState<string>("");
	const [errorMsg, setErrorMsg] = useState<string>("");

	// 处理文件选择
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFileName(file.name);
		setErrorMsg("");

		// 检查文件类型
		if (!file.type.includes("image")) {
			setErrorMsg("请选择图片文件");
			return;
		}

		// 读取文件
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target?.result) {
				// 创建新壁纸对象
				const newWallpaper: Wallpaper = {
					id: `custom-${Date.now()}`,
					name: file.name,
					path: event.target.result as string,
				};

				// 添加到壁纸列表
				addWallpaper(newWallpaper);

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
				</div>
				<p className="text-sm text-gray-600">
					支持JPG, PNG, WebP等图片格式。 上传的图片将保存在浏览器中。
				</p>
			</div>
		</div>
	);
}
