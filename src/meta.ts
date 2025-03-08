import { App, Notice, TFile } from 'obsidian';
import { ExMemoSettings } from "./settings";
import { getContent } from './utils';
import { callLLM } from "./utils";
import { t } from './lang/helpers';
import { updateFrontMatter } from './utils';
import moment from 'moment';

export async function adjustMdMeta(app: App, settings: ExMemoSettings) {
    const file = app.workspace.getActiveFile();
    if (!file) {
        new Notice(t('pleaseOpenFile'));
        return;
    }
    if (file.extension !== 'md') {
        new Notice(t('currentFileNotMarkdown'));
        return;
    }
    
    // 读取文件内容
    let content = await getContent(app, null, -1, '');
    
    // 解析前置元数据
    const fm = app.metadataCache.getFileCache(file);
    let frontMatter = fm?.frontmatter || {};
    let hasChanges = false;
    
    // 根据更新方法决定是否强制更新
    const force = settings.metaUpdateMethod === 'force';
    
    // 添加标签和描述
    if (!frontMatter.tags || !frontMatter.description || force) {
        await addMetaByLLM(file, app, settings, force);
        hasChanges = true;
    }
    
    // 只有在不使用LLM且不处理时间元数据时才添加基本元数据
    if (settings.metaUpdateMethod === 'no-llm' && !settings.metaEditTimeEnabled) {
        await addOthersMeta(file, app);
        hasChanges = true;
    }
    
    // 添加标题生成逻辑 - 只在功能启用时执行
    if (settings.metaTitleEnabled) {
        if (!frontMatter.title || force) {
            try {
                const title = await generateTitle(content, settings);
                updateFrontMatter(file, app, 'title', title, force ? 'update' : 'keep');
                hasChanges = true;
            } catch (error) {
                console.error('生成标题时出错:', error);
                new Notice(t('llmError') + ': ' + error);
            }
        }
    }
    
    // 添加时间相关元数据 - 只在功能启用时执行
    if (settings.metaEditTimeEnabled) {
        try {
            // 更新编辑时间 - 使用update模式确保字段会被创建
            const now = moment().format(settings.metaEditTimeFormat);
            updateFrontMatter(file, app, 'updated', now, 'update');
            
            // 添加创建时间 - 也使用update模式确保字段会被创建
            const created = file.stat.ctime;
            const createdDate = new Date(created).toISOString().split('T')[0];
            updateFrontMatter(file, app, 'created', createdDate, 'update');
            
            hasChanges = true;
        } catch (error) {
            console.error('更新时间元数据时出错:', error);
            new Notice(t('llmError') + ': ' + error);
        }
    }
    
    if (hasChanges) {
        new Notice(t('metaUpdated'));
    }
}

async function addMetaByLLM(file: TFile, app: App, settings: ExMemoSettings, force: boolean = false) {
    const fm = app.metadataCache.getFileCache(file);
    if (fm?.frontmatter?.tags && fm?.frontmatter.description && !force) {
        console.warn(t('fileAlreadyContainsTagsAndDescription'));
        return;
    }
    
    let content_str = '';
    if (settings.metaIsTruncate) {
        content_str = await getContent(app, null, settings.metaMaxTokens, settings.metaTruncateMethod);
    } else {
        content_str = await getContent(app, null, -1, '');
    }
    
    const option_list = settings.tags;
    const options = option_list.join(',');
    const req = `Please extract up to three tags based on the following article content and generate a brief summary.
The tags should be chosen from the following options: '${options}'. If there are no suitable tags, please create appropriate ones.
${settings.metaDescription}
Please return in the following format: {"tags":"tag1,tag2,tag3","description":"brief summary"}, and in the same language as the content.
The article content is as follows:

${content_str}`;
    
    let ret = await callLLM(req, settings);
    if (ret === "" || ret === undefined || ret === null) {
        return;
    }
    ret = ret.replace(/`/g, '');

    let ret_json = {} as { tags?: string; description?: string };
    try {
        let json_str = ret.match(/{[^]*}/);
        if (json_str) {
            ret_json = JSON.parse(json_str[0]) as { tags?: string; description?: string };
        }        
    } catch (error) {
        new Notice(t('parseError') + "\n" + error);
        console.error("parseError:", error);
        return;
    }
    
    if (ret_json.tags) {
        const tags = ret_json.tags.split(',');
        updateFrontMatter(file, app, 'tags', tags, 'append');
    }
    
    if (ret_json.description) {
        updateFrontMatter(file, app, 'description', ret_json.description, 'update');
    }
}

function addOthersMeta(file: TFile, app: App) {
    // 移除对created字段的添加，确保只有在metaEditTimeEnabled为true时才添加时间相关元数据
    // 如果有其他元数据需要添加，可以在这里添加
}

// 生成标题的函数
async function generateTitle(content: string, settings: ExMemoSettings): Promise<string> {
    // 如果内容过长，根据截断设置处理
    let processedContent = content;
    if (settings.metaIsTruncate && content.length > settings.metaMaxTokens) {
        processedContent = truncateContent(content, settings.metaMaxTokens, settings.metaTruncateMethod);
    }
    
    // 调用 LLM 生成标题
    const prompt = settings.metaTitlePrompt;
    const req = `${prompt}\n\n${processedContent}`;
    
    const response = await callLLM(req, settings);
    
    // 处理响应，确保返回的是一个有效的标题
    let title = response.trim();
    // 移除可能的引号
    if ((title.startsWith('"') && title.endsWith('"')) || 
        (title.startsWith("'") && title.endsWith("'"))) {
        title = title.substring(1, title.length - 1);
    }
    
    return title;
}

// 内容截断函数
function truncateContent(content: string, maxTokens: number, method: string): string {
    if (content.length <= maxTokens) {
        return content;
    }
    
    switch (method) {
        case 'head_only':
            // 只保留开头部分
            return content.substring(0, maxTokens);
            
        case 'head_tail':
            // 保留开头和结尾
            const halfTokens = Math.floor(maxTokens / 2);
            return content.substring(0, halfTokens) + 
                   "\n...\n" + 
                   content.substring(content.length - halfTokens);
            
        case 'heading':
            // 提取标题和部分内容
            const headings = content.match(/#{1,6}\s+.+/g) || [];
            let result = headings.join("\n");
            
            // 如果标题不够长，添加一些内容
            if (result.length < maxTokens) {
                const remainingTokens = maxTokens - result.length;
                result += "\n\n" + content.substring(0, remainingTokens);
            }
            
            return result.substring(0, maxTokens);
            
        default:
            return content.substring(0, maxTokens);
    }
}




