import { PluginSettingTab, Setting, App, TextAreaComponent, Modal, ButtonComponent, DropdownComponent, Notice, TextComponent } from 'obsidian';
import { loadTags } from "./utils";
import { t } from "./lang/helpers";
import { LLMProvider, LLMModel } from './settings';
import { DEFAULT_SETTINGS, SILICONFLOW_MODELS, OPENROUTER_MODELS } from './settings';

// LLM 提供商模态框
class LLMProviderModal extends Modal {
	provider: LLMProvider;
	onSave: (provider: LLMProvider) => void;
	isNew: boolean;
	modelDropdown: DropdownComponent;

	constructor(app: App, provider: LLMProvider | null, onSave: (provider: LLMProvider) => void) {
		super(app);
		this.isNew = !provider;

		// 为新提供商设置默认值
		if (this.isNew) {
			const providerType = 'custom' as const; // 新提供商默认为自定义类型
			this.provider = {
				id: Date.now().toString(),
				name: '',
				type: providerType,
				baseUrl: '',
				token: '',
				modelName: '',
				models: [{ id: 'custom-model', name: '自定义模型' }],
				endpoint: '/v1/chat/completions'
			};
		} else {
			// 复制现有提供商，确保所有必需字段都存在
			this.provider = {
				id: provider?.id || Date.now().toString(),
				name: provider?.name || '',
				type: (provider?.type as 'siliconflow' | 'openrouter' | 'custom') || 'custom',
				baseUrl: provider?.baseUrl || '',
				token: provider?.token || '',
				modelName: provider?.modelName || '',
				models: provider?.models || [{ id: 'custom-model', name: '自定义模型' }],
				endpoint: provider?.endpoint || '/v1/chat/completions'
			};
		}

		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: this.isNew ? t('addProvider') : t('editProvider') });

		// 服务商类型选择
		const providerTypeSetting = new Setting(contentEl)
			.setName(t('providerType'))
			.setDesc(t('selectProviderType'));

		const typeDropdown = new DropdownComponent(providerTypeSetting.controlEl);
		typeDropdown.addOption('siliconflow', '硅基流动');
		typeDropdown.addOption('openrouter', 'OpenRouter');
		typeDropdown.addOption('custom', '自定义');
		typeDropdown.setValue(this.provider.type);

		// 名称设置
		new Setting(contentEl)
			.setName(t('providerName'))
			.addText(text => text
				.setValue(this.provider.name)
				.onChange(value => this.provider.name = value));

		// 基础 URL 设置		
		new Setting(contentEl)
			.setName(t('baseUrl'))
			.addText(text => text
				.setValue(this.provider.baseUrl)
				.onChange(value => this.provider.baseUrl = value)
				.setDisabled(this.provider.type !== 'custom')); // 非自定义类型禁止修改

		// 端点设置
		new Setting(contentEl)
			.setName(t('endpoint'))
			.setDesc(t('enterEndpoint'))
			.addText(text => text
				.setValue(this.provider.endpoint)
				.onChange(value => this.provider.endpoint = value)
				.setDisabled(this.provider.type !== 'custom')); // 非自定义类型禁止修改

		// API 密钥设置
		new Setting(contentEl)
			.setName(t('apiKey'))
			.addText(text => text
				.setValue(this.provider.token)
				.onChange(value => this.provider.token = value));

		// 模型选择设置
		const modelSetting = new Setting(contentEl)
			.setName(t('modelSelection'))
			.setDesc(t('selectModel'));

		this.modelDropdown = new DropdownComponent(modelSetting.controlEl);
		this.updateModelOptions(this.provider.type);
		this.modelDropdown.setValue(this.provider.modelName);
		this.modelDropdown.onChange(value => this.provider.modelName = value);

		// 当服务商类型改变时更新模型列表
		typeDropdown.onChange(value => {
			this.provider.type = value as 'siliconflow' | 'openrouter' | 'custom';

			// 根据提供商类型设置默认值
			if (value === 'siliconflow') {
				this.provider.baseUrl = 'https://api.siliconflow.cn';
				this.provider.endpoint = '/v1/chat/completions';
			} else if (value === 'openrouter') {
				this.provider.baseUrl = 'https://openrouter.ai/api';
				this.provider.endpoint = '/v1/chat/completions';
			}

			// 更新模型选项
			this.updateModelOptions(value as 'siliconflow' | 'openrouter' | 'custom');

			// 刷新 UI 状态
			this.provider.modelName = this.modelDropdown.getValue();

			// 设置 URL 和端点输入框的禁用状态
			const urlInput = contentEl.querySelector('[placeholder="' + this.provider.baseUrl + '"]') as HTMLInputElement;
			const endpointInput = contentEl.querySelector('[placeholder="' + this.provider.endpoint + '"]') as HTMLInputElement;

			if (urlInput) urlInput.disabled = (value !== 'custom');
			if (endpointInput) endpointInput.disabled = (value !== 'custom');
		});

		// 添加保存按钮
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(t('confirm'))
				.setCta()
				.onClick(() => {
					if (!this.provider.name) {
						// 如果名称为空，设置默认名称
						if (this.provider.type === 'siliconflow') {
							this.provider.name = '硅基流动';
						} else if (this.provider.type === 'openrouter') {
							this.provider.name = 'OpenRouter';
						} else {
							this.provider.name = '自定义服务商 ' + this.provider.id.substring(0, 5);
						}
					}
					this.onSave(this.provider);
					this.close();
				}));
	}

	// 根据服务商类型更新模型选项
	updateModelOptions(providerType: 'siliconflow' | 'openrouter' | 'custom') {
		this.modelDropdown.selectEl.empty();

		if (providerType === 'siliconflow') {
			// 使用settings.ts中定义的Silicon Flow模型
			SILICONFLOW_MODELS.forEach(model => {
				this.modelDropdown.addOption(model.id, model.name);
			});
			// 设置默认选择的模型为第一个模型（如果存在）
			this.provider.modelName = SILICONFLOW_MODELS.length > 0 ? SILICONFLOW_MODELS[0].id : 'deepseek-v3';
		} else if (providerType === 'openrouter') {
			// 使用settings.ts中定义的OpenRouter模型
			OPENROUTER_MODELS.forEach(model => {
				this.modelDropdown.addOption(model.id, model.name);
			});
			// 设置默认选择的模型为第一个模型（如果存在）
			this.provider.modelName = OPENROUTER_MODELS.length > 0 ? OPENROUTER_MODELS[0].id : 'openai/o1';
		} else {
			// 自定义模型
			this.modelDropdown.addOption('custom-model', '自定义模型');
			this.provider.modelName = 'custom-model';
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class ExMemoSettingTab extends PluginSettingTab {
	plugin;

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let textComponent: TextAreaComponent;
		const { containerEl } = this;
		containerEl.empty();

		// LLM 设置部分
		new Setting(containerEl)
			.setName(t("apiProvider"))
			.setDesc(t("apiProviderDesc"))
			.setHeading();

		// API 提供商选择
		const apiProviderSetting = new Setting(containerEl)
			.setName(t("apiConfig"))
			.setDesc(t("selectApiProvider"));

		// 创建下拉菜单
		const providerDropdown = new DropdownComponent(apiProviderSetting.controlEl);

		// 固定的提供商选项，使用DEFAULT_SETTINGS中的名称
		DEFAULT_SETTINGS.llmProviders.forEach(provider => {
			providerDropdown.addOption(provider.id, provider.name);
		});

		// 如果当前选择的提供商不在默认列表中，默认选择第一个
		const validProviderIds = DEFAULT_SETTINGS.llmProviders.map(p => p.id);
		if (!validProviderIds.includes(this.plugin.settings.currentLLMProvider)) {
			this.plugin.settings.currentLLMProvider = DEFAULT_SETTINGS.currentLLMProvider;
		}

		providerDropdown.setValue(this.plugin.settings.currentLLMProvider);
		providerDropdown.onChange(async (value) => {
			this.plugin.settings.currentLLMProvider = value;

			// 根据提供商类型设置默认值
			const providerIndex = this.plugin.settings.llmProviders.findIndex((p: LLMProvider) => p.id === value);

			if (providerIndex === -1) {
				// 如果提供商不存在，则从DEFAULT_SETTINGS中查找相应的默认配置
				const defaultProvider = DEFAULT_SETTINGS.llmProviders.find(p => p.id === value);
				if (defaultProvider) {
					// 复制默认配置
					this.plugin.settings.llmProviders.push({ ...defaultProvider });
				}
			}

			await this.plugin.saveSettings();
			// 刷新界面以显示当前选中提供商的设置
			this.display();
		});

		// 获取当前选中的提供商
		let currentProvider = this.plugin.settings.llmProviders.find(
			(p: LLMProvider) => p.id === this.plugin.settings.currentLLMProvider
		);

		// 如果当前没有提供商，则使用DEFAULT_SETTINGS中的默认提供商
		if (!currentProvider) {
			// 根据currentLLMProvider从DEFAULT_SETTINGS获取默认提供商
			const defaultProvider = DEFAULT_SETTINGS.llmProviders.find(
				p => p.id === this.plugin.settings.currentLLMProvider
			);

			// 如果找到匹配的默认提供商，则使用它；否则使用第一个默认提供商
			currentProvider = defaultProvider
				? { ...defaultProvider }
				: { ...DEFAULT_SETTINGS.llmProviders[0] };

			this.plugin.settings.llmProviders.push(currentProvider);
			this.plugin.settings.currentLLMProvider = currentProvider.id;
			this.plugin.saveSettings();
		}

		// 显示当前提供商信息
		if (currentProvider.id === 'siliconflow' || currentProvider.id === 'openrouter') {
			// 显示提供商名称和API URL
			let baseUrl = currentProvider.baseUrl || '';
			let endpoint = currentProvider.endpoint || '';

			// 处理 baseUrl
			if (baseUrl.endsWith('/v1/')) {
				baseUrl = baseUrl.substring(0, baseUrl.length - 4);
			} else if (baseUrl.endsWith('/v1')) {
				baseUrl = baseUrl.substring(0, baseUrl.length - 3);
			}

			// 确保 baseUrl 不以斜杠结尾
			if (baseUrl.endsWith('/')) {
				baseUrl = baseUrl.substring(0, baseUrl.length - 1);
			}

			// 处理 endpoint
			if (!endpoint.startsWith('/')) {
				endpoint = '/' + endpoint;
			}

			// 避免重复的 /v1/chat/completions 路径
			if (endpoint.includes('/v1/chat/completions') && baseUrl.includes('/v1/chat/completions')) {
				endpoint = '';
			}

			const apiUrl = baseUrl + endpoint;

			// 显示提供商名称和API URL
			new Setting(containerEl)
				.setName(currentProvider.name)
				.setDesc(apiUrl);
		} else if (currentProvider.id === 'custom') {
			// 显示自定义提供商配置
			new Setting(containerEl)
				.setName(t("customProviderConfig"))
				.setHeading();

			// Base URL 设置
			const baseUrlSetting = new Setting(containerEl)
				.setName(t("baseUrl"))
				.setDesc(t("baseUrlDesc"));

			const baseUrlInput = new TextComponent(baseUrlSetting.controlEl);
			baseUrlInput.inputEl.placeholder = "https://api.example.com";
			baseUrlInput.inputEl.value = currentProvider.baseUrl || '';
			baseUrlInput.onChange(async (value) => {
				const index = this.plugin.settings.llmProviders.findIndex(
					(p: LLMProvider) => p.id === currentProvider.id
				);
				if (index !== -1) {
					this.plugin.settings.llmProviders[index].baseUrl = value;
					await this.plugin.saveSettings();
				}
			});

			// 端点设置
			const endpointSetting = new Setting(containerEl)
				.setName(t("endpoint"))
				.setDesc(t("endpointDesc"));

			const endpointInput = new TextComponent(endpointSetting.controlEl);
			endpointInput.inputEl.placeholder = "/v1/chat/completions";
			endpointInput.inputEl.value = currentProvider.endpoint || '';
			endpointInput.onChange(async (value) => {
				const index = this.plugin.settings.llmProviders.findIndex(
					(p: LLMProvider) => p.id === currentProvider.id
				);
				if (index !== -1) {
					this.plugin.settings.llmProviders[index].endpoint = value;
					await this.plugin.saveSettings();
				}
			});
		}

		// API Key 设置 (对所有提供商都显示)
		const apiKeySetting = new Setting(containerEl)
			.setName(t("apiKey"))
			.setDesc(t("enterYourApiKey"));

		const apiKeyInput = new TextComponent(apiKeySetting.controlEl);
		apiKeyInput.inputEl.type = "password";
		apiKeyInput.inputEl.value = currentProvider.token || '';
		apiKeyInput.onChange(async (value) => {
			const index = this.plugin.settings.llmProviders.findIndex(
				(p: LLMProvider) => p.id === currentProvider.id
			);
			if (index !== -1) {
				this.plugin.settings.llmProviders[index].token = value;
				await this.plugin.saveSettings();
			}
		});

		// 添加显示/隐藏按钮和测试按钮
		apiKeySetting
			.addButton((btn: ButtonComponent) => btn
				.setButtonText(t("show"))
				.onClick(() => {
					if (apiKeyInput.inputEl.type === "password") {
						apiKeyInput.inputEl.type = "text";
						btn.setButtonText(t("hide"));
					} else {
						apiKeyInput.inputEl.type = "password";
						btn.setButtonText(t("show"));
					}
				})
			)
			.addButton((btn: ButtonComponent) => btn
				.setButtonText(t("test"))
				.onClick(async () => {
					try {
						// 构建正确的 API URL
						let baseUrl = currentProvider.baseUrl || '';
						let endpoint = currentProvider.endpoint || '';

						// 处理 baseUrl
						if (baseUrl.endsWith('/v1/')) {
							baseUrl = baseUrl.substring(0, baseUrl.length - 4);
						} else if (baseUrl.endsWith('/v1')) {
							baseUrl = baseUrl.substring(0, baseUrl.length - 3);
						}

						// 确保 baseUrl 不以斜杠结尾
						if (baseUrl.endsWith('/')) {
							baseUrl = baseUrl.substring(0, baseUrl.length - 1);
						}

						// 处理 endpoint
						if (!endpoint.startsWith('/')) {
							endpoint = '/' + endpoint;
						}

						// 避免重复的 /v1/chat/completions 路径
						if (endpoint.includes('/v1/chat/completions') && baseUrl.includes('/v1/chat/completions')) {
							endpoint = '';
						}

						const testUrl = baseUrl + endpoint;
						console.log('Test URL:', testUrl); // 调试输出
						const notice = new Notice(t("llmLoading"), 0);

						try {
							const response = await fetch(testUrl, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${currentProvider.token}`
								},
								mode: 'cors',
								body: JSON.stringify({
									model: currentProvider.modelName,
									messages: [
										{ "role": "user", "content": "Hello, please respond with 'Test successful'" }
									]
								})
							});

							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}

							const data = await response.json();
							if (data.choices && data.choices.length > 0) {
								const result = data.choices[0].message.content;
								notice.hide();
								new Notice(`Test result: ${result}`);
							} else {
								throw new Error("No response from the API");
							}
						} catch (error) {
							notice.hide();
							new Notice(`Test failed: ${error.message}`);
						}
					} catch (error) {
						new Notice(`Test failed: ${error.message}`);
					}
				}));

		// 模型选择
		const modelSetting = new Setting(containerEl)
			.setName(t("model"))
			.setDesc(t("selectTheModelToUse"));

		const modelDropdown = new DropdownComponent(modelSetting.controlEl);
		currentProvider.models.forEach((model: LLMModel) => {
			modelDropdown.addOption(model.id, model.name);
		});

		modelDropdown.setValue(currentProvider.modelName);
		modelDropdown.onChange(async (value) => {
			const index = this.plugin.settings.llmProviders.findIndex(
				(p: LLMProvider) => p.id === currentProvider.id
			);

			if (index !== -1) {
				this.plugin.settings.llmProviders[index].modelName = value;
				await this.plugin.saveSettings();
			}
		});

		// 更新元数据设置部分
		new Setting(containerEl).setName(t("metaUpdateSetting"))
			.setHeading();
		new Setting(containerEl)
			.setName(t("updateMetaOptions"))
			.setDesc(t("updateMetaOptionsDesc"))
			.setClass('setting-item-nested')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('force', t("updateForce"))
					.addOption('no-llm', t("updateNoLLM"))
					.setValue(this.plugin.settings.metaUpdateMethod)
					.onChange(async (value) => {
						this.plugin.settings.metaUpdateMethod = value;
						await this.plugin.saveSettings();
					});
			});

		const toggleCutSetting = new Setting(containerEl)
			.setName(t("truncateContent"))
			.setDesc(t("truncateContentDesc"))
			.setClass('setting-item-nested')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.metaIsTruncate)
					.onChange(async (value) => {
						this.plugin.settings.metaIsTruncate = value;
						await this.plugin.saveSettings();
						truncateSetting.setDisabled(!value);
						maxTokensSetting.setDisabled(!value);
					});
			});

		const maxTokensSetting = new Setting(containerEl)
			.setName(t("maxContentLength"))
			.setDesc(t("maxContentLengthDesc"))
			.setClass('setting-item-nested-2')
			.addText((text) => {
				text.setValue(this.plugin.settings.metaMaxTokens.toString())
					.onChange(async (value) => {
						this.plugin.settings.metaMaxTokens = parseInt(value);
						await this.plugin.saveSettings();
					});
			});

		const truncateSetting = new Setting(containerEl)
			.setName(t("truncateMethod"))
			.setDesc(t("truncateMethodDesc"))
			.setClass('setting-item-nested-2')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('head_only', t("head_only"))
					.addOption('head_tail', t("head_tail"))
					.addOption('heading', t("heading"))
					.setValue(this.plugin.settings.metaTruncateMethod)
					.onChange(async (value) => {
						this.plugin.settings.metaTruncateMethod = value;
						await this.plugin.saveSettings();
					});
			});

		if (toggleCutSetting) {
			truncateSetting.setDisabled(!this.plugin.settings.metaIsTruncate);
			maxTokensSetting.setDisabled(!this.plugin.settings.metaIsTruncate);
		}

		// 标签设置部分
		new Setting(containerEl).setName(t("taggingOptions"))
			.setDesc(t("taggingOptionsDesc"))
			.setHeading().setClass('setting-item-nested');

		// 添加标签字段名设置
		new Setting(containerEl)
			.setName(t('tagsFieldName'))
			.setDesc(t('tagsFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaTagsFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaTagsFieldName = value || 'tags';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("extractTags"))
			.setDesc(t("extractTagsDesc"))
			.setClass('setting-item-nested')
			.addButton((btn) => {
				btn.setButtonText(t("extract"))
					.setCta()
					.onClick(async () => {
						const tags: Record<string, number> = await loadTags(this.app);
						const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
						//const topTags = sortedTags.slice(0, 30).map(tag => tag[0]);
						const topTags = sortedTags.filter(([_, count]) => count > 2).map(([tag]) => tag);
						let currentTagList = this.plugin.settings.tags;
						for (const tag of topTags) {
							if (!currentTagList.includes(tag)) {
								currentTagList.push(tag);
							}
						}
						this.plugin.settings.tags = currentTagList;
						textComponent.setValue(this.plugin.settings.tags.join('\n'));
					});
			});
		new Setting(containerEl)
			.setName(t("tagList"))
			.setDesc(t("tagListDesc"))
			.setClass('setting-item-nested')
			.addTextArea((text) => {
				textComponent = text;
				text.setValue(this.plugin.settings.tags.join('\n'))
					.onChange(async (value) => {
						this.plugin.settings.tags = value.split('\n').map(tag => tag.trim()).filter(tag => tag !== '');
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '7');
				text.inputEl.addClass('setting-textarea');
			});

		// 添加标签提示词设置
		new Setting(containerEl)
			.setName(t('metaTagsPrompt'))
			.setDesc(t('metaTagsPromptDesc'))
			.setClass('setting-item-nested')
			.addTextArea(text => {
				text.setPlaceholder(this.plugin.settings.metaTagsPrompt)
					.setValue(this.plugin.settings.metaTagsPrompt)
					.onChange(async (value) => {
						this.plugin.settings.metaTagsPrompt = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '3');
				text.inputEl.addClass('setting-textarea');
			});

		// 类别设置部分
		new Setting(containerEl).setName(t("categoryOptions"))
			.setDesc(t("categoryOptionsDesc"))
			.setHeading().setClass('setting-item-nested');

		new Setting(containerEl)
			.setName(t('enableCategory'))
			.setDesc(t('enableCategoryDesc'))
			.setClass('setting-item-nested')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.metaCategoryEnabled)
				.onChange(async (value) => {
					this.plugin.settings.metaCategoryEnabled = value;
					await this.plugin.saveSettings();
				}));

		// 添加类别字段名设置
		new Setting(containerEl)
			.setName(t('categoryFieldName'))
			.setDesc(t('categoryFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaCategoryFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaCategoryFieldName = value || 'category';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("categoryList"))
			.setDesc(t("categoryListDesc"))
			.setClass('setting-item-nested')
			.addTextArea((text) => {
				text.setValue(this.plugin.settings.categories.join('\n'))
					.onChange(async (value) => {
						this.plugin.settings.categories = value.split('\n').map(cat => cat.trim()).filter(cat => cat !== '');
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '5');
				text.inputEl.addClass('setting-textarea');
			});

		// 添加类别提示词设置
		new Setting(containerEl)
			.setName(t('metaCategoryPrompt'))
			.setDesc(t('metaCategoryPromptDesc'))
			.setClass('setting-item-nested')
			.addTextArea(text => {
				text.setPlaceholder(this.plugin.settings.metaCategoryPrompt)
					.setValue(this.plugin.settings.metaCategoryPrompt)
					.onChange(async (value) => {
						this.plugin.settings.metaCategoryPrompt = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '3');
				text.inputEl.addClass('setting-textarea');
			});

		// 描述设置部分
		new Setting(containerEl).setName(t("description"))
			.setDesc(t("descriptionDesc"))
			.setHeading().setClass('setting-item-nested');

		// 添加描述字段名设置
		new Setting(containerEl)
			.setName(t('descriptionFieldName'))
			.setDesc(t('descriptionFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaDescriptionFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaDescriptionFieldName = value || 'description';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("descriptionPrompt"))
			.setDesc(t("descriptionPromptDesc"))
			.setClass('setting-item-nested')
			.addTextArea((text) => {
				text.setValue(this.plugin.settings.metaDescription)
					.onChange(async (value) => {
						this.plugin.settings.metaDescription = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '3');
				text.inputEl.addClass('setting-textarea');
			});

		// 新增标题设置部分
		new Setting(containerEl).setName(t("title"))
			.setDesc(t("titleDesc"))
			.setHeading().setClass('setting-item-nested');

		// 添加标题字段名设置
		new Setting(containerEl)
			.setName(t('titleFieldName'))
			.setDesc(t('titleFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaTitleFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaTitleFieldName = value || 'title';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("enableTitle"))
			.setDesc(t("enableTitleDesc"))
			.setClass('setting-item-nested')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.metaTitleEnabled)
					.onChange(async (value) => {
						this.plugin.settings.metaTitleEnabled = value;
						await this.plugin.saveSettings();
						titlePromptSetting.setDisabled(!value);
					});
			});

		const titlePromptSetting = new Setting(containerEl)
			.setName(t("titlePrompt"))
			.setDesc(t("titlePromptDesc"))
			.setClass('setting-item-nested')
			.addTextArea((text) => {
				text.setValue(this.plugin.settings.metaTitlePrompt)
					.onChange(async (value) => {
						this.plugin.settings.metaTitlePrompt = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.setAttr('rows', '3');
				text.inputEl.addClass('setting-textarea');
			});

		titlePromptSetting.setDisabled(!this.plugin.settings.metaTitleEnabled);

		// 新增编辑时间设置部分
		new Setting(containerEl).setName(t("editTime"))
			.setDesc(t("editTimeDesc"))
			.setHeading().setClass('setting-item-nested');

		// 添加更新时间字段名设置
		new Setting(containerEl)
			.setName(t('updateTimeFieldName'))
			.setDesc(t('updateTimeFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaUpdatedFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaUpdatedFieldName = value || 'updated';
					await this.plugin.saveSettings();
				}));

		// 添加创建时间字段名设置
		new Setting(containerEl)
			.setName(t('createTimeFieldName'))
			.setDesc(t('createTimeFieldNameDesc'))
			.setClass('setting-item-nested')
			.addText(text => text
				.setValue(this.plugin.settings.metaCreatedFieldName)
				.onChange(async (value) => {
					this.plugin.settings.metaCreatedFieldName = value || 'created';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t("enableEditTime"))
			.setDesc(t("enableEditTimeDesc"))
			.setClass('setting-item-nested')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.metaEditTimeEnabled)
					.onChange(async (value) => {
						this.plugin.settings.metaEditTimeEnabled = value;
						await this.plugin.saveSettings();
						editTimeFormatSetting.setDisabled(!value);
					});
			});

		const editTimeFormatSetting = new Setting(containerEl)
			.setName(t("editTimeFormat"))
			.setDesc(t("editTimeFormatDesc"))
			.setClass('setting-item-nested')
			.addText((text) => {
				text.setValue(this.plugin.settings.metaEditTimeFormat)
					.setPlaceholder('YYYY-MM-DD HH:mm:ss')
					.onChange(async (value) => {
						this.plugin.settings.metaEditTimeFormat = value;
						await this.plugin.saveSettings();
					});
			});

		editTimeFormatSetting.setDisabled(!this.plugin.settings.metaEditTimeEnabled);

		// 添加自定义元数据设置
		new Setting(containerEl)
			.setName(t('customMetadata'))
			.setDesc(t('customMetadataDesc'))
			.setHeading().setClass('setting-item-nested')
			.addButton(button => button
				.setButtonText(t('addField'))
				.onClick(async () => {
					this.plugin.settings.customMetadata.push({
						key: '',
						value: ''
					});
					await this.plugin.saveSettings();
					this.display();
				}));

		interface CustomMetadata {
			key: string;
			value: string;
		}

		this.plugin.settings.customMetadata.forEach((meta: CustomMetadata, index: number) => {
			const setting = new Setting(containerEl)
				.addText(text => text
					.setPlaceholder(t('fieldKey'))
					.setValue(meta.key)
					.onChange(async (value) => {
						this.plugin.settings.customMetadata[index].key = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder(t('fieldValue'))
					.setValue(meta.value)
					.onChange(async (value) => {
						this.plugin.settings.customMetadata[index].value = value;
						await this.plugin.saveSettings();
					}))
				.addButton(button => button
					.setIcon('trash')
					.onClick(async () => {
						this.plugin.settings.customMetadata.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
		});

		// 捐赠部分
		new Setting(containerEl).setName(t('donate')).setHeading();
		new Setting(containerEl)
			.setName(t('supportThisPlugin'))
			.setDesc(t('supportThisPluginDesc'))
			.addButton((button) => {
				button.setButtonText(t('bugMeACoffee'))
					.setCta()
					.onClick(() => {
						window.open('https://buymeacoffee.com/xieyan0811y', '_blank');
					});
			});
	}
}