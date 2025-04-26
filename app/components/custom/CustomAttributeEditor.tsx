"use client";

import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

// 属性类型定义
type AttributeType =
	| "text"
	| "number"
	| "boolean"
	| "enum"
	| "date"
	| "image"
	| "color";

// 属性定义接口
interface AttributeDefinition {
	id: string;
	name: string;
	type: AttributeType;
	required: boolean;
	default?: string | number | boolean | null;
	options?: string[]; // 用于枚举类型
	min?: number; // 用于数字类型
	max?: number; // 用于数字类型
}

// 属性项组件的Props
interface AttributeItemProps {
	attribute: AttributeDefinition;
	index: number;
	moveAttribute: (dragIndex: number, hoverIndex: number) => void;
	updateAttribute: (id: string, updates: Partial<AttributeDefinition>) => void;
	removeAttribute: (id: string) => void;
}

// 拖拽项类型
const ItemTypes = {
	ATTRIBUTE: "attribute",
};

// 属性项组件（可拖拽）
const AttributeItem = ({
	attribute,
	index,
	moveAttribute,
	updateAttribute,
	removeAttribute,
}: AttributeItemProps) => {
	// 拖拽逻辑
	const [{ isDragging }, drag] = useDrag({
		type: ItemTypes.ATTRIBUTE,
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	// 放置逻辑
	const [, drop] = useDrop({
		accept: ItemTypes.ATTRIBUTE,
		hover: (item: { index: number }) => {
			if (item.index !== index) {
				moveAttribute(item.index, index);
				item.index = index;
			}
		},
	});

	// 处理属性值更新
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateAttribute(attribute.id, { name: e.target.value });
	};

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		updateAttribute(attribute.id, {
			type: e.target.value as AttributeType,
			// 重置相关选项
			options: e.target.value === "enum" ? ["选项1"] : undefined,
			min: e.target.value === "number" ? 0 : undefined,
			max: e.target.value === "number" ? 100 : undefined,
		});
	};

	const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateAttribute(attribute.id, { required: e.target.checked });
	};

	// 枚举类型选项管理
	const handleAddOption = () => {
		if (attribute.type === "enum") {
			const currentOptions = attribute.options || [];
			updateAttribute(attribute.id, {
				options: [...currentOptions, `选项${currentOptions.length + 1}`],
			});
		}
	};

	const handleOptionChange = (index: number, value: string) => {
		if (attribute.type === "enum" && attribute.options) {
			const newOptions = [...attribute.options];
			newOptions[index] = value;
			updateAttribute(attribute.id, { options: newOptions });
		}
	};

	const handleRemoveOption = (index: number) => {
		if (attribute.type === "enum" && attribute.options) {
			const newOptions = [...attribute.options];
			newOptions.splice(index, 1);
			updateAttribute(attribute.id, { options: newOptions });
		}
	};

	// 数字类型范围管理
	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateAttribute(attribute.id, { min: Number(e.target.value) });
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateAttribute(attribute.id, { max: Number(e.target.value) });
	};

	return (
		<div
			ref={(node) => drag(drop(node))}
			className={`window p-2 mb-2 cursor-move ${
				isDragging ? "opacity-50" : ""
			}`}
			style={{ opacity: isDragging ? 0.5 : 1 }}
		>
			<div className="title-bar">
				<div className="title-bar-text">属性 #{index + 1}</div>
				<div className="title-bar-controls">
					<button
						aria-label="Close"
						onClick={() => removeAttribute(attribute.id)}
					></button>
				</div>
			</div>
			<div className="window-body">
				<div className="field-row mb-2">
					<label className="w-24">名称:</label>
					<input
						type="text"
						value={attribute.name}
						onChange={handleNameChange}
						className="w-full"
					/>
				</div>

				<div className="field-row mb-2">
					<label className="w-24">类型:</label>
					<select
						value={attribute.type}
						onChange={handleTypeChange}
						className="w-full"
					>
						<option value="text">文本</option>
						<option value="number">数字</option>
						<option value="boolean">布尔值</option>
						<option value="enum">枚举</option>
						<option value="date">日期</option>
						<option value="image">图片</option>
						<option value="color">颜色</option>
					</select>
				</div>

				<div className="field-row mb-2">
					<input
						type="checkbox"
						checked={attribute.required}
						onChange={handleRequiredChange}
						id={`required-${attribute.id}`}
					/>
					<label htmlFor={`required-${attribute.id}`}>必填</label>
				</div>

				{/* 枚举类型的选项编辑 */}
				{attribute.type === "enum" && (
					<div className="mt-2">
						<div className="field-row-stacked mb-2">
							<label>枚举选项:</label>
							{attribute.options?.map((option, idx) => (
								<div key={idx} className="field-row my-1">
									<input
										type="text"
										value={option}
										onChange={(e) => handleOptionChange(idx, e.target.value)}
										className="flex-grow"
									/>
									<button
										className="ml-2"
										onClick={() => handleRemoveOption(idx)}
										disabled={attribute.options?.length === 1}
									>
										删除
									</button>
								</div>
							))}
							<button onClick={handleAddOption}>添加选项</button>
						</div>
					</div>
				)}

				{/* 数字类型的范围设置 */}
				{attribute.type === "number" && (
					<div className="mt-2">
						<div className="field-row mb-2">
							<label className="w-24">最小值:</label>
							<input
								type="number"
								value={attribute.min ?? 0}
								onChange={handleMinChange}
							/>
						</div>
						<div className="field-row mb-2">
							<label className="w-24">最大值:</label>
							<input
								type="number"
								value={attribute.max ?? 100}
								onChange={handleMaxChange}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// 主编辑器组件
export default function CustomAttributeEditor({
	initialAttributes = [],
	onSave,
	entityType = "character", // 实体类型：角色、事件等
}: {
	initialAttributes?: AttributeDefinition[];
	onSave?: (attributes: AttributeDefinition[]) => void;
	entityType?: string;
}) {
	// 属性列表状态
	const [attributes, setAttributes] =
		useState<AttributeDefinition[]>(initialAttributes);
	// 模板状态
	const [templates, setTemplates] = useState<{
		[key: string]: AttributeDefinition[];
	}>({});
	// 当前模板名称
	const [templateName, setTemplateName] = useState("");
	// 显示保存模板对话框
	const [showSaveTemplate, setShowSaveTemplate] = useState(false);
	// 显示加载模板对话框
	const [showLoadTemplate, setShowLoadTemplate] = useState(false);

	// 从本地存储加载模板
	useEffect(() => {
		const savedTemplates = localStorage.getItem("attributeTemplates");
		if (savedTemplates) {
			try {
				setTemplates(JSON.parse(savedTemplates));
			} catch (e) {
				console.error("Failed to parse saved templates", e);
			}
		}
	}, []);

	// 保存模板到本地存储
	const saveTemplatesToStorage = (newTemplates: {
		[key: string]: AttributeDefinition[];
	}) => {
		localStorage.setItem("attributeTemplates", JSON.stringify(newTemplates));
		setTemplates(newTemplates);
	};

	// 添加新属性
	const addAttribute = () => {
		const newAttribute: AttributeDefinition = {
			id: uuidv4(),
			name: `新属性${attributes.length + 1}`,
			type: "text",
			required: false,
		};
		setAttributes([...attributes, newAttribute]);
	};

	// 更新属性
	const updateAttribute = (
		id: string,
		updates: Partial<AttributeDefinition>
	) => {
		setAttributes(
			attributes.map((attr) =>
				attr.id === id ? { ...attr, ...updates } : attr
			)
		);
	};

	// 移除属性
	const removeAttribute = (id: string) => {
		setAttributes(attributes.filter((attr) => attr.id !== id));
	};

	// 移动属性（拖拽排序）
	const moveAttribute = (dragIndex: number, hoverIndex: number) => {
		const draggedItem = attributes[dragIndex];
		const newAttributes = [...attributes];
		newAttributes.splice(dragIndex, 1);
		newAttributes.splice(hoverIndex, 0, draggedItem);
		setAttributes(newAttributes);
	};

	// 保存模板
	const saveTemplate = () => {
		if (templateName.trim()) {
			const newTemplates = {
				...templates,
				[templateName]: attributes,
			};
			saveTemplatesToStorage(newTemplates);
			setShowSaveTemplate(false);
			setTemplateName("");
		}
	};

	// 加载模板
	const loadTemplate = (name: string) => {
		if (templates[name]) {
			// 生成新的ID以避免冲突
			const loadedAttributes = templates[name].map((attr) => ({
				...attr,
				id: uuidv4(),
			}));
			setAttributes(loadedAttributes);
			setShowLoadTemplate(false);
		}
	};

	// 删除模板
	const deleteTemplate = (name: string) => {
		const newTemplates = { ...templates };
		delete newTemplates[name];
		saveTemplatesToStorage(newTemplates);
	};

	// 保存属性定义
	const handleSave = () => {
		if (onSave) {
			onSave(attributes);
		}
	};

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="window" style={{ width: "100%" }}>
				<div className="title-bar">
					<div className="title-bar-text">自定义属性编辑器 - {entityType}</div>
				</div>
				<div className="window-body">
					<div className="field-row mb-4">
						<button onClick={addAttribute}>添加属性</button>
						<button className="ml-2" onClick={() => setShowSaveTemplate(true)}>
							保存为模板
						</button>
						<button className="ml-2" onClick={() => setShowLoadTemplate(true)}>
							加载模板
						</button>
						<button className="ml-2" onClick={handleSave}>
							保存属性定义
						</button>
					</div>

					{/* 属性列表 */}
					<div>
						{attributes.length === 0 ? (
							<div className="p-4 text-center">
								没有属性，点击"添加属性"开始创建
							</div>
						) : (
							attributes.map((attribute, index) => (
								<AttributeItem
									key={attribute.id}
									attribute={attribute}
									index={index}
									moveAttribute={moveAttribute}
									updateAttribute={updateAttribute}
									removeAttribute={removeAttribute}
								/>
							))
						)}
					</div>
				</div>
			</div>

			{/* 保存模板对话框 */}
			{showSaveTemplate && (
				<div className="window modal-dialog">
					<div className="title-bar">
						<div className="title-bar-text">保存为模板</div>
						<div className="title-bar-controls">
							<button
								aria-label="Close"
								onClick={() => setShowSaveTemplate(false)}
							></button>
						</div>
					</div>
					<div className="window-body">
						<div className="field-row-stacked mb-4">
							<label>模板名称:</label>
							<input
								type="text"
								value={templateName}
								onChange={(e) => setTemplateName(e.target.value)}
							/>
						</div>
						<div className="field-row">
							<button onClick={saveTemplate} disabled={!templateName.trim()}>
								保存
							</button>
							<button
								className="ml-2"
								onClick={() => setShowSaveTemplate(false)}
							>
								取消
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 加载模板对话框 */}
			{showLoadTemplate && (
				<div className="window modal-dialog">
					<div className="title-bar">
						<div className="title-bar-text">加载模板</div>
						<div className="title-bar-controls">
							<button
								aria-label="Close"
								onClick={() => setShowLoadTemplate(false)}
							></button>
						</div>
					</div>
					<div className="window-body">
						{Object.keys(templates).length === 0 ? (
							<div className="p-4 text-center">没有保存的模板</div>
						) : (
							<div className="h-64 overflow-auto">
								{Object.keys(templates).map((name) => (
									<div key={name} className="field-row mb-2 items-center">
										<div className="flex-grow">{name}</div>
										<button onClick={() => loadTemplate(name)}>加载</button>
										<button
											className="ml-2"
											onClick={() => deleteTemplate(name)}
										>
											删除
										</button>
									</div>
								))}
							</div>
						)}
						<div className="field-row mt-4">
							<button onClick={() => setShowLoadTemplate(false)}>关闭</button>
						</div>
					</div>
				</div>
			)}
		</DndProvider>
	);
}
