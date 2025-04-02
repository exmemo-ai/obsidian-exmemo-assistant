import { t } from "./lang/helpers";

export interface LLMModel {
	id: string;
	name: string;
	// 模型特定参数可以根据需要添加
}

export interface LLMProvider {
	id: string;
	name: string;
	type: 'siliconflow' | 'openrouter' | 'custom'; // 服务商类型
	baseUrl: string;
	token: string;
	modelName: string; // 当前选择的模型
	models: LLMModel[]; // 提供的模型列表
	endpoint: string;
}

export interface ExMemoSettings {
	// 移除旧版配置，只保留新版多LLM配置
	llmProviders: LLMProvider[]; // LLM 提供商列表
	currentLLMProvider: string; // 当前选择的 LLM 提供商 ID
	llmPrompts: Record<string, { count: number, lastAccess: number }>;
	llmDialogEdit: boolean
	tags: string[];
	metaIsTruncate: boolean;
	metaMaxTokens: number;
	metaTruncateMethod: string;
	metaUpdateMethod: string;
	metaDescription: string;
	metaTitleEnabled: boolean;
	metaTitlePrompt: string;
	metaEditTimeEnabled: boolean;
	metaEditTimeFormat: string;
	selectExcludedFolders: string[];
	metaTagsFieldName: string;
	metaDescriptionFieldName: string;
	metaTitleFieldName: string;
	metaUpdatedFieldName: string;
	metaCreatedFieldName: string;
	metaTagsPrompt: string;
	customMetadata: Array<{ key: string, value: string }>;
	metaCategoryFieldName: string;
	categories: string[];
	metaCategoryPrompt: string;
	metaCategoryEnabled: boolean;
}

// 预定义模型列表
export const SILICONFLOW_MODELS: LLMModel[] = [
	{ id: 'Pro/deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1' },
	{ id: 'Pro/deepseek-ai/DeepSeek-V3', name: 'Deepseek-V3' },
	{ id: 'Qwen/QwQ-32B', name: 'Qwen' }
];

export const OPENROUTER_MODELS: LLMModel[] = [
	{ id: 'openai/o1', name: 'OpenAI: o1' },
	{ id: 'openai/chatgpt-4o-latest', name: 'ChatGPT-4o' },
	{ id: 'anthropic/claude-3.7-sonnet', name: 'claude-3.7-sonnet' },
	{ id: 'google/gemini-2.0-flash-001', name: 'Gemini Flash 2.0' }
];

export const DEFAULT_SETTINGS: ExMemoSettings = {
	llmProviders: [
		{
			id: 'siliconflow',
			name: '硅基流动',
			type: 'siliconflow',
			baseUrl: 'https://api.siliconflow.cn',
			token: 'sk-',
			modelName: 'deepseek-r1',
			models: SILICONFLOW_MODELS,
			endpoint: '/v1/chat/completions'
		},
		{
			id: 'openrouter',
			name: 'OpenRouter',
			type: 'openrouter',
			baseUrl: 'https://openrouter.ai/api',
			token: 'sk-',
			modelName: 'openai/gpt-4o',
			models: OPENROUTER_MODELS,
			endpoint: '/v1/chat/completions'
		},
		{
			id: 'custom',
			name: '自定义',
			type: 'custom',
			baseUrl: 'https://api.example.com',
			token: 'sk-',
			modelName: 'custom-model',
			models: [{ id: 'custom-model', name: '自定义模型' }],
			endpoint: '/v1/chat/completions'
		}
	],
	currentLLMProvider: 'siliconflow',
	llmPrompts: {},
	llmDialogEdit: false,
	tags: [],
	metaIsTruncate: true,
	metaMaxTokens: 1000,
	metaTruncateMethod: 'head_only',
	metaUpdateMethod: 'no-llm',
	metaDescription: t('defaultSummaryPrompt'),
	metaTitleEnabled: true,
	metaTitlePrompt: t('defaultTitlePrompt'),
	metaEditTimeEnabled: true,
	metaEditTimeFormat: 'YYYY-MM-DD HH:mm:ss',
	selectExcludedFolders: [],
	metaTagsFieldName: 'tags',
	metaDescriptionFieldName: 'description',
	metaTitleFieldName: 'title',
	metaUpdatedFieldName: 'updated',
	metaCreatedFieldName: 'created',
	metaTagsPrompt: t('defaultTagsPrompt'),
	customMetadata: [],
	metaCategoryFieldName: 'category',
	categories: JSON.parse(t('defaultCategories')),
	metaCategoryPrompt: t('defaultCategoryPrompt'),
	metaCategoryEnabled: true,
}