import React, { useState, useEffect } from "react";
import { useAI } from "@/app/hooks/useAI";
import type { Character } from "@/app/db/schema";
import { query } from "@/app/db";

/**
 * 角色对话生成窗口组件
 * 实现角色对话生成功能
 */
const CharacterChatWindow: React.FC<{
	onClose: () => void;
	character?: {
		id: number;
		name: string;
		description: string;
		traits: string;
		background: string;
	};
}> = ({ onClose, character }) => {
	// 获取AI功能相关操作
	const { loading, error, generateCharacterDialogue } = useAI(
		character?.id ? String(character.id) : ""
	);

	// 状态管理
	const [characters, setCharacters] = useState<Character[]>([]);
	const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
		[]
	);
	const [dialogueTopic, setDialogueTopic] = useState("");
	const [dialogueLength, setDialogueLength] = useState(500);
	const [result, setResult] = useState<string | null>(null);

	// 获取角色数据
	useEffect(() => {
		const fetchData = async () => {
			try {
				// 获取角色
				const { data: charactersData } = await query<Character>(
					"characters",
					{}
				);
				setCharacters(charactersData || []);
			} catch (err) {
				console.error("获取数据失败:", err);
			}
		};

		fetchData();
	}, []);

	// 处理角色选择变化
	const handleCharacterChange = (characterId: string) => {
		setSelectedCharacterIds((prev) =>
			prev.includes(characterId)
				? prev.filter((id) => id !== characterId)
				: [...prev, characterId]
		);
	};

	// 生成对话
	const handleGenerateDialogue = async () => {
		if (selectedCharacterIds.length < 2) {
			alert("请至少选择两个角色");
			return;
		}

		if (!dialogueTopic.trim()) {
			alert("请输入对话主题");
			return;
		}

		try {
			const dialogue = await generateCharacterDialogue(
				selectedCharacterIds,
				dialogueTopic,
				dialogueLength
			);
			setResult(dialogue || null);
		} catch (err) {
			console.error("生成对话失败:", err);
			alert(err instanceof Error ? err.message : "生成对话失败");
		}
	};

	return (
		<div className="window" style={{ width: "700px", zIndex: 10 }}>
			<div className="title-bar">
				<div className="title-bar-text">角色对话生成</div>
				<div className="title-bar-controls">
					<button aria-label="Minimize"></button>
					<button aria-label="Maximize"></button>
					<button aria-label="Close" onClick={onClose}></button>
				</div>
			</div>

			<div className="window-body">
				<div className="p-4">
					{loading ? (
						<p>处理中，请稍候...</p>
					) : error ? (
						<p className="text-red-500">错误: {error.message}</p>
					) : (
						// 角色对话生成界面
						<div>
							<div className="mb-4">
								<h3 className="mb-2">选择角色（至少两个）</h3>
								<div className="border p-2 max-h-40 overflow-auto">
									{characters.length === 0 ? (
										<p>没有可用角色</p>
									) : (
										<div className="grid grid-cols-2 gap-2">
											{characters.map((character) => (
												<label key={character.id} className="flex items-center">
													<input
														type="checkbox"
														checked={selectedCharacterIds.includes(
															character.id
														)}
														onChange={() => handleCharacterChange(character.id)}
														className="mr-2"
													/>
													{character.name}
												</label>
											))}
										</div>
									)}
								</div>
							</div>

							<div className="mb-4">
								<label htmlFor="topic" className="block mb-2">
									对话主题
								</label>
								<input
									id="topic"
									type="text"
									value={dialogueTopic}
									onChange={(e) => setDialogueTopic(e.target.value)}
									className="w-full"
									placeholder="例如：关于未来的计划、对某事件的看法..."
								/>
							</div>

							<div className="mb-4">
								<label htmlFor="length" className="block mb-2">
									对话长度（字符数）
								</label>
								<input
									id="length"
									type="range"
									min="200"
									max="2000"
									step="100"
									value={dialogueLength}
									onChange={(e) => setDialogueLength(parseInt(e.target.value))}
									className="w-full"
								/>
								<div className="text-right">{dialogueLength} 字符</div>
							</div>

							<div className="text-center mb-4">
								<button
									onClick={handleGenerateDialogue}
									disabled={
										selectedCharacterIds.length < 2 || !dialogueTopic.trim()
									}
								>
									生成对话
								</button>
							</div>

							{result && (
								<div className="mt-4 p-4 bg-gray-50 border">
									<h3 className="mb-2">生成结果</h3>
									<pre className="text-sm whitespace-pre-wrap">{result}</pre>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CharacterChatWindow;
