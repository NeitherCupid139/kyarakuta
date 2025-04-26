//use zustand to store the process of the project
import { create } from "zustand";

interface Process {
	id: number;
	name: string;
	icon: string;
	state: "minimize" | "maximize" | "normal" | "close";
	type?: string; // 窗口类型，用于关联窗口
}

interface ProcessStore {
	processOpenTable: Process[];
	addProcess: (process: Omit<Process, "id">) => void;
	removeProcess: (name: string) => void;
	updateProcessState: (name: string, state: Process["state"]) => void;
}

export const useProcessStore = create<ProcessStore>((set) => ({
	processOpenTable: [],
	addProcess: (process) =>
		set((state) => ({
			processOpenTable: [
				...state.processOpenTable,
				{ ...process, id: Date.now() + Math.random() },
			],
		})),
	removeProcess: (name) =>
		set((state) => ({
			processOpenTable: state.processOpenTable.filter((p) => p.name !== name),
		})),
	updateProcessState: (name, state) =>
		set((prev) => ({
			processOpenTable: prev.processOpenTable.map((p) =>
				p.name === name ? { ...p, state } : p
			),
		})),
}));
