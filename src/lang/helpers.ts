import { moment } from "obsidian";

import en from "./locale/en";
import zhCN from "./locale/zh-cn";
import zh from './zh';

const localeMap: { [k: string]: Partial<typeof en> } = {
    en,
    "zh-cn": zhCN,
};

const locale = localeMap[moment.locale()];

// 定义支持的翻译键类型
export type TKey = 
    | "confirm" | "yes" | "no" | "llmLoading" | "noResult" | "pleaseOpenFile" 
    | "llmError" | "inputPrompt" | "chatButton" | "pleaseSelectText" 
    | "currentFileNotMarkdown" | "fileAlreadyContainsTagsAndDescription"
    | "parseError" | "metaUpdated" | "llmSettings" | "apiKey" | "baseUrl" | "modelName"
    | "metaUpdateSetting" | "updateMetaOptions" | "updateMetaOptionsDesc"
    | "updateForce" | "updateNoLLM" | "truncateContent" | "truncateContentDesc"
    | "maxContentLength" | "maxContentLengthDesc" | "truncateMethod" | "truncateMethodDesc"
    | "head_only" | "head_tail" | "heading" | "taggingOptions" | "taggingOptionsDesc"
    | "extractTags" | "extractTagsDesc" | "extract" | "tagList" | "tagListDesc"
    | "description" | "descriptionDesc" | "descriptionPrompt" | "descriptionPromptDesc"
    | "defaultSummaryPrompt" | "donate" | "supportThisPlugin" | "supportThisPluginDesc"
    | "bugMeACoffee" | "exmemoAdjustMeta"
    // 添加新的翻译键
    | "title" | "titleDesc" | "enableTitle" | "enableTitleDesc" 
    | "titlePrompt" | "titlePromptDesc" | "defaultTitlePrompt"
    | "editTime" | "editTimeDesc" | "enableEditTime" | "enableEditTimeDesc"
    | "editTimeFormat" | "editTimeFormatDesc";

export function t(key: TKey): string {
    return zh[key] || key;
} 