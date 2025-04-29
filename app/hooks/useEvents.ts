import { useState, useEffect, useCallback } from "react";
import { query, getById, insert, update, remove } from "@/app/db";
import type { Event, InsertEvent } from "@/app/db/schema";

/**
 * 事件管理钩子
 * 提供事件的增删改查功能和因果关系管理
 */
export function useEvents(workId: string) {
	// 状态管理
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// 获取指定作品的所有事件
	const fetchEvents = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await query<Event>("events", { work_id: workId });
			if (error) throw error;
			setEvents(data || []);
		} catch (err) {
			console.error("获取事件列表失败:", err);
			setError(err instanceof Error ? err : new Error("获取事件列表失败"));
		} finally {
			setLoading(false);
		}
	}, [workId]);

	// 获取单个事件详情
	const getEvent = useCallback(async (id: string) => {
		try {
			const { data, error } = await getById<Event>("events", id);
			if (error) throw error;
			return data;
		} catch (err) {
			console.error(`获取事件ID:${id}失败:`, err);
			throw err;
		}
	}, []);

	// 创建新事件
	const createEvent = useCallback(
		async (
			eventData: Omit<
				InsertEvent,
				"id" | "workId" | "createdAt" | "updatedAt" | "effectEventIds"
			>
		) => {
			try {
				const { data, error } = await insert<Event>("events", {
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
				const { data, error } = await update<Event>("events", id, eventData);
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

				// 同时更新其他事件中的因果关系
				const updatedEvents = events.map((event) => {
					// 如果被删除的事件是某事件的原因，清除该因果关系
					if (event.causeEventId === id) {
						return { ...event, causeEventId: null };
					}

					// 如果被删除的事件是某事件的结果之一，从结果列表中移除
					const effectEventIds = event.effectEventIds || [];
					if (effectEventIds.includes(id)) {
						return {
							...event,
							effectEventIds: effectEventIds.filter(
								(effectId) => effectId !== id
							),
						};
					}

					return event;
				});

				// 批量更新这些事件
				const eventsToUpdate = updatedEvents.filter((event) => {
					// 找出需要更新的事件：原因是被删除的事件 或 结果包含被删除的事件
					const effectIds = event.effectEventIds || [];
					return (
						event.causeEventId === id || // 原因是被删除的事件
						effectIds.some((effectId) => effectId === id) // 结果包含被删除的事件
					);
				});

				const updatePromises = eventsToUpdate.map((event) =>
					update<Event>("events", event.id, {
						cause_event_id: event.causeEventId,
						effect_event_ids: event.effectEventIds || [],
					})
				);

				await Promise.all(updatePromises);

				return true;
			} catch (err) {
				console.error(`删除事件ID:${id}失败:`, err);
				throw err;
			}
		},
		[events]
	);

	// 设置事件的因事件
	const setCauseEvent = useCallback(
		async (eventId: string, causeEventId: string | null) => {
			try {
				// 首先获取当前事件
				const currentEvent = events.find((e) => e.id === eventId);
				if (!currentEvent) throw new Error("事件不存在");

				// 获取因事件
				const causeEvent = causeEventId
					? events.find((e) => e.id === causeEventId)
					: null;

				// 更新当前事件的因事件
				const { data: updatedEvent, error: updateError } = await update<Event>(
					"events",
					eventId,
					{
						cause_event_id: causeEventId,
					}
				);

				if (updateError) throw updateError;

				// 如果设置了新的因事件，同时也需要更新因事件的结果列表
				if (causeEvent && causeEventId) {
					// 将当前事件添加到因事件的结果列表中
					const causeEffectIds = causeEvent.effectEventIds || [];
					const newEffectIds = [...causeEffectIds];
					if (!newEffectIds.includes(eventId)) {
						newEffectIds.push(eventId);

						await update<Event>("events", causeEventId, {
							effect_event_ids: newEffectIds,
						});
					}
				}

				// 如果有旧的因事件，也需要从其结果列表中移除当前事件
				const oldCauseEventId = currentEvent.causeEventId;
				if (oldCauseEventId && oldCauseEventId !== causeEventId) {
					const oldCauseEvent = events.find((e) => e.id === oldCauseEventId);
					if (oldCauseEvent) {
						const oldEffectIds = oldCauseEvent.effectEventIds || [];
						const filteredEffectIds = oldEffectIds.filter(
							(id) => id !== eventId
						);

						await update<Event>("events", oldCauseEventId, {
							effect_event_ids: filteredEffectIds,
						});
					}
				}

				// 重新获取所有事件以保持状态一致
				await fetchEvents();

				return updatedEvent;
			} catch (err) {
				console.error(`设置事件因果关系失败:`, err);
				throw err;
			}
		},
		[events, fetchEvents]
	);

	// 添加结果事件
	const addEffectEvent = useCallback(
		async (eventId: string, effectEventId: string) => {
			try {
				// 获取当前事件
				const currentEvent = events.find((e) => e.id === eventId);
				if (!currentEvent) throw new Error("事件不存在");

				// 获取当前事件的结果列表
				const currentEffectIds = currentEvent.effectEventIds || [];

				// 如果结果事件已经在列表中，直接返回
				if (currentEffectIds.includes(effectEventId)) {
					return currentEvent;
				}

				// 添加到结果列表
				const newEffectIds = [...currentEffectIds];
				newEffectIds.push(effectEventId);

				// 更新当前事件
				const { data: updatedEvent, error: updateError } = await update<Event>(
					"events",
					eventId,
					{
						effect_event_ids: newEffectIds,
					}
				);

				if (updateError) throw updateError;

				// 同时也设置结果事件的因事件
				const effectEvent = events.find((e) => e.id === effectEventId);
				if (effectEvent) {
					await update<Event>("events", effectEventId, {
						cause_event_id: eventId,
					});
				}

				// 重新获取所有事件以保持状态一致
				await fetchEvents();

				return updatedEvent;
			} catch (err) {
				console.error(`添加结果事件失败:`, err);
				throw err;
			}
		},
		[events, fetchEvents]
	);

	// 移除结果事件
	const removeEffectEvent = useCallback(
		async (eventId: string, effectEventId: string) => {
			try {
				// 获取当前事件
				const currentEvent = events.find((e) => e.id === eventId);
				if (!currentEvent) throw new Error("事件不存在");

				// 获取当前事件的结果列表
				const currentEffectIds = currentEvent.effectEventIds || [];

				// 从结果列表中移除
				const newEffectIds = currentEffectIds.filter(
					(id) => id !== effectEventId
				);

				// 更新当前事件
				const { data: updatedEvent, error: updateError } = await update<Event>(
					"events",
					eventId,
					{
						effect_event_ids: newEffectIds,
					}
				);

				if (updateError) throw updateError;

				// 同时清除结果事件的因事件
				const effectEvent = events.find((e) => e.id === effectEventId);
				if (effectEvent && effectEvent.causeEventId === eventId) {
					await update<Event>("events", effectEventId, {
						cause_event_id: null,
					});
				}

				// 重新获取所有事件以保持状态一致
				await fetchEvents();

				return updatedEvent;
			} catch (err) {
				console.error(`移除结果事件失败:`, err);
				throw err;
			}
		},
		[events, fetchEvents]
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
		getEvent,
		createEvent,
		updateEvent,
		deleteEvent,
		setCauseEvent,
		addEffectEvent,
		removeEffectEvent,
	};
}
