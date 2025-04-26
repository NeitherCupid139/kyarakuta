import React, { useState, useEffect } from "react";
import "98.css";
import { Work } from "@/app/components/forms/WorkForm";
import WorkDetail from "@/app/components/details/WorkDetail";
import WorkForm from "@/app/components/forms/WorkForm";

/**
 * 作品详情窗口属性接口
 */
interface WorkDetailWindowProps {
	workId: number;
	onBack: () => void; // 返回作品列表
	works: Work[]; // 作品数据列表
	onUpdateWork: (id: number, data: Omit<Work, "id">) => void; // 更新作品数据
}

/**
 * 作品详情窗口组件
 * 展示作品详情并提供编辑功能
 */
export default function WorkDetailWindow({
	workId,
	onBack,
	works,
	onUpdateWork,
}: WorkDetailWindowProps) {
	// 作品数据
	const [work, setWork] = useState<Work | null>(null);
	// 编辑模式
	const [isEditing, setIsEditing] = useState<boolean>(false);

	// 加载作品数据
	useEffect(() => {
		const foundWork = works.find((w) => w.id === workId);
		if (foundWork) {
			setWork(foundWork);
		}
	}, [workId, works]);

	// 处理编辑
	const handleEdit = () => {
		setIsEditing(true);
	};

	// 处理保存编辑
	const handleSave = (data: Omit<Work, "id">) => {
		if (work) {
			onUpdateWork(work.id, data);

			// 更新本地状态
			setWork({
				...work,
				...data,
			});
		}

		setIsEditing(false);
	};

	// 取消编辑
	const handleCancel = () => {
		setIsEditing(false);
	};

	// 如果作品不存在
	if (!work) {
		return (
			<div className="window-body">
				<div className="status-bar" style={{ padding: 16 }}>
					<p className="status-bar-field">未找到作品数据</p>
					<button className="button" onClick={onBack}>
						返回列表
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="window-body" style={{ padding: 16, overflow: "auto" }}>
			{/* 标题栏 */}
			<div
				className="title-bar-text"
				style={{ fontSize: 20, marginBottom: 16 }}
			>
				{isEditing ? "编辑作品" : "作品详情"}
			</div>

			{/* 内容区 */}
			{isEditing ? (
				// 编辑表单
				<div className="window" style={{ width: "100%" }}>
					<div className="title-bar">
						<div className="title-bar-text">编辑 - {work.title}</div>
					</div>
					<div className="window-body" style={{ padding: 16 }}>
						<WorkForm
							work={work}
							onSubmit={handleSave}
							onCancel={handleCancel}
						/>
					</div>
				</div>
			) : (
				// 作品详情
				<WorkDetail work={work} onEdit={handleEdit} onBack={onBack} />
			)}
		</div>
	);
}
