import supabase from "@/app/lib/supabase";

/**
 * 时间线类型定义
 */
export type Timeline = {
	id?: number;
	title: string;
	description?: string;
	workId: number;
	eventIds?: number[];
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 时间线事件类型
 */
type TimelineEvent = {
	id: number;
	title: string;
	date?: string;
};

/**
 * 获取所有时间线
 * @returns 所有时间线数据
 */
export async function getAllTimelines() {
	const { data, error } = await supabase
		.from("timelines")
		.select(
			`
      *, 
      works(title),
      timeline_events(eventId, events(id, title, date))
    `
		)
		.order("workId")
		.order("title");

	if (error) {
		console.error("获取时间线列表失败:", error);
		throw new Error("获取时间线列表失败");
	}

	return data.map((timeline) => {
		// 处理事件数据
		const events =
			timeline.timeline_events?.map(
				(te: {
					eventId: number;
					events: { id: number; title: string; date?: string };
				}) => ({
					id: te.eventId,
					title: te.events?.title,
					date: te.events?.date,
				})
			) || [];

		return {
			...timeline,
			workTitle: timeline.works?.title,
			events: events,
			eventIds: events.map((e: TimelineEvent) => e.id),
		};
	});
}

/**
 * 获取某作品的所有时间线
 * @param workId 作品ID
 * @returns 作品的时间线数据
 */
export async function getTimelinesByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("timelines")
		.select(
			`
      *, 
      works(title),
      timeline_events(eventId, events(id, title, date))
    `
		)
		.eq("workId", workId)
		.order("title");

	if (error) {
		console.error(`获取作品ID:${workId}的时间线列表失败:`, error);
		throw new Error("获取作品时间线列表失败");
	}

	return data.map((timeline) => {
		// 处理事件数据
		const events =
			timeline.timeline_events?.map(
				(te: {
					eventId: number;
					events: { id: number; title: string; date?: string };
				}) => ({
					id: te.eventId,
					title: te.events?.title,
					date: te.events?.date,
				})
			) || [];

		return {
			...timeline,
			workTitle: timeline.works?.title,
			events: events,
			eventIds: events.map((e: TimelineEvent) => e.id),
		};
	});
}

/**
 * 获取单个时间线
 * @param id 时间线ID
 * @returns 时间线数据
 */
export async function getTimelineById(id: number) {
	const { data, error } = await supabase
		.from("timelines")
		.select(
			`
      *, 
      works(title),
      timeline_events(eventId, events(id, title, date))
    `
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取时间线ID:${id}失败:`, error);
		throw new Error("获取时间线详情失败");
	}

	// 处理事件数据
	const events =
		data.timeline_events?.map(
			(te: {
				eventId: number;
				events: { id: number; title: string; date?: string };
			}) => ({
				id: te.eventId,
				title: te.events?.title,
				date: te.events?.date,
			})
		) || [];

	return {
		...data,
		workTitle: data.works?.title,
		events: events,
		eventIds: events.map((e: TimelineEvent) => e.id),
	};
}

/**
 * 创建新时间线
 * @param timeline 时间线数据
 * @returns 创建的时间线
 */
export async function createTimeline(timeline: Timeline) {
	// 开始事务
	const { data, error } = await supabase.rpc("create_timeline", {
		timeline_title: timeline.title,
		timeline_description: timeline.description || "",
		timeline_work_id: timeline.workId,
		timeline_event_ids: timeline.eventIds || [],
		timeline_created_at: new Date().toISOString(),
		timeline_updated_at: new Date().toISOString(),
	});

	if (error) {
		console.error("创建时间线失败:", error);
		throw new Error("创建时间线失败");
	}

	return getTimelineById(data);
}

/**
 * 更新时间线
 * @param id 时间线ID
 * @param timeline 时间线数据
 * @returns 更新后的时间线
 */
export async function updateTimeline(id: number, timeline: Partial<Timeline>) {
	// 更新时间线表
	const { error: updateError } = await supabase
		.from("timelines")
		.update({
			title: timeline.title,
			description: timeline.description,
			workId: timeline.workId,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id);

	if (updateError) {
		console.error(`更新时间线ID:${id}失败:`, updateError);
		throw new Error("更新时间线失败");
	}

	// 如果提供了事件IDs，更新关联表
	if (timeline.eventIds) {
		// 先删除现有关联
		const { error: deleteError } = await supabase
			.from("timeline_events")
			.delete()
			.eq("timelineId", id);

		if (deleteError) {
			console.error(`删除时间线ID:${id}的事件关联失败:`, deleteError);
			throw new Error("更新时间线事件关联失败");
		}

		// 添加新关联
		if (timeline.eventIds.length > 0) {
			const timelineEvents = timeline.eventIds.map((eventId) => ({
				timelineId: id,
				eventId,
			}));

			const { error: insertError } = await supabase
				.from("timeline_events")
				.insert(timelineEvents);

			if (insertError) {
				console.error(`添加时间线ID:${id}的事件关联失败:`, insertError);
				throw new Error("更新时间线事件关联失败");
			}
		}
	}

	return getTimelineById(id);
}

/**
 * 删除时间线
 * @param id 时间线ID
 * @returns 删除结果
 */
export async function deleteTimeline(id: number) {
	// 先删除关联表中的数据
	const { error: deleteRelationError } = await supabase
		.from("timeline_events")
		.delete()
		.eq("timelineId", id);

	if (deleteRelationError) {
		console.error(`删除时间线ID:${id}的事件关联失败:`, deleteRelationError);
		throw new Error("删除时间线关联失败");
	}

	// 删除时间线
	const { error } = await supabase.from("timelines").delete().eq("id", id);

	if (error) {
		console.error(`删除时间线ID:${id}失败:`, error);
		throw new Error("删除时间线失败");
	}

	return { success: true, id };
}
