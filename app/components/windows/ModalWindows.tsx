"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// 模态窗口类型
export type ModalType = "alert" | "confirm" | "prompt";

// 模态窗口返回值类型
export type ModalResult = string | boolean | null | undefined;

// 模态窗口配置选项
export interface ModalOptions {
	title?: string;
	message: string | ReactNode;
	type: ModalType;
	defaultValue?: string;
	confirmText?: string;
	cancelText?: string;
	icon?: string;
	width?: number;
	height?: number;
	onConfirm?: (value?: string) => void;
	onCancel?: () => void;
}

// 模态窗口默认选项
const defaultOptions: Partial<ModalOptions> = {
	title: "系统消息",
	confirmText: "确定",
	cancelText: "取消",
	width: 400,
	height: 220,
	icon: "/icons/chat.png",
};

// 模态窗口实例
let modalInstance: null | {
	show: (options: ModalOptions) => Promise<ModalResult>;
	hide: () => void;
} = null;

// 模态窗口组件
const ModalWindow: React.FC<{
	options: ModalOptions;
	onConfirm: (value?: string) => void;
	onCancel: () => void;
}> = ({ options, onConfirm, onCancel }) => {
	// 合并默认选项
	const {
		title,
		message,
		type,
		defaultValue,
		confirmText,
		cancelText,
		icon,
		width,
		height,
	} = { ...defaultOptions, ...options };

	// 输入框状态
	const [inputValue, setInputValue] = useState(defaultValue || "");
	const inputRef = useRef<HTMLInputElement>(null);

	// 初始位置状态
	const [position, setPosition] = useState({
		top: window.innerHeight / 2 - (height || 0) / 2,
		left: window.innerWidth / 2 - (width || 0) / 2,
	});

	// 窗口拖动状态
	const [isDragging, setIsDragging] = useState(false);
	const dragOffset = useRef({ x: 0, y: 0 });

	// 处理确认按钮点击
	const handleConfirm = () => {
		if (type === "prompt") {
			onConfirm(inputValue);
		} else {
			onConfirm();
		}
	};

	// 处理取消按钮点击
	const handleCancel = () => {
		onCancel();
	};

	// 处理键盘事件
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			handleCancel();
		} else if (e.key === "Enter" && !(type === "prompt" && e.ctrlKey)) {
			handleConfirm();
		}
	};

	// 处理窗口拖动
	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		dragOffset.current = {
			x: e.clientX - position.left,
			y: e.clientY - position.top,
		};

		// 添加事件监听
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		// 阻止事件冒泡
		e.preventDefault();
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			setPosition({
				left: e.clientX - dragOffset.current.x,
				top: e.clientY - dragOffset.current.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	// 聚焦输入框
	useEffect(() => {
		if (type === "prompt" && inputRef.current) {
			inputRef.current.focus();
		}

		// 添加键盘事件监听
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [type]);

	// 处理窗口拖动事件监听
	useEffect(() => {
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	return (
		<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div
				className="window"
				style={{
					position: "absolute",
					top: position.top,
					left: position.left,
					width: width,
					zIndex: 9999,
				}}
			>
				<div
					className="title-bar"
					onMouseDown={handleMouseDown}
					style={{ cursor: "move" }}
				>
					<div className="title-bar-text flex items-center">
						{icon && (
							<Image
								src={icon}
								width={16}
								height={16}
								alt="图标"
								className="mr-2"
							/>
						)}
						{title}
					</div>
					{type !== "alert" && (
						<div className="title-bar-controls">
							<button aria-label="关闭" onClick={handleCancel}></button>
						</div>
					)}
				</div>

				<div
					className="window-body p-4 flex flex-col"
					style={{ height: height && height - 60 }}
				>
					{/* 消息内容 */}
					<div className="flex mb-4 items-start">
						{type === "alert" && (
							<div className="mr-3 flex-shrink-0">
								<Image
									src="/icons/chat.png"
									width={32}
									height={32}
									alt="提示"
								/>
							</div>
						)}
						{type === "confirm" && (
							<div className="mr-3 flex-shrink-0">
								<Image
									src="/icons/about.png"
									width={32}
									height={32}
									alt="确认"
								/>
							</div>
						)}
						{type === "prompt" && (
							<div className="mr-3 flex-shrink-0">
								<Image
									src="/icons/custom.png"
									width={32}
									height={32}
									alt="输入"
								/>
							</div>
						)}
						<div className="flex-grow">
							{typeof message === "string" ? <p>{message}</p> : message}
						</div>
					</div>

					{/* 输入框 */}
					{type === "prompt" && (
						<div className="field-row-stacked mb-4">
							<label htmlFor="modal-input">请输入:</label>
							<input
								id="modal-input"
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								ref={inputRef}
								className="w-full"
							/>
						</div>
					)}

					{/* 按钮区域 */}
					<div className="mt-auto field-row flex justify-end">
						{(type === "confirm" || type === "prompt") && (
							<button onClick={handleCancel} className="mr-2">
								{cancelText}
							</button>
						)}
						<button onClick={handleConfirm}>{confirmText}</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// 模态窗口管理器
const ModalManager: React.FC = () => {
	const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);
	const resolveRef = useRef<((value: ModalResult) => void) | undefined>(
		undefined
	);

	// 显示模态窗口
	const showModal = (options: ModalOptions): Promise<ModalResult> => {
		return new Promise((resolve) => {
			setModalOptions(options);
			resolveRef.current = resolve;
		});
	};

	// 隐藏模态窗口
	const hideModal = () => {
		setModalOptions(null);
	};

	// 处理确认
	const handleConfirm = (value?: string) => {
		if (resolveRef.current) {
			if (modalOptions?.type === "prompt") {
				resolveRef.current(value);
			} else if (modalOptions?.type === "confirm") {
				resolveRef.current(true);
			} else {
				resolveRef.current(undefined);
			}
		}

		hideModal();

		// 调用用户提供的回调
		modalOptions?.onConfirm?.(value);
	};

	// 处理取消
	const handleCancel = () => {
		if (resolveRef.current) {
			if (modalOptions?.type === "prompt") {
				resolveRef.current(null);
			} else if (modalOptions?.type === "confirm") {
				resolveRef.current(false);
			} else {
				resolveRef.current(undefined);
			}
		}

		hideModal();

		// 调用用户提供的回调
		modalOptions?.onCancel?.();
	};

	// 设置全局实例
	useEffect(() => {
		modalInstance = {
			show: showModal,
			hide: hideModal,
		};

		return () => {
			modalInstance = null;
		};
	}, []);

	// 如果没有模态窗口选项，不渲染任何内容
	if (!modalOptions) return null;

	return createPortal(
		<ModalWindow
			options={modalOptions}
			onConfirm={handleConfirm}
			onCancel={handleCancel}
		/>,
		document.body
	);
};

// 全局模态窗口函数
export const Modal = {
	alert: (
		message: string,
		options?: Partial<Omit<ModalOptions, "type" | "message">>
	) => {
		if (!modalInstance) return Promise.resolve<ModalResult>(undefined);
		return modalInstance.show({
			message,
			type: "alert",
			...options,
		});
	},

	confirm: (
		message: string,
		options?: Partial<Omit<ModalOptions, "type" | "message">>
	) => {
		if (!modalInstance) return Promise.resolve<ModalResult>(false);
		return modalInstance.show({
			message,
			type: "confirm",
			...options,
		});
	},

	prompt: (
		message: string,
		defaultValue?: string,
		options?: Partial<Omit<ModalOptions, "type" | "message" | "defaultValue">>
	) => {
		if (!modalInstance) return Promise.resolve<ModalResult>(null);
		return modalInstance.show({
			message,
			type: "prompt",
			defaultValue,
			...options,
		});
	},
};

export default function ModalWindows() {
	return <ModalManager />;
}
