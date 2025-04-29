import { useState, useEffect, useCallback } from "react";
import { query, insert, update, remove } from "@/app/db";
import type { Event as StoryEvent, InsertEvent } from "@/app/db/schema";

/**
 * 时间线管理钩子
 * 提供时间线的可视化和与事件系统的联动功能
 */
export function useTimeline(workId: string) {
	// 状态管理
	const [events, setEvents] = useState<StoryEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有事件（作为时间线项）
	const fetchEvents = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<StoryEvent>("events", {
				work_id: workId,
			});
			if (error) throw error;
			setEvents(data || []);
		} catch (err) {
			console.error("获取事件列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取事件列表失败"));
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 按时间点排序事件
	const getSortedEvents = useCallback(() => {
		// 对事件进行排序 - 可根据实际规则调整
		return [...events].sort((a, b) => {
			// 如果没有时间点，则放到最后
			if (!a.timePoint) return 1;
			if (!b.timePoint) return -1;

			// 尝试解析为日期格式进行比较
			const dateA = new Date(a.timePoint);
			const dateB = new Date(b.timePoint);

			if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
				return dateA.getTime() - dateB.getTime();
			}

			// 纯文本比较
			return a.timePoint.localeCompare(b.timePoint);
		});
	}, [events]);

	// 创建新事件
	const createEvent = useCallback(
		async (
			eventData: Omit<
				InsertEvent,
				"id" | "workId" | "createdAt" | "updatedAt" | "effectEventIds"
			>
		) => {
			try {
				const { data, error } = await insert<StoryEvent>("events", {
					...eventData,
					work_id: workId,
					effect_event_ids: [],
				});

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setEvents((prev) => [...prev, data]);
				}

				return data;
			} catch (err) {
				console.error("创建事件失败:", err);
				throw err;
			}
		},
		[workId]
	);

	// 更新事件
	const updateEvent = useCallback(
		async (
			id: string,
			eventData: Partial<
				Omit<InsertEvent, "id" | "workId" | "createdAt" | "updatedAt">
			>
		) => {
			try {
				const { data, error } = await update<StoryEvent>(
					"events",
					id,
					eventData
				);

				if (error) throw error;

				// 更新本地状态
				if (data) {
					setEvents((prev) =>
						prev.map((event) => (event.id === id ? data : event))
					);
				}

				return data;
			} catch (err) {
				console.error(`更新事件ID:${id}失败:`, err);
				throw err;
			}
		},
		[]
	);

	// 删除事件
	const deleteEvent = useCallback(
		async (id: string) => {
			try {
				const { error } = await remove("events", id);
				if (error) throw error;

				// 更新本地状态
				setEvents((prev) => prev.filter((event) => event.id !== id));

				// 需要清理其他事件中对该事件的引用
				const affectedEvents = events.filter(
					(event) =>
						event.causeEventId === id ||
						(event.effectEventIds && event.effectEventIds.includes(id))
				);

				// 更新受影响的事件
				for (const event of affectedEvents) {
					if (event.causeEventId === id) {
						// 移除因事件引用
						await updateEvent(event.id, { causeEventId: null });
					}

					if (event.effectEventIds && event.effectEventIds.includes(id)) {
						// 移除效果事件引用
						const updatedEffectIds = event.effectEventIds.filter(
							(effectId) => effectId !== id
						);
						await updateEvent(event.id, { effectEventIds: updatedEffectIds });
					}
				}

				return true;
			} catch (err) {
				console.error(`删除事件ID:${id}失败:`, err);
				throw err;
			}
		},
		[events, updateEvent]
	);

	// 设置因果关系
	const setEventCause = useCallback(
		async (eventId: string, causeId: string | null) => {
			try {
				// 移除旧的因果关系（如果存在）
				const event = events.find((e) => e.id === eventId);
				if (!event) throw new Error("事件不存在");

				const oldCauseId = event.causeEventId;

				// 更新当前事件的因事件
				await updateEvent(eventId, { causeEventId: causeId });

				// 如果有旧的因事件，从其效果列表中移除当前事件
				if (oldCauseId) {
					const oldCause = events.find((e) => e.id === oldCauseId);
					if (oldCause && oldCause.effectEventIds) {
						const updatedEffectIds = oldCause.effectEventIds.filter(
							(id) => id !== eventId
						);
						await updateEvent(oldCauseId, { effectEventIds: updatedEffectIds });
					}
				}

				// 如果有新的因事件，将当前事件添加到其效果列表中
				if (causeId) {
					const cause = events.find((e) => e.id === causeId);
					if (cause) {
						const effectIds = [...(cause.effectEventIds || [])];
						if (!effectIds.includes(eventId)) {
							effectIds.push(eventId);
							await updateEvent(causeId, { effectEventIds: effectIds });
						}
					}
				}

				return true;
			} catch (err) {
				console.error("设置事件因果关系失败:", err);
				throw err;
			}
		},
		[events, updateEvent]
	);

	// 初始加载
	useEffect(() => {
		if (workId) {
			fetchEvents();
		}
	}, [workId, fetchEvents]);

	return {
		events,
		loading,
		error,
		fetchEvents,
		getSortedEvents,
		createEvent,
		updateEvent,
		deleteEvent,
		setEventCause,
	};
}
