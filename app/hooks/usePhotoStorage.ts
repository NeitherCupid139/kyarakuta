import { useCallback, useState, useEffect } from "react";

// 定义照片类型
export interface Photo {
	id: number;
	url: string;
	title?: string;
	category?: string;
	filter?: string;
	takenAt: Date;
}

// 定义分类类型
export interface Category {
	id: number;
	name: string;
	count: number;
}

/**
 * usePhotoStorage
 * 负责照片的存储和管理
 */
export function usePhotoStorage() {
	// 状态
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	// 从 localStorage 加载照片
	useEffect(() => {
		const loadPhotos = () => {
			try {
				type SavedPhoto = {
					id: number;
					url: string;
					title?: string;
					category?: string;
					filter?: string;
					takenAt: string;
				};

				const savedPhotos = JSON.parse(
					localStorage.getItem("photos") || "[]"
				) as SavedPhoto[];
				setPhotos(
					savedPhotos.map((photo: SavedPhoto) => ({
						...photo,
						takenAt: new Date(photo.takenAt),
					}))
				);

				// 计算分类
				const categoryMap = new Map<string, number>();
				savedPhotos.forEach((photo: Photo) => {
					const category = photo.category || "未分类";
					categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
				});

				const categoryList: Category[] = Array.from(categoryMap.entries()).map(
					([name, count], id) => ({
						id,
						name,
						count,
					})
				);

				setCategories(categoryList);
			} catch (error) {
				console.error("加载照片失败:", error);
			} finally {
				setLoading(false);
			}
		};

		loadPhotos();
	}, []);

	// 保存照片
	const savePhoto = useCallback(
		(photoUrl: string, title?: string, category?: string) => {
			const newPhoto: Photo = {
				id: Date.now(),
				url: photoUrl,
				title,
				category,
				takenAt: new Date(),
			};

			setPhotos((prev) => {
				const updated = [...prev, newPhoto];
				localStorage.setItem("photos", JSON.stringify(updated));
				return updated;
			});

			// 更新分类
			setCategories((prev) => {
				const categoryName = category || "未分类";
				const existingCategory = prev.find((c) => c.name === categoryName);

				if (existingCategory) {
					return prev.map((c) =>
						c.name === categoryName ? { ...c, count: c.count + 1 } : c
					);
				} else {
					return [...prev, { id: prev.length, name: categoryName, count: 1 }];
				}
			});
		},
		[]
	);

	// 删除照片
	const deletePhoto = useCallback(
		(id: number) => {
			setPhotos((prev) => {
				const updated = prev.filter((photo) => photo.id !== id);
				localStorage.setItem("photos", JSON.stringify(updated));
				return updated;
			});

			// 更新分类计数
			setCategories((prev) => {
				const photo = photos.find((p) => p.id === id);
				if (!photo) return prev;

				const categoryName = photo.category || "未分类";
				return prev
					.map((c) => {
						if (c.name === categoryName) {
							const newCount = c.count - 1;
							return newCount > 0 ? { ...c, count: newCount } : null;
						}
						return c;
					})
					.filter((c): c is Category => c !== null);
			});
		},
		[photos]
	);

	// 更新照片
	const updatePhoto = useCallback((id: number, data: Partial<Photo>) => {
		setPhotos((prev) => {
			const updated = prev.map((photo) =>
				photo.id === id ? { ...photo, ...data } : photo
			);
			localStorage.setItem("photos", JSON.stringify(updated));
			return updated;
		});
	}, []);

	// 按分类获取照片
	const getPhotosByCategory = useCallback(
		(category: string) => {
			if (category === "全部") {
				return photos;
			}
			return photos.filter((photo) => photo.category === category);
		},
		[photos]
	);

	return {
		photos,
		categories,
		loading,
		savePhoto,
		deletePhoto,
		updatePhoto,
		getPhotosByCategory,
	};
}
