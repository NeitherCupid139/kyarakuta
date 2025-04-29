import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";

/**
 * 作品表 - 存储小说创作的基本信息
 */
export const works = pgTable("works", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	coverImage: text("cover_image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type Work = InferSelectModel<typeof works>;
export type InsertWork = InferInsertModel<typeof works>;

/**
 * 章节表 - 存储作品的章节内容
 */
export const chapters = pgTable("chapters", {
	id: uuid("id").primaryKey().defaultRandom(),
	workId: uuid("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content"),
	order: integer("order").notNull(),
	nextChapterId: uuid("next_chapter_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type Chapter = InferSelectModel<typeof chapters>;
export type InsertChapter = InferInsertModel<typeof chapters>;

/**
 * 章节关系 - 定义章节之间的前后关系
 */
export const chaptersRelations = relations(chapters, ({ one }) => ({
	nextChapter: one(chapters, {
		fields: [chapters.nextChapterId],
		references: [chapters.id],
	}),
}));

/**
 * 事件表 - 存储作品中的事件
 */
export const events = pgTable("events", {
	id: uuid("id").primaryKey().defaultRandom(),
	workId: uuid("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	chapterId: uuid("chapter_id").references(() => chapters.id),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	timePoint: varchar("time_point", { length: 255 }),
	location: varchar("location", { length: 255 }),
	causeEventId: uuid("cause_event_id"),
	effectEventIds: jsonb("effect_event_ids").$type<string[]>().default([]),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type Event = InferSelectModel<typeof events>;
export type InsertEvent = InferInsertModel<typeof events>;

/**
 * 事件关系 - 定义事件之间的因果关系
 */
export const eventsRelations = relations(events, ({ one }) => ({
	causeEvent: one(events, {
		fields: [events.causeEventId],
		references: [events.id],
	}),
}));

/**
 * 角色表 - 存储作品中的角色信息
 */
export const characters = pgTable("characters", {
	id: uuid("id").primaryKey().defaultRandom(),
	workId: uuid("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	avatar: text("avatar"),
	background: text("background"),
	personality: text("personality"),
	goals: text("goals"),
	attributes: jsonb("attributes").$type<Record<string, unknown>>().default({}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type Character = InferSelectModel<typeof characters>;
export type InsertCharacter = InferInsertModel<typeof characters>;

/**
 * 角色关系表 - 存储角色之间的关系
 */
export const characterRelations = pgTable("character_relations", {
	id: uuid("id").primaryKey().defaultRandom(),
	workId: uuid("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	characterIdA: uuid("character_id_a")
		.references(() => characters.id, { onDelete: "cascade" })
		.notNull(),
	characterIdB: uuid("character_id_b")
		.references(() => characters.id, { onDelete: "cascade" })
		.notNull(),
	relationType: varchar("relation_type", { length: 50 }).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type CharacterRelation = InferSelectModel<typeof characterRelations>;
export type InsertCharacterRelation = InferInsertModel<
	typeof characterRelations
>;

/**
 * 世界观设定表 - 存储作品的世界观设定
 */
export const worldSettings = pgTable("world_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	workId: uuid("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	category: varchar("category", { length: 50 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义类型
export type WorldSetting = InferSelectModel<typeof worldSettings>;
export type InsertWorldSetting = InferInsertModel<typeof worldSettings>;

/**
 * 事件角色关联表 - 存储事件与角色的关联关系
 */
export const eventCharacters = pgTable("event_characters", {
	id: uuid("id").primaryKey().defaultRandom(),
	eventId: uuid("event_id")
		.references(() => events.id, { onDelete: "cascade" })
		.notNull(),
	characterId: uuid("character_id")
		.references(() => characters.id, { onDelete: "cascade" })
		.notNull(),
	role: varchar("role", { length: 50 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 定义类型
export type EventCharacter = InferSelectModel<typeof eventCharacters>;
export type InsertEventCharacter = InferInsertModel<typeof eventCharacters>;
