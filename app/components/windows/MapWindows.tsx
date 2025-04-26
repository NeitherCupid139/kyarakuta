"use client";

import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// 定义地图元素接口
interface MapElement {
	id: string;
	position: {
		x: number;
		y: number;
	};
	type: "character" | "building" | "enemy" | "npc" | "object";
	name: string;
	attributes: Record<string, string | number | boolean>; // 元素特定属性
}

// 定义地图数据接口
interface MapData {
	id: string;
	name: string;
	size: {
		width: number;
		height: number;
	};
	elements: MapElement[];
	gridSize: number; // 网格大小
	background?: string; // 背景图片
}

// 定义组件属性接口
interface MapWindowsProps {
	map?: MapData;
	onSave?: (map: MapData) => void;
}

// 默认地图数据
const defaultMap: MapData = {
	id: "default-map",
	name: "新地图",
	size: {
		width: 800,
		height: 600,
	},
	elements: [],
	gridSize: 20,
};

export default function MapWindows({
	map = defaultMap,
	onSave,
}: MapWindowsProps) {
	// 状态管理
	const [mapData, setMapData] = useState<MapData>(map);
	const [selectedElement, setSelectedElement] = useState<MapElement | null>(
		null
	);
	const [activeTool, setActiveTool] = useState<"select" | "place">("select");
	const [elementType, setElementType] = useState<
		"character" | "building" | "enemy" | "npc" | "object"
	>("character");
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [showLoadDialog, setShowLoadDialog] = useState(false);
	const [mapName, setMapName] = useState(map.name);
	const [savedMaps, setSavedMaps] = useState<MapData[]>([]);
	const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
	const [showPreviewDialog, setShowPreviewDialog] = useState(false);

	// 拖拽状态
	const [draggingElement, setDraggingElement] = useState<string | null>(null);
	const dragOffset = useRef({ x: 0, y: 0 });

	// 地图缩放和平移状态
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const panStart = useRef({ x: 0, y: 0 });
	const panOffset = useRef({ x: 0, y: 0 });

	// 加载保存的地图
	useEffect(() => {
		const loadSavedMaps = () => {
			try {
				const mapsJson = localStorage.getItem("savedMaps");
				if (mapsJson) {
					const maps = JSON.parse(mapsJson) as MapData[];
					setSavedMaps(maps);
				}
			} catch (error) {
				console.error("加载地图失败:", error);
			}
		};

		loadSavedMaps();
	}, []);

	// 保存地图
	const saveMap = () => {
		// 创建新的地图数据（更新名称和ID）
		const mapToSave: MapData = {
			...mapData,
			name: mapName,
			id: mapData.id === "default-map" ? uuidv4() : mapData.id,
		};

		try {
			// 更新保存的地图列表
			const updatedMaps = [
				...savedMaps.filter((m) => m.id !== mapToSave.id),
				mapToSave,
			];
			localStorage.setItem("savedMaps", JSON.stringify(updatedMaps));
			setSavedMaps(updatedMaps);

			// 更新当前地图
			setMapData(mapToSave);

			// 关闭保存对话框
			setShowSaveDialog(false);

			// 调用外部保存回调（如果存在）
			if (onSave) {
				onSave(mapToSave);
			}
		} catch (error) {
			console.error("保存地图失败:", error);
			alert("保存地图失败，请稍后重试。");
		}
	};

	// 加载地图
	const loadMap = () => {
		if (!selectedMapId) return;

		const mapToLoad = savedMaps.find((m) => m.id === selectedMapId);
		if (!mapToLoad) return;

		setMapData(mapToLoad);
		setMapName(mapToLoad.name);
		setSelectedElement(null);
		resetView();
		setShowLoadDialog(false);
	};

	// 删除保存的地图
	const deleteMap = (id: string) => {
		if (window.confirm("确定要删除此地图吗？此操作不可撤销。")) {
			const updatedMaps = savedMaps.filter((m) => m.id !== id);
			localStorage.setItem("savedMaps", JSON.stringify(updatedMaps));
			setSavedMaps(updatedMaps);

			if (selectedMapId === id) {
				setSelectedMapId(null);
			}
		}
	};

	// 处理缩放
	const handleZoom = (delta: number) => {
		setScale((prevScale) => {
			const newScale = Math.max(0.5, Math.min(2, prevScale + delta * 0.1));
			return newScale;
		});
	};

	// 处理键盘缩放
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "+" || e.key === "=") {
				handleZoom(1);
			} else if (e.key === "-" || e.key === "_") {
				handleZoom(-1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// 开始平移
	const startPanning = (e: React.MouseEvent) => {
		if (activeTool !== "select" || draggingElement) return;

		setIsPanning(true);
		panStart.current = {
			x: e.clientX,
			y: e.clientY,
		};
		panOffset.current = position;

		e.preventDefault();
	};

	// 处理平移移动
	const handlePanning = (e: React.MouseEvent) => {
		if (!isPanning) return;

		const dx = e.clientX - panStart.current.x;
		const dy = e.clientY - panStart.current.y;

		setPosition({
			x: panOffset.current.x + dx,
			y: panOffset.current.y + dy,
		});
	};

	// 结束平移
	const stopPanning = () => {
		setIsPanning(false);
	};

	// 处理地图点击，放置新元素
	const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (activeTool !== "place" || isPanning) return;

		// 获取点击位置相对于地图容器的坐标
		const container = e.currentTarget;
		const rect = container.getBoundingClientRect();

		// 计算实际坐标（考虑缩放和平移）
		const x = (e.clientX - rect.left - position.x) / scale;
		const y = (e.clientY - rect.top - position.y) / scale;

		// 对齐到网格
		const gridSize = mapData.gridSize;
		const gridX = Math.floor(x / gridSize) * gridSize;
		const gridY = Math.floor(y / gridSize) * gridSize;

		// 创建新元素
		const newElement: MapElement = {
			id: uuidv4(),
			position: { x: gridX, y: gridY },
			type: elementType,
			name: `新${getElementTypeName(elementType)}`,
			attributes: {},
		};

		// 更新地图数据
		setMapData({
			...mapData,
			elements: [...mapData.elements, newElement],
		});

		// 选中新创建的元素
		setSelectedElement(newElement);
	};

	// 开始拖拽元素
	const startDragging = (element: MapElement, e: React.MouseEvent) => {
		if (activeTool !== "select") return;

		// 设置当前拖拽元素
		setDraggingElement(element.id);

		// 计算光标相对于元素左上角的偏移（考虑缩放）
		const elementRect = e.currentTarget.getBoundingClientRect();
		dragOffset.current = {
			x: (e.clientX - elementRect.left) / scale,
			y: (e.clientY - elementRect.top) / scale,
		};

		// 阻止事件冒泡和默认行为
		e.stopPropagation();
		e.preventDefault();

		// 选中被拖拽的元素
		setSelectedElement(element);
	};

	// 处理拖拽移动
	const handleMouseMove = (e: React.MouseEvent) => {
		// 如果正在平移地图
		if (isPanning) {
			handlePanning(e);
			return;
		}

		// 如果正在拖拽元素
		if (draggingElement) {
			// 查找被拖拽的元素
			const element = mapData.elements.find((el) => el.id === draggingElement);
			if (!element) return;

			// 获取地图容器
			const container = e.currentTarget;
			const rect = container.getBoundingClientRect();

			// 计算新位置（考虑网格对齐、缩放和平移）
			const gridSize = mapData.gridSize;
			const newX =
				Math.floor(
					((e.clientX - rect.left - position.x) / scale -
						dragOffset.current.x) /
						gridSize
				) * gridSize;
			const newY =
				Math.floor(
					((e.clientY - rect.top - position.y) / scale - dragOffset.current.y) /
						gridSize
				) * gridSize;

			// 边界检查
			const maxX = mapData.size.width - gridSize;
			const maxY = mapData.size.height - gridSize;
			const x = Math.max(0, Math.min(newX, maxX));
			const y = Math.max(0, Math.min(newY, maxY));

			// 更新元素位置
			const updatedElement = { ...element, position: { x, y } };

			// 更新地图数据
			setMapData({
				...mapData,
				elements: mapData.elements.map((el) =>
					el.id === draggingElement ? updatedElement : el
				),
			});

			// 更新选中元素
			if (selectedElement && selectedElement.id === draggingElement) {
				setSelectedElement(updatedElement);
			}
		}
	};

	// 结束拖拽
	const stopDragging = () => {
		setDraggingElement(null);
		stopPanning();
	};

	// 获取元素类型名称
	const getElementTypeName = (type: string): string => {
		switch (type) {
			case "character":
				return "角色";
			case "building":
				return "建筑";
			case "enemy":
				return "敌人";
			case "npc":
				return "NPC";
			case "object":
				return "物品";
			default:
				return "元素";
		}
	};

	// 更新元素名称
	const updateElementName = (name: string) => {
		if (!selectedElement) return;

		// 更新选中元素
		const updatedElement = { ...selectedElement, name };
		setSelectedElement(updatedElement);

		// 更新地图数据
		setMapData({
			...mapData,
			elements: mapData.elements.map((el) =>
				el.id === selectedElement.id ? updatedElement : el
			),
		});
	};

	// 删除元素
	const deleteElement = () => {
		if (!selectedElement) return;

		// 更新地图数据，移除选中元素
		setMapData({
			...mapData,
			elements: mapData.elements.filter((el) => el.id !== selectedElement.id),
		});

		// 清空选中状态
		setSelectedElement(null);
	};

	// 重置视图
	const resetView = () => {
		setScale(1);
		setPosition({ x: 0, y: 0 });
	};

	// 保存对话框组件
	const SaveDialog = () => (
		<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="window" style={{ width: 400 }}>
				<div className="title-bar">
					<div className="title-bar-text">保存地图</div>
					<div className="title-bar-controls">
						<button
							aria-label="Close"
							onClick={() => setShowSaveDialog(false)}
						></button>
					</div>
				</div>
				<div className="window-body p-4">
					<div className="field-row-stacked mb-4">
						<label htmlFor="map-name">地图名称:</label>
						<input
							id="map-name"
							type="text"
							value={mapName}
							onChange={(e) => setMapName(e.target.value)}
						/>
					</div>
					<div className="field-row-stacked mb-4">
						<label>地图信息:</label>
						<div className="p-2 border">
							<p>
								尺寸: {mapData.size.width} x {mapData.size.height}
							</p>
							<p>元素数量: {mapData.elements.length}</p>
						</div>
					</div>
					<div className="field-row justify-end">
						<button onClick={() => setShowSaveDialog(false)} className="mr-2">
							取消
						</button>
						<button onClick={saveMap} disabled={!mapName.trim()}>
							保存
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// 加载对话框组件
	const LoadDialog = () => (
		<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="window" style={{ width: 500 }}>
				<div className="title-bar">
					<div className="title-bar-text">加载地图</div>
					<div className="title-bar-controls">
						<button
							aria-label="Close"
							onClick={() => setShowLoadDialog(false)}
						></button>
					</div>
				</div>
				<div className="window-body p-4">
					{savedMaps.length === 0 ? (
						<div className="p-4 text-center">没有保存的地图</div>
					) : (
						<div className="mb-4" style={{ height: 300, overflow: "auto" }}>
							<table className="w-full">
								<thead>
									<tr>
										<th>选择</th>
										<th>名称</th>
										<th>尺寸</th>
										<th>元素数量</th>
										<th>操作</th>
									</tr>
								</thead>
								<tbody>
									{savedMaps.map((m) => (
										<tr
											key={m.id}
											className={selectedMapId === m.id ? "bg-blue-100" : ""}
										>
											<td className="text-center">
												<input
													type="radio"
													name="map-select"
													checked={selectedMapId === m.id}
													onChange={() => setSelectedMapId(m.id)}
												/>
											</td>
											<td>{m.name}</td>
											<td>
												{m.size.width} x {m.size.height}
											</td>
											<td>{m.elements.length}</td>
											<td>
												<button onClick={() => deleteMap(m.id)} title="删除">
													删除
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					<div className="field-row justify-end">
						<button onClick={() => setShowLoadDialog(false)} className="mr-2">
							取消
						</button>
						<button
							onClick={loadMap}
							disabled={!selectedMapId || savedMaps.length === 0}
						>
							加载
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// 地图编辑工具栏组件
	const MapHeader = () => (
		<div className="flex items-center p-2 border-b border-gray-400">
			<div className="field-row">
				<label htmlFor="tool-select">工具:</label>
				<select
					id="tool-select"
					value={activeTool}
					onChange={(e) => setActiveTool(e.target.value as "select" | "place")}
					className="w-24"
				>
					<option value="select">选择</option>
					<option value="place">放置</option>
				</select>
			</div>

			<div className="field-row ml-4">
				<label htmlFor="element-type">元素类型:</label>
				<select
					id="element-type"
					value={elementType}
					onChange={(e) =>
						setElementType(
							e.target.value as
								| "character"
								| "building"
								| "enemy"
								| "npc"
								| "object"
						)
					}
					className="w-24"
					disabled={activeTool !== "place"}
				>
					<option value="character">角色</option>
					<option value="building">建筑</option>
					<option value="enemy">敌人</option>
					<option value="npc">NPC</option>
					<option value="object">物品</option>
				</select>
			</div>

			<div className="field-row ml-4">
				<button onClick={() => handleZoom(1)} className="px-2">
					+
				</button>
				<button onClick={() => handleZoom(-1)} className="px-2 ml-1">
					-
				</button>
				<button onClick={resetView} className="ml-1" title="重置视图">
					重置
				</button>
				<span className="ml-2">{Math.round(scale * 100)}%</span>
			</div>

			<div className="ml-auto flex">
				<button className="mr-2" onClick={() => setShowPreviewDialog(true)}>
					预览
				</button>
				<button className="mr-2" onClick={() => setShowLoadDialog(true)}>
					加载
				</button>
				<button onClick={() => setShowSaveDialog(true)}>保存</button>
			</div>
		</div>
	);

	// 地图网格组件
	const MapGrid = () => (
		<div
			className="relative w-full h-full bg-white overflow-auto"
			style={{
				cursor: isPanning
					? "grabbing"
					: activeTool === "select"
					? "grab"
					: "crosshair",
			}}
			onClick={handleMapClick}
			onMouseMove={handleMouseMove}
			onMouseUp={stopDragging}
			onMouseLeave={stopDragging}
			onMouseDown={(e) =>
				activeTool === "select" && !draggingElement && startPanning(e)
			}
		>
			{/* 地图画布（支持缩放和平移） */}
			<div
				className="absolute"
				style={{
					transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
					transformOrigin: "0 0",
					width: mapData.size.width,
					height: mapData.size.height,
					backgroundSize: `${mapData.gridSize}px ${mapData.gridSize}px`,
					backgroundImage:
						"linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
				}}
			>
				{/* 地图元素 */}
				{mapData.elements.map((element) => (
					<div
						key={element.id}
						className={`absolute border flex items-center justify-center text-sm`}
						style={{
							left: `${element.position.x}px`,
							top: `${element.position.y}px`,
							width: `${mapData.gridSize}px`,
							height: `${mapData.gridSize}px`,
							backgroundColor: getElementColor(element.type),
							borderColor:
								selectedElement?.id === element.id ? "#2ecc71" : "#3498db",
							borderWidth: selectedElement?.id === element.id ? "2px" : "1px",
							zIndex: selectedElement?.id === element.id ? 10 : 1,
							cursor: activeTool === "select" ? "move" : "pointer",
						}}
						onClick={(e) => {
							e.stopPropagation(); // 防止触发地图点击事件
							setSelectedElement(element);
						}}
						onMouseDown={(e) => startDragging(element, e)}
					>
						{element.name.charAt(0)}
					</div>
				))}
			</div>

			{/* 缩放和位置信息 */}
			<div className="absolute bottom-1 right-1 text-xs bg-white bg-opacity-70 px-1 rounded">
				缩放: {Math.round(scale * 100)}% | 位置: X:
				{-Math.round(position.x / scale)}, Y:{-Math.round(position.y / scale)}
			</div>
		</div>
	);

	// 获取元素颜色
	const getElementColor = (type: string) => {
		switch (type) {
			case "character":
				return "rgba(52, 152, 219, 0.5)";
			case "building":
				return "rgba(155, 89, 182, 0.5)";
			case "enemy":
				return "rgba(231, 76, 60, 0.5)";
			case "npc":
				return "rgba(46, 204, 113, 0.5)";
			case "object":
				return "rgba(241, 196, 15, 0.5)";
			default:
				return "rgba(189, 195, 199, 0.5)";
		}
	};

	// 元素属性面板
	const ElementDetailPanel = () => {
		if (!selectedElement) return null;

		return (
			<div className="p-2 border-t border-gray-400">
				<div className="window-body">
					<div className="field-row-stacked">
						<label htmlFor="element-name">名称:</label>
						<input
							id="element-name"
							type="text"
							value={selectedElement.name}
							onChange={(e) => updateElementName(e.target.value)}
						/>
					</div>
					<div className="field-row mt-2">
						<label>位置:</label>
						<span>
							X: {selectedElement.position.x}, Y: {selectedElement.position.y}
						</span>
					</div>
					<div className="field-row mt-2">
						<label>类型:</label>
						<span>{getElementTypeName(selectedElement.type)}</span>
					</div>
					<button className="mt-2" onClick={deleteElement}>
						删除元素
					</button>
				</div>
			</div>
		);
	};

	// 地图预览对话框
	const PreviewDialog = () => {
		// 计算地图边界
		const mapWidth = mapData.size.width;
		const mapHeight = mapData.size.height;

		// 根据容器大小自动调整预览图比例
		const containerWidth = 600;
		const containerHeight = 450;
		const previewScale = Math.min(
			containerWidth / mapWidth,
			containerHeight / mapHeight
		);

		return (
			<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
				<div className="window" style={{ width: containerWidth + 50 }}>
					<div className="title-bar">
						<div className="title-bar-text">地图预览 - {mapData.name}</div>
						<div className="title-bar-controls">
							<button
								aria-label="Close"
								onClick={() => setShowPreviewDialog(false)}
							></button>
						</div>
					</div>
					<div className="window-body p-4">
						<div className="mb-2">
							<p>
								地图尺寸: {mapWidth} x {mapHeight}
							</p>
							<p>元素数量: {mapData.elements.length}</p>
						</div>

						{/* 地图预览区 */}
						<div
							className="border relative mx-auto overflow-hidden"
							style={{
								width: Math.min(mapWidth * previewScale, containerWidth),
								height: Math.min(mapHeight * previewScale, containerHeight),
								backgroundColor: "#f8f9fa",
							}}
						>
							{/* 渲染网格线 */}
							<div
								className="absolute inset-0"
								style={{
									backgroundSize: `${mapData.gridSize * previewScale}px ${
										mapData.gridSize * previewScale
									}px`,
									backgroundImage:
										"linear-gradient(to right, #e9ecef 1px, transparent 1px), linear-gradient(to bottom, #e9ecef 1px, transparent 1px)",
								}}
							/>

							{/* 渲染元素 */}
							{mapData.elements.map((element) => (
								<div
									key={element.id}
									className="absolute border"
									style={{
										left: `${element.position.x * previewScale}px`,
										top: `${element.position.y * previewScale}px`,
										width: `${mapData.gridSize * previewScale}px`,
										height: `${mapData.gridSize * previewScale}px`,
										backgroundColor: getElementColor(element.type).replace(
											"0.5",
											"0.8"
										),
										borderColor: "#3498db",
									}}
								>
									<div
										className="w-full h-full flex items-center justify-center text-xs text-white"
										style={{
											textShadow: "0px 0px 2px rgba(0,0,0,0.7)",
											overflow: "hidden",
										}}
									>
										{element.name.charAt(0)}
									</div>
								</div>
							))}
						</div>

						{/* 图例 */}
						<div className="mt-4 border p-2">
							<div className="text-sm font-bold mb-1">图例:</div>
							<div className="grid grid-cols-2 gap-2">
								{["character", "building", "enemy", "npc", "object"].map(
									(type) => (
										<div key={type} className="flex items-center">
											<div
												className="w-4 h-4 mr-1"
												style={{
													backgroundColor: getElementColor(type).replace(
														"0.5",
														"0.8"
													),
												}}
											/>
											<span className="text-xs">
												{getElementTypeName(type)}
											</span>
										</div>
									)
								)}
							</div>
						</div>

						<div className="field-row justify-end mt-4">
							<button onClick={() => setShowPreviewDialog(false)}>关闭</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div
			className="window-body"
			style={{
				height: "100%",
				overflow: "auto",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* 保存对话框 */}
			{showSaveDialog && <SaveDialog />}

			{/* 加载对话框 */}
			{showLoadDialog && <LoadDialog />}

			{/* 地图预览对话框 */}
			{showPreviewDialog && <PreviewDialog />}

			{/* 地图页眉 */}
			<MapHeader />

			{/* 地图网格 */}
			<div
				style={{
					position: "relative",
					overflow: "hidden",
					border: "1px solid #000",
					margin: "10px 0",
					flex: "1 1 auto",
					background: "#f0f0f0",
				}}
			>
				<MapGrid />
			</div>

			{/* 元素详情面板 */}
			{selectedElement && <ElementDetailPanel />}
		</div>
	);
}
