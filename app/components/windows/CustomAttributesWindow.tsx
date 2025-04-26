"use client";

import { useState } from "react";
import Window98 from "@/app/components/Window98";
import CustomAttributeEditor from "@/app/components/custom/CustomAttributeEditor";
import CustomAttributeRenderer from "@/app/components/custom/CustomAttributeRenderer";
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

// 示例默认属性
const defaultAttributes: AttributeDefinition[] = [
	{
		id: uuidv4(),
		name: "姓名",
		type: "text",
		required: true,
	},
	{
		id: uuidv4(),
		name: "年龄",
		type: "number",
		required: false,
		min: 0,
		max: 100,
	},
	{
		id: uuidv4(),
		name: "性别",
		type: "enum",
		required: true,
		options: ["男", "女", "其他"],
	},
	{
		id: uuidv4(),
		name: "出生日期",
		type: "date",
		required: false,
	},
	{
		id: uuidv4(),
		name: "是否主角",
		type: "boolean",
		required: false,
	},
];

// 示例属性值
const defaultValues: Record<string, AttributeValueType> = {};

// 为默认属性创建初始值
defaultAttributes.forEach((attr) => {
	defaultValues[attr.id] =
		attr.default !== undefined
			? attr.default
			: attr.type === "boolean"
			? false
			: attr.type === "number"
			? 0
			: attr.type === "enum" && attr.options?.length
			? attr.options[0]
			: null;
});

export default function CustomAttributesWindow({
	onClose,
	zIndex,
	onBringToFront,
	entityType = "角色",
}: {
	onClose: () => void;
	zIndex: number;
	onBringToFront: () => void;
	entityType?: string;
}) {
	// 属性定义状态
	const [attributes, setAttributes] =
		useState<AttributeDefinition[]>(defaultAttributes);
	// 属性值状态
	const [attributeValues, setAttributeValues] =
		useState<Record<string, AttributeValueType>>(defaultValues);
	// 视图状态：editor（编辑器）, renderer（渲染器）
	const [view, setView] = useState<"editor" | "renderer">("editor");

	// 保存属性定义
	const handleSaveAttributes = (newAttributes: AttributeDefinition[]) => {
		setAttributes(newAttributes);

		// 更新属性值，移除不再存在的属性的值
		const updatedValues = { ...attributeValues };

		// 删除不再存在的属性值
		Object.keys(updatedValues).forEach((id) => {
			if (!newAttributes.some((attr) => attr.id === id)) {
				delete updatedValues[id];
			}
		});

		// 为新属性添加默认值
		newAttributes.forEach((attr) => {
			if (updatedValues[attr.id] === undefined) {
				updatedValues[attr.id] =
					attr.default !== undefined
						? attr.default
						: attr.type === "boolean"
						? false
						: attr.type === "number"
						? 0
						: attr.type === "enum" && attr.options?.length
						? attr.options[0]
						: null;
			}
		});

		setAttributeValues(updatedValues);
	};

	// 更新属性值
	const handleUpdateAttributeValue = (
		id: string,
		value: AttributeValueType
	) => {
		setAttributeValues((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	// 切换视图
	const toggleView = () => {
		setView((prev) => (prev === "editor" ? "renderer" : "editor"));
	};

	// 创建Window98组件所需的属性
	const windowStyle = {
		zIndex: zIndex,
	};

	return (
		<Window98
			title={`${entityType}自定义属性`}
			onClose={onClose}
			initialSize={{ width: 600, height: 500 }}
		>
			<div className="p-2" style={windowStyle} onClick={onBringToFront}>
				<div className="field-row mb-4">
					<button onClick={toggleView}>
						{view === "editor" ? "切换到预览模式" : "切换到编辑模式"}
					</button>
				</div>

				{view === "editor" ? (
					<CustomAttributeEditor
						initialAttributes={attributes}
						onSave={handleSaveAttributes}
						entityType={entityType}
					/>
				) : (
					<CustomAttributeRenderer
						attributes={attributes}
						values={attributeValues}
						onUpdate={handleUpdateAttributeValue}
					/>
				)}
			</div>
		</Window98>
	);
}
