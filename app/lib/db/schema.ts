import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	json,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 定义属性类型
type CharacterAttribute = {
	name: string;
	value: string | number | boolean;
	description?: string;
};

// 定义分析结果类型
type AnalysisResult = {
	score: number;
	details: string[];
	suggestions: string[];
};

// 作品表
export const works = pgTable("works", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 章节表
export const chapters = pgTable("chapters", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull(),
	content: text("content"),
	order: integer("order"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 事件表
export const events = pgTable("events", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 角色表
export const characters = pgTable("characters", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	description: text("description"),
	attributes: json("attributes").$type<Record<string, CharacterAttribute>>(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 角色关系类型枚举
export const relationTypeEnum = pgEnum("relation_type", [
	"family",
	"friend",
	"enemy",
	"lover",
	"colleague",
	"other",
]);

// 角色关系表
export const characterRelations = pgTable("character_relations", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	characterId1: integer("character_id_1")
		.references(() => characters.id, { onDelete: "cascade" })
		.notNull(),
	characterId2: integer("character_id_2")
		.references(() => characters.id, { onDelete: "cascade" })
		.notNull(),
	relationType: relationTypeEnum("relation_type"),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 世界观信息表
export const worldviews = pgTable("worldviews", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull(),
	content: text("content"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// 时间线表
export const timelines = pgTable("timelines", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	time: text("time").notNull(),
	event: text("event").notNull(),
	description: text("description"),
	order: integer("order"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// AI 分析记录表
export const aiAnalyses = pgTable("ai_analyses", {
	id: serial("id").primaryKey(),
	workId: integer("work_id")
		.references(() => works.id, { onDelete: "cascade" })
		.notNull(),
	chapterId: integer("chapter_id").references(() => chapters.id, {
		onDelete: "cascade",
	}),
	analysisType: text("analysis_type").notNull(), // 'consistency', 'character_dialogue', etc.
	result: json("result").$type<AnalysisResult>(),
	createdAt: timestamp("created_at").defaultNow(),
});

// 关系定义
export const worksRelations = relations(works, ({ many }) => ({
	chapters: many(chapters),
	events: many(events),
	characters: many(characters),
	worldviews: many(worldviews),
	timelines: many(timelines),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
	work: one(works, {
		fields: [chapters.workId],
		references: [works.id],
	}),
}));

export const eventsRelations = relations(events, ({ one }) => ({
	work: one(works, {
		fields: [events.workId],
		references: [works.id],
	}),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
	work: one(works, {
		fields: [characters.workId],
		references: [works.id],
	}),
	relations1: many(characterRelations, { relationName: "character1" }),
	relations2: many(characterRelations, { relationName: "character2" }),
}));

export const characterRelationsRelations = relations(
	characterRelations,
	({ one }) => ({
		work: one(works, {
			fields: [characterRelations.workId],
			references: [works.id],
		}),
		character1: one(characters, {
			fields: [characterRelations.characterId1],
			references: [characters.id],
			relationName: "character1",
		}),
		character2: one(characters, {
			fields: [characterRelations.characterId2],
			references: [characters.id],
			relationName: "character2",
		}),
	})
);

export const worldviewsRelations = relations(worldviews, ({ one }) => ({
	work: one(works, {
		fields: [worldviews.workId],
		references: [works.id],
	}),
}));

export const timelinesRelations = relations(timelines, ({ one }) => ({
	work: one(works, {
		fields: [timelines.workId],
		references: [works.id],
	}),
}));
