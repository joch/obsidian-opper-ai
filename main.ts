import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';

interface OpperSettings {
	apiKey: string;
	baseUrl: string;
}

const DEFAULT_SETTINGS: OpperSettings = {
	apiKey: '',
	baseUrl: 'https://api.opper.ai/v2'
}

interface OpperAPI {
	call: (functionName: string, input: any, context?: any) => Promise<any>;
}

export default class OpperAIPlugin extends Plugin {
	settings: OpperSettings;
	public api: OpperAPI;

	async onload() {
		await this.loadSettings();

		// Initialize the API
		this.api = {
			call: async (functionName: string, input: any, context?: any) => {
				return await this.callOpper(functionName, input, context);
			}
		};

		// Add settings tab
		this.addSettingTab(new OpperSettingTab(this.app, this));

		console.log('Opper AI plugin loaded');
	}

	onunload() {
		console.log('Opper AI plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async callOpper(functionName: string, input: any, context?: any): Promise<any> {
		if (!this.settings.apiKey) {
			throw new Error('Opper API key not configured. Please set it in plugin settings.');
		}

		const url = `${this.settings.baseUrl}/call`;

		const body: any = {
			name: functionName,
			input: input
		};

		if (context) {
			body.context = context;
		}

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.settings.apiKey}`
				},
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Opper API error (${response.status}): ${errorText}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			if (error instanceof Error) {
				new Notice(`Opper AI error: ${error.message}`);
				throw error;
			}
			throw new Error('Unknown error calling Opper AI');
		}
	}
}

class OpperSettingTab extends PluginSettingTab {
	plugin: OpperAIPlugin;

	constructor(app: App, plugin: OpperAIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Opper AI Settings'});

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your Opper API key (get it from https://platform.opper.ai)')
			.addText(text => {
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					});
				// Make the text input a password field
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('Base URL')
			.setDesc('Opper API base URL (default: https://api.opper.ai/v2)')
			.addText(text => text
				.setPlaceholder('https://api.opper.ai/v2')
				.setValue(this.plugin.settings.baseUrl)
				.onChange(async (value) => {
					this.plugin.settings.baseUrl = value || DEFAULT_SETTINGS.baseUrl;
					await this.plugin.saveSettings();
				}));
	}
}
