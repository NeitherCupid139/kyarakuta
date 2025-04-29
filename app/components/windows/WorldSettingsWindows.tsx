import React, { useState } from "react";
import { useWorldSettings } from "@/app/hooks/useWorldSettings";
import type { WorldSetting, Work } from "@/app/db/schema";

/**
 * 世界观设定管理组件
 * 实现世界观设定的增删改查功能和分类管理
 */
const WorldSettingsWindows: React.FC<{
	work?: Work; // 设置为可选
}> = ({ work }) => {
	// 获取世界观设定相关操作
	const {
		worldSettings,
		loading,
		error,
		createWorldSetting,
		updateWorldSetting,
		deleteWorldSetting,
		getAllCategories,
	} = useWorldSettings(work?.id || "");

	// 编辑状态管理
	const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
	const [selectedSetting, setSelectedSetting] = useState<WorldSetting | null>(
		null
	);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [newCategoryInput, setNewCategoryInput] = useState("");
	const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

	// 表单数据
	const [formData, setFormData] = useState({
		category: "",
		title: "",
		content: "",
	});

	// 预定义的分类选项
	const predefinedCategories = [
		{ value: "geography", label: "地理" },
		{ value: "history", label: "历史" },
		{ value: "culture", label: "文化" },
		{ value: "religion", label: "宗教" },
		{ value: "politics", label: "政治" },
		{ value: "technology", label: "科技" },
		{ value: "magic", label: "魔法/超能力" },
		{ value: "races", label: "种族" },
		{ value: "other", label: "其他" },
	];

	// 获取所有分类（包括用户自定义的）
	const allCategories = [
		...predefinedCategories,
		...getAllCategories()
			.filter((cat) => !predefinedCategories.some((pc) => pc.value === cat))
			.map((cat) => ({ value: cat, label: cat })),
	];

	// 处理表单输入变化
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 选择编辑设定
	const handleSelectSetting = (setting: WorldSetting) => {
		setSelectedSetting(setting);
		setFormData({
			category: setting.category,
			title: setting.title,
			content: setting.content || "",
		});
		setEditMode("edit");
	};

	// 准备创建新设定
	const handleCreateNew = () => {
		setSelectedSetting(null);
		setFormData({
			category: selectedCategory !== "all" ? selectedCategory : "",
			title: "",
			content: "",
		});
		setEditMode("create");
	};

	// 取消编辑
	const handleCancel = () => {
		setEditMode(null);
		setSelectedSetting(null);
	};

	// 保存设定
	const handleSave = async () => {
		try {
			if (!formData.category || !formData.title) {
				alert("分类和标题是必填项");
				return;
			}

			if (editMode === "create") {
				// 创建新设定
				await createWorldSetting({
					category: formData.category,
					title: formData.title,
					content: formData.content || null,
				});
			} else if (editMode === "edit" && selectedSetting) {
				// 更新现有设定
				await updateWorldSetting(selectedSetting.id, {
					category: formData.category,
					title: formData.title,
					content: formData.content || null,
				});
			}
			setEditMode(null);
			setSelectedSetting(null);
		} catch (err) {
			console.error("保存世界观设定失败:", err);
			alert(err instanceof Error ? err.message : "保存世界观设定失败");
		}
	};

	// 删除设定
	const handleDelete = async (setting: WorldSetting) => {
		if (window.confirm(`确定要删除"${setting.title}"吗？`)) {
			try {
				await deleteWorldSetting(setting.id);
			} catch (err) {
				console.error("删除世界观设定失败:", err);
			}
		}
	};

	// 添加新分类
	const handleAddNewCategory = () => {
		if (newCategoryInput.trim()) {
			// 设置新分类并准备创建新设定
			setFormData((prev) => ({ ...prev, category: newCategoryInput.trim() }));
			setNewCategoryInput("");
			setShowNewCategoryForm(false);
		}
	};

	// 根据选择的分类过滤设定
	const filteredSettings = worldSettings.filter(
		(setting) =>
			selectedCategory === "all" || setting.category === selectedCategory
	);

	return (
		<div className="flex flex-col h-full">
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
								{editMode === "create" ? "创建新世界观设定" : "编辑世界观设定"}
							</h2>

							<div className="field-row-stacked mb-4">
								<label htmlFor="category">分类</label>
								{showNewCategoryForm ? (
									<div className="flex">
										<input
											id="newCategory"
											type="text"
											value={newCategoryInput}
											onChange={(e) => setNewCategoryInput(e.target.value)}
											placeholder="输入新分类名称"
											className="flex-grow"
										/>
										<button onClick={handleAddNewCategory} className="ml-2">
											确定
										</button>
										<button
											onClick={() => setShowNewCategoryForm(false)}
											className="ml-2"
										>
											取消
										</button>
									</div>
								) : (
									<div className="flex">
										<select
											id="category"
											name="category"
											value={formData.category}
											onChange={handleInputChange}
											className="flex-grow"
										>
											<option value="">-- 选择分类 --</option>
											{allCategories.map((category) => (
												<option key={category.value} value={category.value}>
													{category.label}
												</option>
											))}
										</select>
										<button
											onClick={() => setShowNewCategoryForm(true)}
											className="ml-2"
										>
											新分类
										</button>
									</div>
								)}
							</div>

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
								<label htmlFor="content">内容</label>
								<textarea
									id="content"
									name="content"
									rows={10}
									value={formData.content}
									onChange={handleInputChange}
									className="w-full"
								/>
							</div>

							<div className="field-row mt-4">
								<button onClick={handleCancel} className="mr-2">
									取消
								</button>
								<button
									onClick={handleSave}
									disabled={!formData.category || !formData.title}
								>
									保存
								</button>
							</div>
						</div>
					) : (
						// 设定列表
						<div className="p-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg">
									{work ? `${work.title} - 世界观设定` : "世界观设定"}
								</h2>
								<button onClick={handleCreateNew}>创建新设定</button>
							</div>

							<div className="mb-4">
								<div className="mb-2">分类筛选:</div>
								<div className="flex flex-wrap gap-2">
									<button
										className={`px-2 py-1 border ${
											selectedCategory === "all"
												? "bg-blue-100 border-blue-500"
												: ""
										}`}
										onClick={() => setSelectedCategory("all")}
									>
										全部
									</button>
									{allCategories.map((category) => (
										<button
											key={category.value}
											className={`px-2 py-1 border ${
												selectedCategory === category.value
													? "bg-blue-100 border-blue-500"
													: ""
											}`}
											onClick={() => setSelectedCategory(category.value)}
										>
											{category.label}
										</button>
									))}
								</div>
							</div>

							{filteredSettings.length === 0 ? (
								<p>
									暂无
									{selectedCategory !== "all"
										? allCategories.find((c) => c.value === selectedCategory)
												?.label || selectedCategory
										: ""}
									设定，点击&quot;创建新设定&quot;按钮添加。
								</p>
							) : (
								<div className="grid grid-cols-2 gap-4">
									{filteredSettings.map((setting) => (
										<div
											key={setting.id}
											className="border p-3 cursor-pointer hover:bg-gray-50"
											onClick={() => handleSelectSetting(setting)}
										>
											<div className="flex justify-between">
												<h3 className="font-bold">{setting.title}</h3>
												<span className="text-sm bg-blue-100 px-2 py-1 rounded">
													{allCategories.find(
														(c) => c.value === setting.category
													)?.label || setting.category}
												</span>
											</div>
											<p className="line-clamp-3 text-sm mt-2">
												{setting.content || "无详细内容"}
											</p>
											<div className="mt-2 flex justify-end">
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(setting);
													}}
													className="text-red-500"
												>
													删除
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default WorldSettingsWindows;
