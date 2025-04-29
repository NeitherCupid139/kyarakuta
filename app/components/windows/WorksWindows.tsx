import React, { useState, useRef } from "react";
import { useWorks } from "@/app/hooks/useWorks";
import type { Work } from "@/app/db/schema";
import { uploadImage, deleteImage } from "@/app/lib/supabaseStorage";
import Image from "next/image";

/**
 * 作品管理组件
 * 实现作品的增删改查功能
 */
const WorksWindows: React.FC = () => {
	// 获取作品相关操作
	const { works, loading, error, createWork, updateWork, deleteWork } =
		useWorks();

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedWork, setSelectedWork] = useState<Work | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		coverImage: "",
	});

	// 图片上传状态
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 处理图片上传
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 检查文件类型
		if (!file.type.includes("image")) {
			setUploadError("请选择图片文件");
			return;
		}

		// 检查文件大小 (限制为 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setUploadError("图片大小不能超过 5MB");
			return;
		}

		setUploading(true);
		setUploadError(null);

		try {
			// 上传图片到 Supabase Storage
			const imageUrl = await uploadImage(file);

			// 更新表单数据
			setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
		} catch (err) {
			console.error("上传图片失败:", err);
			setUploadError("上传图片失败，请重试");
		} finally {
			setUploading(false);
		}
	};

	// 选择编辑作品
	const handleSelectWork = (work: Work) => {
		setSelectedWork(work);
		setFormData({
			title: work.title,
			description: work.description || "",
			coverImage: work.coverImage || "",
		});
		setEditMode("edit");
	};

	// 准备创建新作品
	const handleCreateNew = () => {
		setSelectedWork(null);
		setFormData({
			title: "",
			description: "",
			coverImage: "",
		});
		setEditMode("create");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedWork(null);
	};

	// 保存作品
	const handleSave = async () => {
		try {
			if (editMode === "create") {
				// 创建新作品
				await createWork({
					title: formData.title,
					description: formData.description || null,
					coverImage: formData.coverImage || null,
				});
			} else if (editMode === "edit" && selectedWork) {
				// 如果更新了封面图片，删除旧图片
				if (
					selectedWork.coverImage &&
					selectedWork.coverImage !== formData.coverImage
				) {
					await deleteImage(selectedWork.coverImage);
				}

				// 更新现有作品
				await updateWork(selectedWork.id, {
					title: formData.title,
					description: formData.description || null,
					coverImage: formData.coverImage || null,
				});
			}
			setEditMode(null);
			setSelectedWork(null);
		} catch (err) {
			console.error("保存作品失败:", err);
		}
	};

	// 删除作品
	const handleDelete = async (work: Work) => {
		if (window.confirm(`确定要删除作品"${work.title}"吗？`)) {
			try {
				// 如果作品有封面图片，先删除图片
				if (work.coverImage) {
					await deleteImage(work.coverImage);
				}

				await deleteWork(work.id);
			} catch (err) {
				console.error("删除作品失败:", err);
			}
		}
	};

	// 触发文件选择
	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			{loading ? (
				<p>加载中...</p>
			) : error ? (
				<p className="text-red-500">错误: {error.message}</p>
			) : (
				<div className="flex flex-col h-full">
					{editMode ? (
						// 编辑/创建表单
						<div className="p-4">
							<h2 className="mb-4">
								{editMode === "create" ? "创建新作品" : "编辑作品"}
							</h2>
							<div className="field-row-stacked mb-4">
								<label htmlFor="title">标题</label>
								<input
									id="title"
									name="title"
									type="text"
									value={formData.title}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label htmlFor="description">描述</label>
								<textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={5}
								/>
							</div>

							<div className="field-row-stacked mb-4">
								<label>封面图片</label>
								<div className="flex flex-col items-center">
									{formData.coverImage ? (
										<div className="relative w-48 h-48 mb-2">
											<Image
												src={formData.coverImage}
												alt="封面图片"
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-2">
											<span className="text-gray-500">无封面图片</span>
										</div>
									)}

									<div className="flex gap-2">
										<button onClick={triggerFileSelect} disabled={uploading}>
											{uploading ? "上传中..." : "选择图片"}
										</button>
										{formData.coverImage && (
											<button
												onClick={() =>
													setFormData((prev) => ({ ...prev, coverImage: "" }))
												}
												disabled={uploading}
											>
												移除图片
											</button>
										)}
									</div>

									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										className="hidden"
									/>

									{uploadError && (
										<p className="text-red-500 mt-2">{uploadError}</p>
									)}
								</div>
							</div>

							<div className="field-row mt-4">
								<button onClick={handleCancel}>取消</button>
								<button
									onClick={handleSave}
									disabled={!formData.title || uploading}
								>
									保存
								</button>
							</div>
						</div>
					) : (
						// 作品列表
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2>我的作品列表</h2>
								<button onClick={handleCreateNew}>创建新作品</button>
							</div>

							{works.length === 0 ? (
								<p>暂无作品，点击&quot;创建新作品&quot;按钮开始创作。</p>
							) : (
								<table className="w-full">
									<thead>
										<tr>
											<th>封面</th>
											<th>标题</th>
											<th>创建时间</th>
											<th>操作</th>
										</tr>
									</thead>
									<tbody>
										{works.map((work) => (
											<tr key={work.id}>
												<td className="w-20">
													{work.coverImage ? (
														<div className="relative w-16 h-16">
															<Image
																src={work.coverImage}
																alt={work.title}
																fill
																className="object-cover"
															/>
														</div>
													) : (
														<div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
															<span className="text-gray-500 text-xs">
																无封面
															</span>
														</div>
													)}
												</td>
												<td>{work.title}</td>
												<td>{new Date(work.createdAt).toLocaleDateString()}</td>
												<td>
													<div className="flex gap-2">
														<button onClick={() => handleSelectWork(work)}>
															编辑
														</button>
														<button onClick={() => handleDelete(work)}>
															删除
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default WorksWindows;
