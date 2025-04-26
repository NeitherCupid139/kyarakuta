"use client";

interface ProgressBarProps {
	value: number;
	min: number;
	max: number;
	showValue?: boolean;
	color?: string;
}

export function ProgressBar({
	value,
	min,
	max,
	showValue = false,
	color = "#008080",
}: ProgressBarProps) {
	// 计算百分比值
	const percentage = Math.min(
		100,
		Math.max(0, ((value - min) / (max - min)) * 100)
	);

	return (
		<div className="w-full">
			<div className="bg-gray-200 h-5 border border-gray-400 relative">
				<div
					className="h-full absolute left-0 top-0"
					style={{
						width: `${percentage}%`,
						backgroundColor: color,
					}}
				/>
				{showValue && (
					<div className="absolute inset-0 flex items-center justify-center text-xs">
						{value} / {max}
					</div>
				)}
			</div>
		</div>
	);
}
