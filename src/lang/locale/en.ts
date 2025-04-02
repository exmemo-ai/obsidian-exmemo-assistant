// English

export default {
  // Basic translations
  "confirm": "Confirm",
  "yes": "Yes",
  "no": "No",
  "llmLoading": "LLM is thinking...",
  "noResult": "LLM no result",
  "pleaseOpenFile": "Please open a file first",
  "llmError": "An error occurred, please try again later",
  "inputPrompt": "Please enter the prompt",
  "chatButton": "Chat",
  "pleaseSelectText": "Please select the text to be processed first",
  "currentFileNotMarkdown": "The current file is not a markdown file",
  "fileAlreadyContainsTagsAndDescription": "The file already contains tags and description",
  "parseError": "Failed to parse the returned result",
  "metaUpdated": "Meta data updated",
  "noProviderSelected": "No LLM provider selected",

  // LLM Settings
  "llmSettings": "LLM",
  "apiKey": "API key",
  "baseUrl": "Base URL",
  "modelName": "Model name",
  "apiProvider": "API Provider",
  "apiProviderDesc": "Configure your AI provider settings. Custom providers require additional configuration.",
  "llmConfiguration": "API Configuration",
  "selectApiProvider": "Select the API provider",
  "endpoint": "Endpoint",
  "enterEndpoint": "Enter the endpoint for your API",
  "addProvider": "Add Provider",
  "editProvider": "Edit",
  "deleteProvider": "Delete",
  "providerName": "Provider Name",
  "test": "Test",
  "openRouter": "OpenRouter",
  "providerType": "Provider Type",
  "selectProviderType": "Select the type of LLM provider",
  "modelSelection": "Model Selection",
  "selectModel": "Select the model for this provider",
  "currentModel": "Current Model",
  "modelOptions": "Model Options",
  "selectModelFromProvider": "Select a model from the current provider",
  "currentlySelected": "Currently selected",
  "model": "Model",
  "selectTheModelToUse": "Select the model to use",
  "enterYourApiKey": "Enter your API key",
  "show": "Show",
  "hide": "Hide",
  "apiConfig": "API Configuration",
  "customProviderConfig": "Custom Provider Configuration",
  "baseUrlDesc": "Enter the base URL for your custom API endpoint",
  "endpointDesc": "Enter the endpoint for your API",

  // Meta Update Settings
  "metaUpdateSetting": "Update meta",
  "updateMetaOptions": "Update",
  "updateMetaOptionsDesc": "If it already exists, choose whether to regenerate",
  "updateForce": "Force update existing items",
  "updateNoLLM": "Only update items that do not use LLM",

  // Content Truncation Settings
  "truncateContent": "Truncate long content?",
  "truncateContentDesc": "When using LLM, whether to truncate if the content exceeds the maximum word count",
  "maxContentLength": "Maximum content length",
  "maxContentLengthDesc": "Set the maximum token limit for the content",
  "truncateMethod": "Truncation method",
  "truncateMethodDesc": "Choose how to handle content that exceeds the limit",
  "head_only": "Extract only the beginning",
  "head_tail": "Extract the beginning and the end",
  "heading": "Extract the heading and the text below it",

  // Tag Settings
  "taggingOptions": "Tags",
  "taggingOptionsDesc": "Automatically generating tags",
  "extractTags": "Extract tags",
  "extractTagsDesc": "Extract tags that appear more than twice from all notes and fill them in the candidate box",
  "extract": "Extract",
  "tagList": "Tag list",
  "tagListDesc": "Optional tag list, separated by line breaks",
  "metaTagsPrompt": "Tags Generation Prompt",
  "metaTagsPromptDesc": "The prompt for generating tags, where you can set the language, capitalization, etc.",
  "defaultTagsPrompt": "Please extract up to three tags based on the following article content, and in the same language as the content.",

  // Description Settings
  "description": "Description",
  "descriptionDesc": "Automatically generating article descriptions",
  "descriptionPrompt": "Prompt",
  "descriptionPromptDesc": "Prompt for generating descriptions",
  "defaultSummaryPrompt": "Summarize the core content of the article directly without using phrases like 'this article.' The summary should be no more than 50 words, and in the same language as the content.",

  // Title Settings
  "title": "Title",
  "titleDesc": "Automatically generate document titles",
  "enableTitle": "Enable auto title generation",
  "enableTitleDesc": "Enable to automatically generate document titles",
  "titlePrompt": "Title prompt",
  "titlePromptDesc": "Prompt for generating titles",
  "defaultTitlePrompt": "Please generate a concise and clear title for this document, no more than 10 words, and do not use quotes.",

  // Edit Time Settings
  "editTime": "Edit time",
  "editTimeDesc": "Automatically update the edit time of the document",
  "enableEditTime": "Enable auto update edit time",
  "enableEditTimeDesc": "Enable to automatically update the edit time of the document",
  "editTimeFormat": "Edit time format",
  "editTimeFormatDesc": "Set the format of the edit time",

  // Custom Field Names
  "customFieldNames": "Custom field names",
  "customFieldNamesDesc": "Custom field names for metadata",
  "tagsFieldName": "Tags field name",
  "tagsFieldNameDesc": "Field name used for automatically generating tags (default: tags)",
  "descriptionFieldName": "Description field name",
  "descriptionFieldNameDesc": "Field name used for automatically generating descriptions (default: description)",
  "titleFieldName": "Title field name",
  "titleFieldNameDesc": "Field name used for automatically generating titles (default: title)",
  "updateTimeFieldName": "Update time field name",
  "updateTimeFieldNameDesc": "Field name used for automatically updating the update time (default: updated)",
  "createTimeFieldName": "Create time field name",
  "createTimeFieldNameDesc": "Field name used for automatically updating the create time (default: created)",

  // Custom Metadata
  "customMetadata": "Custom metadata",
  "customMetadataDesc": "Add custom metadata fields, e.g.: author=Author Name",
  "addField": "Add field",
  "fieldKey": "Field name",
  "fieldValue": "Field value",

  // Category Settings
  "categoryOptions": "Category",
  "categoryOptionsDesc": "Automatically select appropriate category for articles",
  "enableCategory": "Enable auto category",
  "enableCategoryDesc": "Enable to automatically select category for documents",
  "categoryFieldName": "Category field name",
  "categoryFieldNameDesc": "Field name used for automatically generating category (default: category)",
  "categoryList": "Category list",
  "categoryListDesc": "Optional category list, separated by line breaks",
  "metaCategoryPrompt": "Category prompt",
  "metaCategoryPromptDesc": "Prompt for generating category",
  "defaultCategoryPrompt": "Please select a suitable category for this document",
  "categoryUnknown": "Unknown",
  "defaultCategories": "[\"Travel\", \"Shopping\", \"Mood\", \"Book Review\", \"Tech & Knowledge\", \"Entertainment\", \"Papers to Read\", \"Ideas & Inspiration\", \"Todo\", \"Methodology\", \"Work Thoughts\", \"Investment\", \"Books to Read\", \"Personal Info\", \"Accounting\", \"Tasks\", \"Health\", \"Excerpts\", \"Daily Life\", \"Worldview\", \"Food\"]",

  // Donation Related
  "donate": "Donate",
  "supportThisPlugin": "Support this plugin",
  "supportThisPluginDesc": "If you find this plugin helpful, consider buying me a coffee!",
  "bugMeACoffee": "Buy me a coffee",

  // Commands
  "exmemoAdjustMeta": "Generate meta data"
}