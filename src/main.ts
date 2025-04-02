import { Editor, MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, ExMemoSettings, LLMProvider, LLMModel } from './settings';
import { SILICONFLOW_MODELS, OPENROUTER_MODELS } from './settings';
import { ExMemoSettingTab } from './settingsTab';
import { adjustMdMeta } from './meta';
import { t } from "./lang/helpers"

export default class ExMemoAsstPlugin extends Plugin {
    settings: ExMemoSettings;

    async onload() {
        await this.loadSettings();
        this.addCommand({
            id: 'adjust-meta',
            name: t('exmemoAdjustMeta'),
            editorCallback: (editor: Editor, view: MarkdownView) => {
                adjustMdMeta(this.app, this.settings);
            }
        });
        this.addSettingTab(new ExMemoSettingTab(this.app, this));
    }

    onunload() {
    }

    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

        // 检查是否需要初始化提供商配置
        if (loadedData) {
            // 检查是否有旧版设置字段（作为any类型处理）
            const oldData = loadedData as any;
            if (oldData.llmBaseUrl !== undefined ||
                oldData.llmToken !== undefined ||
                oldData.llmModelName !== undefined) {

                // 如果没有新格式的提供商列表，则进行迁移
                if (!loadedData.llmProviders || loadedData.llmProviders.length === 0) {
                    console.log("Migrating from old LLM settings format to new providers format");

                    // 设置默认提供商列表
                    this.settings.llmProviders = [...DEFAULT_SETTINGS.llmProviders];

                    // 尝试将旧的设置转移到合适的提供商配置
                    if (oldData.llmBaseUrl && oldData.llmToken) {
                        // 根据旧的baseUrl判断提供商类型
                        const baseUrl = oldData.llmBaseUrl.toLowerCase();
                        let providerId = '';

                        if (baseUrl.includes('siliconflow') || baseUrl.includes('硅基')) {
                            providerId = 'siliconflow';
                        } else if (baseUrl.includes('openrouter')) {
                            providerId = 'openrouter';
                        } else {
                            providerId = 'custom';
                            // 更新自定义提供商的URL和模型名称
                            const customProvider = this.settings.llmProviders.find(p => p.id === 'custom');
                            if (customProvider) {
                                customProvider.baseUrl = this.cleanBaseUrl(oldData.llmBaseUrl);
                                if (oldData.llmModelName) {
                                    customProvider.modelName = oldData.llmModelName;
                                }
                            }
                        }

                        // 更新对应提供商的token
                        const provider = this.settings.llmProviders.find(p => p.id === providerId);
                        if (provider) {
                            provider.token = oldData.llmToken;
                            this.settings.currentLLMProvider = providerId;
                        }
                    }

                    // 保存迁移后的设置
                    await this.saveSettings();
                }

                // 删除旧的配置字段，防止再次触发迁移
                delete oldData.llmBaseUrl;
                delete oldData.llmToken;
                delete oldData.llmModelName;
                await this.saveData(oldData);
            }

            // 确保提供商列表中的每个提供商都有正确的type字段
            if (loadedData.llmProviders && loadedData.llmProviders.length > 0) {
                let needsSave = false;

                for (let i = 0; i < this.settings.llmProviders.length; i++) {
                    const provider = this.settings.llmProviders[i];

                    // 补充缺失的type字段
                    if (!provider.type) {
                        if (provider.baseUrl) {
                            const url = provider.baseUrl.toLowerCase();
                            if (url.includes('siliconflow') || url.includes('硅基')) {
                                provider.type = 'siliconflow';
                            } else if (url.includes('openrouter')) {
                                provider.type = 'openrouter';
                            } else {
                                provider.type = 'custom';
                            }
                        } else {
                            provider.type = 'custom';
                        }
                        needsSave = true;
                    }

                    // 确保每个提供商都有models字段
                    if (!provider.models || provider.models.length === 0) {
                        if (provider.type === 'siliconflow') {
                            provider.models = [...SILICONFLOW_MODELS];
                        } else if (provider.type === 'openrouter') {
                            provider.models = [...OPENROUTER_MODELS];
                        } else {
                            provider.models = [{ id: 'custom-model', name: '自定义模型' }];
                        }
                        needsSave = true;
                    }
                }

                if (needsSave) {
                    await this.saveSettings();
                }
            }
        }
    }

    // 清理 baseUrl，确保 URL 正确
    private cleanBaseUrl(url: string): string {
        if (!url) return '';

        // 移除末尾的 /v1 或 /v1/
        if (url.endsWith('/v1/')) {
            return url.substring(0, url.length - 4);
        }
        if (url.endsWith('/v1')) {
            return url.substring(0, url.length - 3);
        }

        // 移除末尾的斜杠
        if (url.endsWith('/')) {
            return url.substring(0, url.length - 1);
        }

        return url;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
