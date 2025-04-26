import { useState, useEffect } from "react";

// 照片数据类型定义
export interface Photo {
	id: number;
	url: string;
	title: string;
	takenAt: Date;
	category?: string;
	filter?: string;
}

// 相册分类类型定义
export interface Category {
	id: number;
	name: string;
	count: number;
}

// 默认分类
const defaultCategories: Category[] = [
	{ id: 1, name: "全部", count: 0 },
	{ id: 2, name: "未分类", count: 0 },
];

/**
 * 照片存储管理 Hook
 * 负责照片的增删改查和持久化存储
 */
export function usePhotoStorage() {
	// 照片状态
	const [photos, setPhotos] = useState<Photo[]>([]);
	// 分类状态
	const [categories, setCategories] = useState<Category[]>(defaultCategories);
	// 加载状态
	const [loading, setLoading] = useState(true);

	// 初始化时从本地存储加载数据
	useEffect(() => {
		const loadPhotos = () => {
			try {
				const savedPhotos = localStorage.getItem("photos");
				const savedCategories = localStorage.getItem("categories");

				if (savedPhotos) {
					// 解析日期字符串为 Date 对象
					const parsedPhotos = JSON.parse(savedPhotos).map(
						(photo: Record<string, unknown>) => ({
							...photo,
							takenAt: new Date(photo.takenAt as string),
						})
					);
					setPhotos(parsedPhotos);
				}

				if (savedCategories) {
					setCategories(JSON.parse(savedCategories));
				}
			} catch (error) {
				console.error("加载照片数据失败:", error);
			} finally {
				setLoading(false);
			}
		};

		loadPhotos();
	}, []);

	// 当数据变化时保存到本地存储
	useEffect(() => {
		if (!loading) {
			localStorage.setItem("photos", JSON.stringify(photos));
			localStorage.setItem("categories", JSON.stringify(categories));
		}
	}, [photos, categories, loading]);

	/**
	 * 添加新照片
	 */
	const addPhoto = (photo: Omit<Photo, "id">) => {
		const newPhoto = {
			id: Date.now(),
			...photo,
		};

		setPhotos((prev) => [...prev, newPhoto]);

		// 更新分类计数
		updateCategoryCount(photo.category || "未分类");

		return newPhoto;
	};

	/**
	 * 更新照片信息
	 */
	const updatePhoto = (id: number, photoData: Partial<Omit<Photo, "id">>) => {
		setPhotos((prev) => {
			const photo = prev.find((p) => p.id === id);

			// 如果分类变更，需要更新分类计数
			if (
				photo &&
				photoData.category &&
				photoData.category !== photo.category
			) {
				updateCategoryCount(photoData.category);
				if (photo.category) {
					updateCategoryCount(photo.category, -1);
				}
			}

			return prev.map((p) => (p.id === id ? { ...p, ...photoData } : p));
		});
	};

	/**
	 * 删除照片
	 */
	const deletePhoto = (id: number) => {
		setPhotos((prev) => {
			// 找到要删除的照片，以便更新分类计数
			const photo = prev.find((p) => p.id === id);
			if (photo && photo.category) {
				updateCategoryCount(photo.category, -1);
			}

			return prev.filter((p) => p.id !== id);
		});
	};

	/**
	 * 添加新分类
	 */
	const addCategory = (name: string) => {
		const newCategory = {
			id: Date.now(),
			name,
			count: 0,
		};

		setCategories((prev) => [...prev, newCategory]);
		return newCategory;
	};

	/**
	 * 更新分类计数
	 */
	const updateCategoryCount = (categoryName: string, increment = 1) => {
		setCategories((prev) => {
			// 查找分类，不存在则创建
			const category = prev.find((c) => c.name === categoryName);

			if (!category && categoryName !== "全部") {
				// 如果是新分类，先添加它
				const newCategory = {
					id: Date.now(),
					name: categoryName,
					count: 0,
				};

				return [...prev, { ...newCategory, count: increment }];
			}

			// 更新分类计数
			return prev.map((c) => {
				if (c.name === "全部" || c.name === categoryName) {
					return { ...c, count: c.count + increment };
				}
				return c;
			});
		});
	};

	/**
	 * 按分类获取照片
	 */
	const getPhotosByCategory = (categoryName: string) => {
		if (categoryName === "全部") {
			return photos;
		}

		return photos.filter((photo) =>
			categoryName === "未分类"
				? !photo.category
				: photo.category === categoryName
		);
	};

	return {
		photos,
		categories,
		loading,
		addPhoto,
		updatePhoto,
		deletePhoto,
		addCategory,
		getPhotosByCategory,
	};
}
