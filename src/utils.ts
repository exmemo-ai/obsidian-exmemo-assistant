import { App, TFile, MarkdownView, Modal, Notice, getAllTags } from 'obsidian';
import { ExMemoSettings, LLMProvider } from "./settings";
import { t } from "./lang/helpers"

export async function callLLM(req: string, settings: ExMemoSettings): Promise<string> {
    let ret = '';
    let info = new Notice(t("llmLoading"), 0);
    //console.log('callLLM:', req.length, 'chars', req);
    //console.warn('callLLM:', settings.llmBaseUrl, settings.llmToken);

    try {
        // 获取当前选择的 LLM 提供商
        const providerId = settings.currentLLMProvider;
        const provider = settings.llmProviders.find(p => p.id === providerId);

        if (!provider) {
            throw new Error(t("noProviderSelected"));
        }

        // 更彻底地构建 API URL，完全避免路径重复问题
        let baseUrl = provider.baseUrl || '';
        let endpoint = provider.endpoint || '';

        // 处理 baseUrl
        // 1. 移除末尾的 /v1 路径（如果有）
        if (baseUrl.endsWith('/v1/')) {
            baseUrl = baseUrl.substring(0, baseUrl.length - 4);
        } else if (baseUrl.endsWith('/v1')) {
            baseUrl = baseUrl.substring(0, baseUrl.length - 3);
        }

        // 2. 确保 baseUrl 不以斜杠结尾
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.substring(0, baseUrl.length - 1);
        }

        // 处理 endpoint
        // 1. 确保 endpoint 以斜杠开头
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }

        // 2. 避免重复的 /v1/chat/completions 路径
        if (endpoint.includes('/v1/chat/completions') && baseUrl.includes('/v1/chat/completions')) {
            // 检测重复并移除一个
            endpoint = '';
        }

        // 完整 URL
        const apiUrl = baseUrl + endpoint;
        console.log('API URL:', apiUrl); // 调试输出

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.token}`
            },
            mode: 'cors',
            body: JSON.stringify({
                model: provider.modelName,
                messages: [
                    { "role": "user", "content": req }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            ret = data.choices[0].message.content || ret;
        }
    } catch (error) {
        new Notice(t("llmError") + "\n" + error as string);
        console.warn('Error:', error as string);
    }
    info.hide();
    return ret
}

class ConfirmModal extends Modal {
    private resolvePromise: (value: boolean) => void;
    private message: string;

    constructor(app: App, message: string, onResolve: (value: boolean) => void) {
        super(app);
        this.message = message;
        this.resolvePromise = onResolve;
    }

    onOpen() {
        this.titleEl.setText(t("confirm"));
        this.contentEl.createEl('p', { text: this.message });
        const buttonContainer = this.contentEl.createEl('div', { cls: 'dialog-button-container' });

        const yesButton = buttonContainer.createEl('button', { text: t("yes") });
        yesButton.onclick = () => {
            this.close();
            this.resolvePromise(true);
        };

        const noButton = buttonContainer.createEl('button', { text: t("no") });
        noButton.onclick = () => {
            this.close();
            this.resolvePromise(false);
        };
    }
}

export async function confirmDialog(app: App, message: string): Promise<boolean> {
    return new Promise((resolve) => {
        new ConfirmModal(app, message, resolve).open();
    });
}

function splitIntoTokens(str: string) {
    const regex = /[\u4e00-\u9fa5]|[a-zA-Z0-9]+|[\.,!?;，。！？；#]|[\n]/g;
    const tokens = str.match(regex);
    return tokens || [];
}

function joinTokens(tokens: any) {
    let result = '';
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '\n') {
            result += token;
        } else if (/[\u4e00-\u9fa5]|[\.,!?;，。！？；#]/.test(token)) {
            result += token;
        } else {
            result += (i > 0 ? ' ' : '') + token;
        }
    }
    return result.trim();
}

export async function loadTags(app: App): Promise<Record<string, number>> {
    // use getAllTags from obsidian API
    const tagsMap: Record<string, number> = {};
    app.vault.getMarkdownFiles().forEach((file: TFile) => {
        const cachedMetadata = app.metadataCache.getFileCache(file);
        if (cachedMetadata) {
            let tags = getAllTags(cachedMetadata);
            if (tags) {
                tags.forEach((tag) => {
                    let tagName = tag;
                    if (tagName.startsWith('#')) {
                        tagName = tagName.slice(1);
                    }
                    if (tagsMap[tagName]) {
                        tagsMap[tagName]++;
                    } else {
                        tagsMap[tagName] = 1;
                    }
                });
            }
        }
    });
    return tagsMap;
}

export async function getContent(app: App, file: TFile | null, limit: number = 1000, method: string = "head_only"): Promise<string> {
    let content_str = '';
    if (file !== null) { // read from file
        content_str = await app.vault.read(file);
    } else { // read from active editor
        const editor = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (!editor) {
            return '';
        }
        content_str = editor.getSelection();
        content_str = content_str.trim();
        if (content_str.length === 0) {
            content_str = editor.getValue();
        }
    }
    if (content_str.length === 0) {
        return '';
    }
    const tokens = splitIntoTokens(content_str);
    //console.log('token_count', tokens.length);
    if (tokens.length > limit && limit > 0) {
        if (method === "head_tail") {
            const left = Math.round(limit * 0.8);
            const right = Math.round(limit * 0.2);
            const leftTokens = tokens.slice(0, left);
            const rightTokens = tokens.slice(-right);
            content_str = joinTokens(leftTokens) + '\n...\n' + joinTokens(rightTokens);
        } else if (method === "head_only") {
            content_str = joinTokens(tokens.slice(0, limit)) + "...";
        } else if (method === "heading") {
            let lines = content_str.split('\n');
            lines = lines.filter(line => line.trim() !== '');

            let new_lines: string[] = [];
            let captureNextParagraph = false;
            for (let line of lines) {
                if (line.startsWith('#')) {
                    new_lines.push(line);
                    captureNextParagraph = true;
                }
                else if (captureNextParagraph && line.trim() !== '') {
                    const lineTokens = splitIntoTokens(line);
                    new_lines.push(joinTokens(lineTokens.slice(0, 30)) + '...'); // 30 tokens
                    captureNextParagraph = false;
                }
            }
            content_str = new_lines.join('\n');
            const totalTokens = splitIntoTokens(content_str);
            if (totalTokens.length > limit) {
                content_str = joinTokens(totalTokens.slice(0, limit));
            } else {
                let remainingTokens = limit - totalTokens.length;
                let head = joinTokens(tokens.slice(0, remainingTokens)) + "...";
                content_str = `Outline: \n${content_str}\n\nBody: ${head}`;
            }
        }
    }
    //console.log('base', tokens.length, 'return', splitIntoTokens(content_str).length);
    return content_str;
}

export function updateFrontMatter(file: TFile, app: App, key: string, value: any, method: string) {
    app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (value === undefined || value === null) {
            return;
        }
        if (method === `append`) {
            let old_value = frontmatter[key];
            if (typeof value === 'string') {
                if (old_value === undefined || old_value === null) {
                    old_value = '';
                }
                frontmatter[key] = old_value + value;
            } else if (Array.isArray(value)) {
                if (old_value === undefined || old_value === null || !Array.isArray(old_value)) {
                    old_value = [];
                }
                const new_value = old_value.concat(value);
                const unique_value = Array.from(new Set(new_value));
                frontmatter[key] = unique_value;
            }
        } else if (method === `update`) {
            frontmatter[key] = value;
        } else { // keep: keep_if_exists
            let old_value = frontmatter[key];
            if (old_value !== undefined && old_value !== null) {
                return;
            }
            frontmatter[key] = value;
        }
    });
}
