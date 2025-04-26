import supabase from "@/app/lib/supabase";

/**
 * 事件类型定义
 */
export type Event = {
	id?: number;
	title: string;
	description: string;
	date?: string;
	workId: number;
	chapterId?: number;
	characterIds?: number[];
	createdAt?: string;
	updatedAt?: string;
};

/**
 * 事件角色关联类型
 */
type EventCharacter = {
	characterId: number;
	characters?: {
		name: string;
	};
};

/**
 * 获取所有事件
 * @returns 所有事件数据
 */
export async function getAllEvents() {
	const { data, error } = await supabase
		.from("events")
		.select(
			`
      *, 
      works(title), 
      chapters(title),
      event_characters(characterId, characters(name))
    `
		)
		.order("workId")
		.order("date");

	if (error) {
		console.error("获取事件列表失败:", error);
		throw new Error("获取事件列表失败");
	}

	return data.map((event) => {
		// 处理关系数据
		const characters =
			event.event_characters?.map((ec: EventCharacter) => ({
				id: ec.characterId,
				name: ec.characters?.name,
			})) || [];

		return {
			...event,
			workTitle: event.works?.title,
			chapterTitle: event.chapters?.title,
			characters: characters,
			characterIds: characters.map((c: { id: number }) => c.id),
		};
	});
}

/**
 * 获取某作品的所有事件
 * @param workId 作品ID
 * @returns 作品的事件数据
 */
export async function getEventsByWorkId(workId: number) {
	const { data, error } = await supabase
		.from("events")
		.select(
			`
      *, 
      works(title), 
      chapters(title),
      event_characters(characterId, characters(name))
    `
		)
		.eq("workId", workId)
		.order("date");

	if (error) {
		console.error(`获取作品ID:${workId}的事件列表失败:`, error);
		throw new Error("获取作品事件列表失败");
	}

	return data.map((event) => {
		// 处理关系数据
		const characters =
			event.event_characters?.map((ec: EventCharacter) => ({
				id: ec.characterId,
				name: ec.characters?.name,
			})) || [];

		return {
			...event,
			workTitle: event.works?.title,
			chapterTitle: event.chapters?.title,
			characters: characters,
			characterIds: characters.map((c: { id: number }) => c.id),
		};
	});
}

/**
 * 获取单个事件
 * @param id 事件ID
 * @returns 事件数据
 */
export async function getEventById(id: number) {
	const { data, error } = await supabase
		.from("events")
		.select(
			`
      *, 
      works(title), 
      chapters(title),
      event_characters(characterId, characters(name))
    `
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error(`获取事件ID:${id}失败:`, error);
		throw new Error("获取事件详情失败");
	}

	// 处理关系数据
	const characters =
		data.event_characters?.map((ec: EventCharacter) => ({
			id: ec.characterId,
			name: ec.characters?.name,
		})) || [];

	return {
		...data,
		workTitle: data.works?.title,
		chapterTitle: data.chapters?.title,
		characters: characters,
		characterIds: characters.map((c: { id: number }) => c.id),
	};
}

/**
 * 创建新事件
 * @param event 事件数据
 * @returns 创建的事件
 */
export async function createEvent(event: Event) {
	// 开始事务
	const { data, error } = await supabase.rpc("create_event", {
		event_title: event.title,
		event_description: event.description,
		event_date: event.date,
		event_work_id: event.workId,
		event_chapter_id: event.chapterId,
		event_character_ids: event.characterIds || [],
		event_created_at: new Date().toISOString(),
		event_updated_at: new Date().toISOString(),
	});

	if (error) {
		console.error("创建事件失败:", error);
		throw new Error("创建事件失败");
	}

	return getEventById(data);
}

/**
 * 更新事件
 * @param id 事件ID
 * @param event 事件数据
 * @returns 更新后的事件
 */
export async function updateEvent(id: number, event: Partial<Event>) {
	// 更新事件表
	const { error: updateError } = await supabase
		.from("events")
		.update({
			title: event.title,
			description: event.description,
			date: event.date,
			workId: event.workId,
			chapterId: event.chapterId,
			updatedAt: new Date().toISOString(),
		})
		.eq("id", id);

	if (updateError) {
		console.error(`更新事件ID:${id}失败:`, updateError);
		throw new Error("更新事件失败");
	}

	// 如果提供了角色IDs，更新关联表
	if (event.characterIds) {
		// 先删除现有关联
		const { error: deleteError } = await supabase
			.from("event_characters")
			.delete()
			.eq("eventId", id);

		if (deleteError) {
			console.error(`删除事件ID:${id}的角色关联失败:`, deleteError);
			throw new Error("更新事件角色关联失败");
		}

		// 添加新关联
		if (event.characterIds.length > 0) {
			const eventCharacters = event.characterIds.map((characterId) => ({
				eventId: id,
				characterId,
			}));

			const { error: insertError } = await supabase
				.from("event_characters")
				.insert(eventCharacters);

			if (insertError) {
				console.error(`添加事件ID:${id}的角色关联失败:`, insertError);
				throw new Error("更新事件角色关联失败");
			}
		}
	}

	return getEventById(id);
}

/**
 * 删除事件
 * @param id 事件ID
 * @returns 删除结果
 */
export async function deleteEvent(id: number) {
	// 先删除关联表中的数据
	const { error: deleteRelationError } = await supabase
		.from("event_characters")
		.delete()
		.eq("eventId", id);

	if (deleteRelationError) {
		console.error(`删除事件ID:${id}的角色关联失败:`, deleteRelationError);
		throw new Error("删除事件关联失败");
	}

	// 删除事件
	const { error } = await supabase.from("events").delete().eq("id", id);

	if (error) {
		console.error(`删除事件ID:${id}失败:`, error);
		throw new Error("删除事件失败");
	}

	return { success: true, id };
}
