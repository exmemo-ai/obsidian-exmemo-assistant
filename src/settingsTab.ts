import { PluginSettingTab, Setting, App, TextAreaComponent } from 'obsidian';
import { loadTags } from "./utils";
import { t } from "./lang/helpers";
import { ExMemoSettings } from './settings';

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
		new Setting(containerEl).setName(t("llmSettings"))
			.setHeading();
		new Setting(containerEl)
			.setName(t("apiKey"))
			.addText(text => text
				.setPlaceholder('Enter your token')
				.setValue(this.plugin.settings.llmToken)
				.onChange(async (value) => {
					this.plugin.settings.llmToken = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName(t("baseUrl"))
			.addText(text => text
				.setPlaceholder('https://api.openai.com/v1')
				.setValue(this.plugin.settings.llmBaseUrl)
				.onChange(async (value) => {
					this.plugin.settings.llmBaseUrl = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName(t("modelName"))
			.addText(text => text
				.setPlaceholder('gpt-4o')
				.setValue(this.plugin.settings.llmModelName)
				.onChange(async (value) => {
					this.plugin.settings.llmModelName = value;
					await this.plugin.saveSettings();
				}));

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

		// 显示现有的自定义元数据字段
		this.plugin.settings.customMetadata.forEach((meta, index) => {
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