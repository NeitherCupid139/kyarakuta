"use client";

import React, { useState, useEffect } from "react";
import "98.css";
import { usePhotoStorage, Photo, Category } from "@/app/hooks/usePhotoStorage";
import Image from "next/image";
import { Modal } from "@/app/components/windows/ModalWindows";

// 滤镜效果定义
const FILTERS = [
	{ id: "normal", name: "原图", style: {} },
	{ id: "grayscale", name: "黑白", style: { filter: "grayscale(100%)" } },
	{ id: "sepia", name: "复古", style: { filter: "sepia(100%)" } },
	{ id: "blur", name: "模糊", style: { filter: "blur(2px)" } },
	{ id: "brightness", name: "明亮", style: { filter: "brightness(150%)" } },
	{ id: "contrast", name: "高对比度", style: { filter: "contrast(200%)" } },
	{
		id: "hue-rotate",
		name: "色相旋转",
		style: { filter: "hue-rotate(180deg)" },
	},
	{ id: "invert", name: "反色", style: { filter: "invert(100%)" } },
	{ id: "saturate", name: "饱和", style: { filter: "saturate(200%)" } },
];

/**
 * 照片网格组件
 * 以网格形式展示照片列表
 */
const PhotoGrid: React.FC<{
	photos: Photo[];
	onPhotoSelect: (photo: Photo) => void;
	onPhotoDelete: (id: number) => void;
}> = ({ photos, onPhotoSelect, onPhotoDelete }) => {
	return (
		<div className="grid grid-cols-4 gap-2 overflow-auto p-2 h-[300px]">
			{photos.length === 0 ? (
				<div className="col-span-4 flex items-center justify-center h-full text-gray-500">
					<Image
						src="/icons/camera.png"
						width={24}
						height={24}
						alt="相机"
						className="mr-2"
					/>
					暂无照片，请使用相机拍摄
				</div>
			) : (
				photos.map((photo) => (
					<div
						key={photo.id}
						className="relative cursor-pointer border border-gray-400 group hover:border-blue-500"
						onClick={() => onPhotoSelect(photo)}
					>
						<div className="w-full h-24 overflow-hidden">
							<img
								src={photo.url}
								alt={photo.title}
								className="w-full h-full object-cover transition-transform group-hover:scale-105"
								style={
									photo.filter
										? FILTERS.find((f) => f.id === photo.filter)?.style
										: {}
								}
							/>
						</div>
						<div className="absolute top-1 right-1 hidden group-hover:block">
							<button
								className="window-button w-5 h-5 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800"
								onClick={(e) => {
									e.stopPropagation();
									onPhotoDelete(photo.id);
								}}
								title="删除照片"
							>
								×
							</button>
						</div>
						{photo.filter && photo.filter !== "normal" && (
							<div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1">
								{FILTERS.find((f) => f.id === photo.filter)?.name}
							</div>
						)}
					</div>
				))
			)}
		</div>
	);
};

/**
 * 照片分类侧边栏组件
 */
const CategorySidebar: React.FC<{
	categories: Category[];
	selectedCategory: string;
	onCategorySelect: (categoryName: string) => void;
}> = ({ categories, selectedCategory, onCategorySelect }) => {
	return (
		<div className="w-1/4 border-right border h-full overflow-hidden flex flex-col">
			<div className="window-title flex items-center p-1">
				<Image
					src="/icons/album.png"
					width={16}
					height={16}
					alt="相册"
					className="mr-1"
				/>
				<span>照片分类</span>
			</div>
			<ul className="tree-view flex-1 overflow-auto">
				{categories.map((category) => (
					<li
						key={category.id}
						className={`flex items-center px-1 py-1 cursor-pointer hover:bg-blue-100 ${
							selectedCategory === category.name ? "selected" : ""
						}`}
						onClick={() => onCategorySelect(category.name)}
					>
						<span className="flex-1">{category.name}</span>
						<span className="bg-gray-200 rounded-full px-2 text-xs">
							{category.count}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};

/**
 * 滤镜选择组件
 */
const FilterSelector: React.FC<{
	selectedFilter: string;
	onFilterSelect: (filterId: string) => void;
}> = ({ selectedFilter, onFilterSelect }) => {
	return (
		<div className="p-2 bg-gray-100 border-t">
			<div className="text-sm font-bold mb-1 flex items-center">
				<Image
					src="/icons/custom.png"
					width={16}
					height={16}
					alt="滤镜"
					className="mr-1"
				/>
				滤镜效果:
			</div>
			<div className="flex flex-wrap gap-1">
				{FILTERS.map((filter) => (
					<button
						key={filter.id}
						className={`px-2 py-1 text-xs border ${
							selectedFilter === filter.id
								? "bg-blue-200 border-blue-500"
								: "bg-white border-gray-300 hover:bg-gray-100"
						}`}
						onClick={() => onFilterSelect(filter.id)}
					>
						{filter.name}
					</button>
				))}
			</div>
		</div>
	);
};

/**
 * 照片详情组件
 */
const PhotoDetail: React.FC<{
	photo: Photo | null;
	onClose: () => void;
	onUpdatePhoto: (id: number, data: Partial<Photo>) => void;
}> = ({ photo, onClose, onUpdatePhoto }) => {
	const [activeFilter, setActiveFilter] = useState<string>(
		photo?.filter || "normal"
	);

	// 当选择的照片变化时，更新当前滤镜
	useEffect(() => {
		if (photo) {
			setActiveFilter(photo.filter || "normal");
		}
	}, [photo]);

	if (!photo) return null;

	// 应用滤镜
	const applyFilter = (filterId: string) => {
		setActiveFilter(filterId);
		onUpdatePhoto(photo.id, { filter: filterId });
	};

	// 获取当前滤镜样式
	const currentFilterStyle =
		FILTERS.find((f) => f.id === activeFilter)?.style || {};

	return (
		<div className="window flex flex-col absolute inset-0 z-10 h-full">
			<div className="title-bar">
				<div className="title-bar-text flex items-center">
					<Image
						src="/icons/album.png"
						width={16}
						height={16}
						alt="相册"
						className="mr-2"
					/>
					{photo.title || "照片预览"}
				</div>
				<div className="title-bar-controls">
					<button aria-label="关闭" onClick={onClose}></button>
				</div>
			</div>
			<div className="window-body flex-1 overflow-hidden flex flex-col">
				<div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 relative">
					<img
						src={photo.url}
						alt={photo.title}
						className="max-h-full max-w-full object-contain"
						style={currentFilterStyle}
					/>
				</div>

				{/* 照片信息区 */}
				<div className="p-2 bg-gray-100 flex items-center">
					<div className="flex-1">
						<p className="text-sm">
							拍摄时间: {photo.takenAt.toLocaleString()}
						</p>
						{photo.category && (
							<p className="text-sm">分类: {photo.category}</p>
						)}
					</div>
					<button className="px-2 py-1 flex items-center bg-blue-50 border border-blue-300 hover:bg-blue-100">
						<Image
							src="/icons/work.png"
							width={16}
							height={16}
							alt="下载"
							className="mr-1"
						/>
						下载
					</button>
				</div>

				{/* 滤镜选择器 */}
				<FilterSelector
					selectedFilter={activeFilter}
					onFilterSelect={applyFilter}
				/>
			</div>
		</div>
	);
};

/**
 * 相册窗口组件
 */
export default function AlbumWindows() {
	// 使用照片存储hook
	const { categories, loading, deletePhoto, getPhotosByCategory, updatePhoto } =
		usePhotoStorage();

	// 当前选中的分类和照片
	const [selectedCategory, setSelectedCategory] = useState<string>("全部");
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

	// 获取当前分类下的照片
	const filteredPhotos = getPhotosByCategory(selectedCategory);

	// 处理照片选择
	const handlePhotoSelect = (photo: Photo) => {
		setSelectedPhoto(photo);
	};

	// 处理照片删除
	const handlePhotoDelete = async (id: number) => {
		// 使用Modal.confirm替代window.confirm
		const confirmed = await Modal.confirm("确定要删除这张照片吗？", {
			title: "删除照片",
			icon: "/icons/delete.png",
		});

		if (confirmed) {
			deletePhoto(id);
			// 如果删除的是当前选中的照片，清除选中状态
			if (selectedPhoto && selectedPhoto.id === id) {
				setSelectedPhoto(null);
			}
		}
	};

	// 处理照片更新
	const handleUpdatePhoto = (id: number, data: Partial<Photo>) => {
		updatePhoto(id, data);
		// 更新当前选中的照片
		if (selectedPhoto && selectedPhoto.id === id) {
			setSelectedPhoto((prev) => (prev ? { ...prev, ...data } : null));
		}
	};

	// 处理分类选择
	const handleCategorySelect = (categoryName: string) => {
		setSelectedCategory(categoryName);
	};

	// 关闭照片详情
	const handleCloseDetail = () => {
		setSelectedPhoto(null);
	};

	return (
		<div className="window-body flex h-full relative">
			{/* 显示加载状态 */}
			{loading ? (
				<div className="flex items-center justify-center w-full">
					<div className="text-center">
						<p>加载照片中...</p>
						<progress></progress>
					</div>
				</div>
			) : (
				<>
					{/* 分类侧边栏 */}
					<CategorySidebar
						categories={categories}
						selectedCategory={selectedCategory}
						onCategorySelect={handleCategorySelect}
					/>

					{/* 主内容区 */}
					<div className="w-3/4 flex flex-col">
						<div className="window-title flex items-center p-1">
							<Image
								src="/icons/camera.png"
								width={16}
								height={16}
								alt="照片"
								className="mr-1"
							/>
							<span>{selectedCategory} 照片</span>
							<span className="ml-2 text-xs">({filteredPhotos.length}张)</span>
						</div>

						{/* 照片网格 */}
						<PhotoGrid
							photos={filteredPhotos}
							onPhotoSelect={handlePhotoSelect}
							onPhotoDelete={handlePhotoDelete}
						/>
					</div>

					{/* 照片详情弹窗 */}
					{selectedPhoto && (
						<PhotoDetail
							photo={selectedPhoto}
							onClose={handleCloseDetail}
							onUpdatePhoto={handleUpdatePhoto}
						/>
					)}
				</>
			)}
		</div>
	);
}
