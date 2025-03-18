// 简体中文

export default {
    // 基本翻译
    "confirm": "确认",
    "yes": "是",
    "no": "否",
    "llmLoading": "LLM 思考中...",
    "noResult": "LLM 无结果",
    "pleaseOpenFile": "请先打开一个文件",
    "llmError": "LLM 错误",
    "inputPrompt":"请输入提示词",
    "chatButton": "对话",
    "pleaseSelectText": "请先选择文本",
    "currentFileNotMarkdown": "当前文件不是 markdown 文件",
    "fileAlreadyContainsTagsAndDescription": "文件已经包含标签和描述",
    "parseError": "解析错误",
    "metaUpdated": "元数据已更新",

    // 设置相关
    "llmSettings": "LLM",
    "apiKey": "API 密钥",
    "baseUrl": "基础 URL",
    "modelName": "模型名称",

    // 元数据更新设置
    "metaUpdateSetting": "更新元数据",
    "updateMetaOptions": "更新选项",
    "updateMetaOptionsDesc": "如果已经存在，是否重新生成",
    "updateForce": "强制更新",
    "updateNoLLM": "只更新不用LLM的项",

    // 内容截断设置
    "truncateContent": "内容太长是否截断",
    "truncateContentDesc": "使用LLM时，如果内容超过最大字数，是否截断",
    "maxContentLength": "最大内容长度",
    "maxContentLengthDesc": "设置内容的最大 token 限制",
    "truncateMethod": "截断方式",
    "truncateMethodDesc": "选择内容超过限制时的处理方式",
    "head_only": "仅提取开头部分",
    "head_tail": "提取开头和结尾部分",
    "heading": "提取标题及其下方的文字",

    // 标签设置
    "taggingOptions": "标签",
    "taggingOptionsDesc": "自动生成标签",
    "extractTags": "提取标签",
    "extractTagsDesc": "从所有笔记中提取出现超过两次的标签",
    "extract": "提取",
    "tagList": "标签列表",
    "tagListDesc": "可选标签列表，使用回车分隔",
    "metaTagsPrompt": "标签生成提示词",
    "metaTagsPromptDesc": "用于生成标签的提示词，可在此设置语言、大小写等",
    "defaultTagsPrompt": "请提取这篇文章中最合适的不超过三个标签，并使用与内容相同的语言。",

    // 描述设置
    "description": "描述",
    "descriptionDesc": "自动生成文章描述",
    "descriptionPrompt": "描述提示词",
    "descriptionPromptDesc": "用于生成描述的提示词",
    "defaultSummaryPrompt": "直接总结文章的核心内容，不要使用'这篇文章'这样的短语，不超过50个字，且与内容使用相同语言回答。",

    // 标题相关
    "title": "标题",
    "titleDesc": "自动生成文档标题",
    "enableTitle": "启用自动生成标题",
    "enableTitleDesc": "启用后将自动生成文档标题",
    "titlePrompt": "标题生成提示词",
    "titlePromptDesc": "用于生成标题的提示词",
    "defaultTitlePrompt": "请为这篇文档生成一个简洁明了的标题，不超过10个字，不要使用引号。",
    
    // 编辑时间相关
    "editTime": "编辑时间",
    "editTimeDesc": "自动更新文档编辑时间",
    "enableEditTime": "启用自动更新编辑时间",
    "enableEditTimeDesc": "启用后将自动更新文档的编辑时间",
    "editTimeFormat": "时间格式",
    "editTimeFormatDesc": "编辑时间的格式，使用 moment.js 格式",

    // 自定义字段名相关
    "customFieldNames": "自定义字段名",
    "customFieldNamesDesc": "自定义生成的元数据字段名称",
    "tagsFieldName": "标签字段名",
    "tagsFieldNameDesc": "自动生成标签使用的字段名 (默认: tags)",
    "descriptionFieldName": "描述字段名",
    "descriptionFieldNameDesc": "自动生成描述使用的字段名 (默认: description)",
    "titleFieldName": "标题字段名",
    "titleFieldNameDesc": "自动生成标题使用的字段名 (默认: title)",
    "updateTimeFieldName": "更新时间字段名",
    "updateTimeFieldNameDesc": "自动更新编辑时间使用的字段名 (默认: updated)",
    "createTimeFieldName": "创建时间字段名",
    "createTimeFieldNameDesc": "自动生成创建时间使用的字段名 (默认: created)",

    // 自定义元数据相关
    "customMetadata": "自定义元数据",
    "customMetadataDesc": "添加自定义的元数据字段，如：author=作者名",
    "addField": "添加字段",
    "fieldKey": "字段名",
    "fieldValue": "字段值",

    // 类别设置相关
    "categoryOptions": "类别",
    "categoryOptionsDesc": "自动为文章选择合适的类别",
    "enableCategory": "启用自动分类",
    "enableCategoryDesc": "启用后将自动为文档选择类别",
    "categoryFieldName": "类别字段名",
    "categoryFieldNameDesc": "自动生成类别使用的字段名 (默认: category)",
    "categoryList": "类别列表",
    "categoryListDesc": "可选类别列表，使用回车分隔",
    "metaCategoryPrompt": "类别生成提示词",
    "metaCategoryPromptDesc": "用于生成类别的提示词",
    "defaultCategoryPrompt": "请为这篇文档选择一个合适的类别",
    "categoryUnknown": "未分类",
    "defaultCategories": "[\"旅行\", \"购物\", \"心情\", \"读后感\", \"知识科技\", \"娱乐\", \"待读论文\", \"灵感创意\", \"待办事项\", \"方法论\", \"工作思考\", \"投资\", \"待读书\", \"个人信息\", \"记帐\", \"待做\", \"健康\", \"摘录\", \"日常琐事\", \"世界观\", \"美食\"]",

    // 捐赠相关
    "donate": "捐赠",
    "supportThisPlugin": "支持此插件",
    "supportThisPluginDesc": "如果您喜欢这个插件，可以请我喝杯咖啡",
    "bugMeACoffee": "请我喝杯咖啡",

    // 命令相关
    "exmemoAdjustMeta": "生成元数据"
}