# 智谱 AI 集成文档

## 简介

本项目使用智谱 AI (ZhipuAI) 提供的 GLM 模型，通过 `zhipu-ai-provider` 包实现与 AI 的交互。智谱 AI 是一家中国领先的 AI 公司，提供高质量的中文大语言模型服务。

## 设置

### 安装依赖

使用 bun 安装必要的依赖：

```bash
bun add zhipu-ai-provider ai@latest
```

### 环境变量

在项目根目录创建 `.env` 文件，添加以下内容：

```
ZHIPU_API_KEY=your_zhipu_api_key_here
```

请将 `your_zhipu_api_key_here` 替换为您从智谱 AI 平台获取的 API 密钥。

## 使用方法

### 初始化客户端

```typescript
import { createZhipu, zhipu } from "zhipu-ai-provider";

// 创建智谱 AI 客户端
const zhipuAI = process.env.ZHIPU_API_KEY
	? createZhipu({
			apiKey: process.env.ZHIPU_API_KEY,
	  })
	: zhipu;
```

### 与角色对话

使用 `chatWithCharacter` 函数与预设角色进行对话：

```typescript
const response = await chatWithCharacter(
	{
		name: "历史学家",
		description: "一位专注于中国古代历史的学者，对各个朝代历史有深入研究。",
		attributes: {
			专业领域: "中国古代史",
			研究方向: "社会文化变迁",
		},
	},
	"请简述唐朝的兴衰历程"
);
```

### 分析内容一致性

使用 `analyzeChapterConsistency` 函数分析文本内容是否与设定保持一致：

```typescript
const analysis = await analyzeChapterConsistency(
	chapterContent,
	worldviewInfo,
	previousChaptersContext
);

if (analysis.isConsistent) {
	console.log("章节内容与设定一致");
} else {
	console.log("发现问题:", analysis.result);
}
```

## 注意事项

1. 智谱 AI 的 API 请求可能会受到网络条件和地区限制的影响
2. 请确保您的 API 密钥有足够的额度
3. GLM 模型对中文的处理能力优于大多数国外模型，特别适合中文内容生成和分析

## 相关资源

- [智谱 AI 官网](https://zhipu.ai/)
- [zhipu-ai-provider 文档](https://www.npmjs.com/package/zhipu-ai-provider)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
