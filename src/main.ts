import { Editor, MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, ExMemoSettings, ExMemoSettingTab } from './settings';
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
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
