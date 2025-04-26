"use client";

import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import Image from "next/image";

// 属性类型定义（需与编辑器保持一致）
type AttributeType =
	| "text"
	| "number"
	| "boolean"
	| "enum"
	| "date"
	| "image"
	| "color";

// 属性值类型
type AttributeValueType = string | number | boolean | null;

// 属性定义接口
interface AttributeDefinition {
	id: string;
	name: string;
	type: AttributeType;
	required: boolean;
	default?: AttributeValueType;
	options?: string[]; // 用于枚举类型
	min?: number; // 用于数字类型
	max?: number; // 用于数字类型
}

// 单个属性渲染组件
const AttributeDisplay = ({
	attribute,
	value,
	onEdit,
	readOnly = false,
}: {
	attribute: AttributeDefinition;
	value: AttributeValueType;
	onEdit?: (id: string, newValue: AttributeValueType) => void;
	readOnly?: boolean;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState<AttributeValueType>(value);

	// 处理值更新
	const handleValueChange = (newValue: AttributeValueType) => {
		setEditValue(newValue);
	};

	// 保存编辑的值
	const handleSave = () => {
		if (onEdit) {
			onEdit(attribute.id, editValue);
		}
		setIsEditing(false);
	};

	// 取消编辑
	const handleCancel = () => {
		setEditValue(value);
		setIsEditing(false);
	};

	// 渲染不同类型的值查看模式
	const renderValue = () => {
		switch (attribute.type) {
			case "text":
				return <div className="p-1">{value || "（空）"}</div>;

			case "number":
				if (attribute.min !== undefined && attribute.max !== undefined) {
					return (
						<div>
							<ProgressBar
								value={Number(value)}
								min={attribute.min}
								max={attribute.max}
							/>
							<div className="text-center">{value}</div>
						</div>
					);
				}
				return <div className="p-1">{value !== null ? value : "（空）"}</div>;

			case "boolean":
				return (
					<div className="field-row">
						<input
							type="checkbox"
							checked={Boolean(value)}
							disabled={true}
							id={`attr-${attribute.id}`}
						/>
						<label htmlFor={`attr-${attribute.id}`}>
							{Boolean(value) ? "是" : "否"}
						</label>
					</div>
				);

			case "enum":
				return <div className="p-1">{value || "（未选择）"}</div>;

			case "date":
				return (
					<div className="p-1">
						{value
							? new Date(value as string).toLocaleDateString("zh-CN")
							: "（未设置）"}
					</div>
				);

			case "image":
				if (value) {
					return (
						<div className="text-center">
							<Image
								src={value as string}
								alt={attribute.name}
								width={100}
								height={100}
								className="object-cover"
							/>
						</div>
					);
				}
				return <div className="p-1">（无图片）</div>;

			case "color":
				return (
					<div className="field-row items-center">
						<div
							className="w-4 h-4 mr-2 border border-black"
							style={{ backgroundColor: (value as string) || "#FFFFFF" }}
						/>
						<span>{value || "#FFFFFF"}</span>
					</div>
				);

			default:
				return <div className="p-1">{String(value) || "（空）"}</div>;
		}
	};

	// 渲染不同类型的编辑模式
	const renderEdit = () => {
		switch (attribute.type) {
			case "text":
				return (
					<input
						type="text"
						value={(editValue as string) || ""}
						onChange={(e) => handleValueChange(e.target.value)}
						className="w-full"
					/>
				);

			case "number":
				return (
					<input
						type="number"
						value={(editValue as number) || 0}
						min={attribute.min}
						max={attribute.max}
						onChange={(e) => handleValueChange(Number(e.target.value))}
						className="w-full"
					/>
				);

			case "boolean":
				return (
					<div className="field-row">
						<input
							type="checkbox"
							checked={Boolean(editValue)}
							onChange={(e) => handleValueChange(e.target.checked)}
							id={`edit-attr-${attribute.id}`}
						/>
						<label htmlFor={`edit-attr-${attribute.id}`}>
							{Boolean(editValue) ? "是" : "否"}
						</label>
					</div>
				);

			case "enum":
				return (
					<select
						value={(editValue as string) || ""}
						onChange={(e) => handleValueChange(e.target.value)}
						className="w-full"
					>
						<option value="">-- 请选择 --</option>
						{attribute.options?.map((option, index) => (
							<option key={index} value={option}>
								{option}
							</option>
						))}
					</select>
				);

			case "date":
				return (
					<input
						type="date"
						value={(editValue as string) || ""}
						onChange={(e) => handleValueChange(e.target.value)}
						className="w-full"
					/>
				);

			case "image":
				// 简化的图片URL输入
				return (
					<input
						type="text"
						value={(editValue as string) || ""}
						onChange={(e) => handleValueChange(e.target.value)}
						placeholder="图片URL"
						className="w-full"
					/>
				);

			case "color":
				return (
					<div className="field-row">
						<input
							type="color"
							value={(editValue as string) || "#FFFFFF"}
							onChange={(e) => handleValueChange(e.target.value)}
							className="mr-2"
						/>
						<input
							type="text"
							value={(editValue as string) || "#FFFFFF"}
							onChange={(e) => handleValueChange(e.target.value)}
							className="flex-grow"
						/>
					</div>
				);

			default:
				return (
					<input
						type="text"
						value={String(editValue) || ""}
						onChange={(e) => handleValueChange(e.target.value)}
						className="w-full"
					/>
				);
		}
	};

	return (
		<div className="mb-2">
			<div className="field-row-stacked">
				<label className="font-bold">{attribute.name}:</label>
				<div className="p-1 border border-gray-300 bg-white">
					{isEditing ? (
						<div>
							{renderEdit()}
							<div className="field-row mt-2">
								<button onClick={handleSave}>保存</button>
								<button className="ml-2" onClick={handleCancel}>
									取消
								</button>
							</div>
						</div>
					) : (
						<div className="flex justify-between items-center">
							{renderValue()}
							{!readOnly && (
								<button
									className="small-button"
									onClick={() => setIsEditing(true)}
								>
									编辑
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// 主渲染器组件
export default function CustomAttributeRenderer({
	attributes,
	values = {},
	onUpdate,
	readOnly = false,
}: {
	attributes: AttributeDefinition[];
	values: Record<string, AttributeValueType>;
	onUpdate?: (id: string, value: AttributeValueType) => void;
	readOnly?: boolean;
}) {
	// 处理属性值更新
	const handleAttributeUpdate = (id: string, newValue: AttributeValueType) => {
		if (onUpdate) {
			onUpdate(id, newValue);
		}
	};

	return (
		<div className="window">
			<div className="title-bar">
				<div className="title-bar-text">自定义属性</div>
			</div>
			<div className="window-body">
				{attributes.length === 0 ? (
					<div className="p-4 text-center">没有自定义属性</div>
				) : (
					<div>
						{attributes.map((attribute) => (
							<AttributeDisplay
								key={attribute.id}
								attribute={attribute}
								value={values[attribute.id]}
								onEdit={handleAttributeUpdate}
								readOnly={readOnly}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
