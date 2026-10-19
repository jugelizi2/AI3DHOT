// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * tagColor 是飞书推送卡片里跟在标题后面的这一类小标签的颜色（飞书 text_tag 的颜色名）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  { key: "ai-models", tagColor: "indigo", label: "模型", feedLabel: "三维 AI 模型", section: "三维模型发布/更新", guide: "三维生成、CAD 生成、几何理解、重建与空间智能模型的发布、权重开放、版本和能力变化。仅对通用大模型的建模能力有具体证据时收录；可使用的软件、插件和服务归产品。" },
  { key: "ai-products", tagColor: "turquoise", label: "产品", feedLabel: "产品", section: "建模产品与工具链", guide: "CAD、CAE、CAM、BIM、DCC 软件及三维生成平台、插件、Agent、API 和开源工具的重要发布更新。几何内核、数据交换和工程工具有明确建模价值时可收录。" },
  { key: "industry", tagColor: "orange", label: "行业", feedLabel: "行业", section: "行业与生态", guide: "建模、工业软件和三维内容领域的融资并购、合作、经营、授权政策和行业变化。缺少实质变化的宣传和活动不是重要进展。" },
  { key: "paper", tagColor: "violet", label: "论文", feedLabel: "论文", section: "论文与研究", guide: "CAD 表示、几何算法、参数化生成、三维生成、重建、空间理解及 AI 仿真的论文、技术报告、数据集和新基准。研究发布不等于产品上线。" },
  { key: "tip", tagColor: "green", label: "实践", feedLabel: "实践", section: "实践与测评", guide: "有具体任务、步骤或结果的建模教程、复现、独立测评和生产管线实践。讲解已有工具的使用归实践；首次发布该工具归产品。", commentary: true },
  { key: "opinion", tagColor: "purple", label: "观点", feedLabel: "观点", section: "观点与分析", guide: "有事实依据的技术路线、软件形态与产业分析。重点是作者的判断；实际产品发布、研究结果和企业动作归对应类别。", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布（AI 行业是新模型）：日报报头的“N 个新模型”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 * 没有这样一类的行业设成 null，报头就不显示这个数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "ai-models", tag: "模型发布", unit: "个模型发布" };

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["ai", "api", "llm", "gpu", "cad", "cae", "cam", "bim", "dcc", "3d", "mesh", "b-rep", "nurbs", "3dgs", "nerf", "usd", "mcp"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "产品更新", "模型发布", "论文/研究", "开源/仓库", "教程/实践", "现象/趋势", "大佬观点", "评测/基准", "安全/对齐", "行业动态", "政策/监管",
  "非AI/通用工具", "其他",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "Agent", "编码", "推理", "多模态", "语音", "视频", "图像生成", "RAG", "端侧", "数据/训练", "搜索", "部署/工程", "开源生态", "具身智能", "MCP/工具调用",
  "CAD", "CAE", "CAM", "BIM", "DCC", "生成式3D", "三维重建", "空间智能", "Text-to-CAD", "参数化建模", "几何内核", "B-Rep", "NURBS", "网格/拓扑", "3DGS", "NeRF", "Scan-to-CAD", "点云", "纹理/材质", "绑定/动画", "仿真/优化", "制造/3D打印", "数字孪生", "Blender", "Rhino/Grasshopper", "USD/互操作",
] as const;

/** 可选的实体标签（公司、机构、平台）。 */
export const ENTITY_TAGS = ["OpenAI", "Anthropic", "DeepSeek", "DeepMind", "Google", "Meta", "Microsoft", "xAI", "Hugging Face", "GitHub", "arXiv", "Meshy", "Tripo", "Hyper3D", "Zoo", "Backflip", "Adam", "Autodesk", "McNeel", "Blender", "SimScale", "Sloyd", "Shapr3D", "Onshape", "Siemens", "Dassault Systèmes", "腾讯混元", "World Labs"] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "AI CAD": "CAD",
  "Text to CAD": "Text-to-CAD",
  "text-to-cad": "Text-to-CAD",
  "text-to-3d": "生成式3D",
  "image-to-3d": "生成式3D",
  "生成式 3D": "生成式3D",
  "3D Gaussian Splatting": "3DGS",
  "Gaussian Splatting": "3DGS",
  "扫描转CAD": "Scan-to-CAD",
  "CAD内核": "几何内核",
  "Rhino": "Rhino/Grasshopper",
  "Grasshopper": "Rhino/Grasshopper",
  "四边面": "网格/拓扑",
  "测评": "评测/基准",
  "教程/玩法": "教程/实践", "技巧/最佳实践": "教程/实践", "合作/生态": "行业动态", "融资/收购": "行业动态", "公司动态": "行业动态",
  合作: "行业动态", 生态: "行业动态", 融资: "行业动态", 收购: "行业动态", 投资: "行业动态", 并购: "行业动态",
  政策: "政策/监管", 监管: "政策/监管", 法规: "政策/监管", 安全: "安全/对齐", 对齐: "安全/对齐",
  论文: "论文/研究", 研究: "论文/研究", paper: "论文/研究", papers: "论文/研究",
  "open-source": "开源/仓库", 开源: "开源/仓库", 仓库: "开源/仓库", repo: "开源/仓库",
  教程: "教程/实践", 玩法: "教程/实践", 指南: "教程/实践", 技巧: "教程/实践", 最佳实践: "教程/实践", 实践: "教程/实践",
  产品: "产品更新", 更新: "产品更新", 趋势: "现象/趋势", 现象: "现象/趋势", 观点: "大佬观点",
  视频生成: "视频", 非ai: "非AI/通用工具", "non-ai": "非AI/通用工具", 通用工具: "非AI/通用工具", 工程工具: "非AI/通用工具",
  安全扫描: "非AI/通用工具", devops: "非AI/通用工具", 行业: "行业动态", 动态: "行业动态",
};

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是这家公司发消息时开头用的组织名（公司、实验室、团队），
 * 在它自己的主题页上读者知道说的是谁，可以省去；otherNames 是公司的其他称呼（官方账号名、子品牌）。
 * 所有这些名字都用来认出说的是哪家公司，比如把事实的主体对到发布方。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  "meshy": {"name":"Meshy","displayTag":"Meshy","aliases":["Meshy","Meshy AI"],"orgNames":["Meshy"]},
  "tripo": {"name":"Tripo / VAST","displayTag":"Tripo","aliases":["Tripo","Tripo AI","Tripo3D"],"orgNames":["Tripo","VAST"],"otherNames":["tripoai"]},
  "hyper3d": {"name":"Hyper3D / Deemos","displayTag":"Hyper3D","aliases":["Hyper3D","Deemos","Rodin"],"orgNames":["Hyper3D","Deemos"],"otherNames":["DeemosTech"]},
  "zoo": {"name":"Zoo","displayTag":"Zoo","aliases":["Zoo Design Studio","Zoo.dev","KittyCAD","Zookeeper"],"orgNames":["Zoo","KittyCAD"],"otherNames":["zoodotdev"]},
  "backflip": {"name":"Backflip","displayTag":"Backflip","aliases":["Backflip","Backflip AI"],"orgNames":["Backflip"]},
  "adam": {"name":"Adam","displayTag":"Adam","aliases":["Adam CAD","AdamCAD","adam.new"],"orgNames":["Adam"],"otherNames":["adamdotnew"]},
  "autodesk": {"name":"Autodesk","displayTag":"Autodesk","aliases":["Autodesk","欧特克","Autodesk Fusion","Autodesk Forma","Revit"],"orgNames":["Autodesk","Autodesk Research","Autodesk AI Lab"]},
  "mcneel": {"name":"McNeel / Rhino","displayTag":"McNeel","aliases":["McNeel","Rhinoceros","Rhino","Grasshopper"],"orgNames":["McNeel","Robert McNeel & Associates"]},
  "blender": {"name":"Blender Foundation","displayTag":"Blender","aliases":["Blender Foundation","Blender Institute","Blender"],"orgNames":["Blender Foundation","Blender Institute"]},
  "simscale": {"name":"SimScale","displayTag":"SimScale","aliases":["SimScale"],"orgNames":["SimScale"]},
  "sloyd": {"name":"Sloyd","displayTag":"Sloyd","aliases":["Sloyd"],"orgNames":["Sloyd"]},
  "shapr3d": {"name":"Shapr3D","displayTag":"Shapr3D","aliases":["Shapr3D"],"orgNames":["Shapr3D"]},
  "onshape": {"name":"Onshape / PTC","displayTag":"Onshape","aliases":["Onshape","PTC"],"orgNames":["Onshape","PTC"]},
  "siemens": {"name":"Siemens","displayTag":"Siemens","aliases":["Siemens","西门子","Siemens NX","Simcenter","Solid Edge"],"orgNames":["Siemens","Siemens Digital Industries Software"]},
  "dassault": {"name":"Dassault Systèmes","displayTag":"Dassault Systèmes","aliases":["Dassault Systèmes","Dassault Systemes","达索系统","SOLIDWORKS","CATIA","SIMULIA"],"orgNames":["Dassault Systèmes"]},
  "tencent": {"name":"腾讯混元3D","displayTag":"腾讯混元","aliases":["腾讯混元","混元3D","Hunyuan3D","HunyuanWorld","Tencent Hunyuan"],"orgNames":["腾讯","Tencent","Tencent Hunyuan"],"otherNames":["TencentHunyuan"]},
  "world-labs": {"name":"World Labs","displayTag":"World Labs","aliases":["World Labs"],"orgNames":["World Labs"],"otherNames":["theworldlabs"]},
  "arxiv": {"name":"arXiv","displayTag":"arXiv","aliases":["arXiv"],"orgNames":["arXiv"]},
  "qbitai": {"name":"量子位","displayTag":null,"aliases":["量子位","QbitAI"]},
  "cadzxw": {"name":"CAD自学网","displayTag":null,"aliases":["CAD自学网","cadzxw"]},
  "thinking-machines": { name: "Thinking Machines Lab", displayTag: null, aliases: ["Thinking Machines"] },
  amd: { name: "AMD", displayTag: null, aliases: ["AMD", "Advanced Micro Devices"] },
  openai: { name: "OpenAI", displayTag: "OpenAI", aliases: ["OpenAI", "ChatGPT", "Sora", "Codex", "GPT"], orgNames: ["OpenAI"], otherNames: ["OpenAI Developers"] },
  anthropic: { name: "Anthropic", displayTag: "Anthropic", aliases: ["Anthropic", "Claude"], orgNames: ["Anthropic"], otherNames: ["Claude Code"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "DeepMind", "Gemini", "谷歌"], orgNames: ["Google DeepMind", "Google Research", "Google", "DeepMind", "谷歌"], otherNames: ["Google AI", "Google Labs", "Google Cloud"] },
  deepseek: { name: "DeepSeek", displayTag: "DeepSeek", aliases: ["DeepSeek", "深度求索"], orgNames: ["DeepSeek", "深度求索"] },
  qwen: { name: "千问 Qwen", displayTag: null, aliases: ["Qwen", "通义", "阿里"], orgNames: ["通义千问", "通义实验室", "阿里巴巴", "阿里云", "阿里", "Qwen Team", "Qwen", "Alibaba"], otherNames: ["千问", "千问APP", "Alibaba Cloud"] },
  kimi: { name: "Kimi / 月之暗面", displayTag: null, aliases: ["Kimi", "月之暗面", "Moonshot"], orgNames: ["Moonshot AI", "月之暗面", "Kimi"] },
  minimax: { name: "MiniMax", displayTag: null, aliases: ["MiniMax", "海螺"], orgNames: ["MiniMax", "稀宇科技"] },
  zhipu: { name: "智谱 GLM", displayTag: null, aliases: ["智谱", "GLM", "Z.ai"], orgNames: ["智谱AI", "智谱", "Zhipu AI", "Z.ai"], otherNames: ["Zhipu"] },
  xai: { name: "xAI", displayTag: "xAI", aliases: ["xAI", "Grok"], orgNames: ["SpaceX Super Intelligence", "SpaceXAI", "SpaceXSI", "xAI"], otherNames: ["Grok Bot"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Llama"], orgNames: ["Meta Superintelligence Labs", "Meta AI", "Meta"], otherNames: ["AI at Meta", "Muse"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "Copilot"], orgNames: ["Microsoft Research", "Microsoft AI", "Microsoft", "微软"] },
  nvidia: { name: "NVIDIA", displayTag: null, aliases: ["NVIDIA", "英伟达"], orgNames: ["NVIDIA", "英伟达"] },
  "hugging-face": { name: "Hugging Face", displayTag: "Hugging Face", aliases: ["Hugging Face"], orgNames: ["Hugging Face", "HuggingFace"] },
  cursor: { name: "Cursor", displayTag: null, aliases: ["Cursor", "Anysphere"], orgNames: ["Cursor"] },
  openrouter: { name: "OpenRouter", displayTag: null, aliases: ["OpenRouter"], orgNames: ["OpenRouter"] },
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 行业没有这个问题时可以留空数组。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "meshy", name: "Meshy", patterns: [/meshy/i] },
  { id: "tripo", name: "Tripo", patterns: [/\btripo(?:3d)?\b|\bvast\b/i] },
  { id: "hyper3d", name: "Hyper3D", patterns: [/hyper3d|deemos|\brodin\b/i] },
  { id: "zoo", name: "Zoo", patterns: [/zoo\.dev|zoodotdev|kittycad|zookeeper|zoo design studio/i] },
  { id: "backflip", name: "Backflip", patterns: [/backflip/i] },
  { id: "adam", name: "Adam", patterns: [/adam\.new|adamdotnew|adamcad/i] },
  { id: "autodesk", name: "Autodesk", patterns: [/autodesk|欧特克|\brevit\b/i] },
  { id: "mcneel", name: "McNeel / Rhino", patterns: [/mcneel|rhinoceros|\brhino\b|grasshopper/i] },
  { id: "blender", name: "Blender", patterns: [/\bblender\b/i] },
  { id: "simscale", name: "SimScale", patterns: [/simscale/i] },
  { id: "sloyd", name: "Sloyd", patterns: [/sloyd/i] },
  { id: "shapr3d", name: "Shapr3D", patterns: [/shapr3d/i] },
  { id: "onshape", name: "Onshape", patterns: [/onshape|\bptc\b/i] },
  { id: "siemens", name: "Siemens", patterns: [/siemens|西门子|simcenter|solid edge/i] },
  { id: "dassault", name: "Dassault Systèmes", patterns: [/dassault|达索|solidworks|\bcatia\b|simulia/i] },
  { id: "tencent", name: "腾讯混元3D", patterns: [/腾讯|tencent|混元|hunyuan/i] },
  { id: "world-labs", name: "World Labs", patterns: [/world labs|theworldlabs/i] },
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bgpt-?[o\d]|\bsora\b|\bcodex\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i, /\b(?:opus|sonnet|haiku)\s*\d+(?:[.\-]\d+)*\b/i, /\bfable\s*\d+(?:[.\-]\d+)*\b|\bmythos\b/i] },
  { id: "google", name: "Google / Gemini", patterns: [/google|deepmind|\bgemini\b|notebooklm|\bveo\s?\d|\bAlphaFold\b|\bAMIE\b/i] },
  { id: "deepseek", name: "DeepSeek", patterns: [/deepseek|深度求索/i] },
  { id: "xai", name: "xAI / Grok", patterns: [/\bxai\b|\bgrok\b/i] },
  { id: "meta", name: "Meta / Llama", patterns: [/\bMeta\b/, /\bmeta\s?ai\b|\bllama\b/i] },
  { id: "microsoft", name: "Microsoft / Copilot", patterns: [/microsoft|copilot|微软/i] },
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|\bnemotron\b|\bnemo\b|\bblackwell\b|\brubin(?:\s+ultra)?\b|\bcuda\b/i] },
  { id: "qwen", name: "千问 Qwen", patterns: [/\bqwen|通义|千问/i] },
  { id: "hugging-face", name: "Hugging Face", patterns: [/hugging\s?face/i] },
  { id: "cursor", name: "Cursor", patterns: [/\bCursor\b/] },
  { id: "kimi", name: "Kimi / 月之暗面", patterns: [/\bkimi\b|月之暗面|\bmoonshot\s?ai\b/i] },
  { id: "openrouter", name: "OpenRouter", patterns: [/openrouter/i] },
  { id: "minimax", name: "MiniMax", patterns: [/minimax/i] },
  { id: "zhipu", name: "智谱 GLM", patterns: [/智谱|\bglm-?[4-9]/i] },
  { id: "hunyuan", name: "腾讯混元", patterns: [/混元|hunyuan/i] },
  { id: "doubao", name: "字节豆包", patterns: [/豆包|doubao|字节跳动|bytedance/i] },
  { id: "mistral", name: "Mistral", patterns: [/mistral/i] },
  { id: "perplexity", name: "Perplexity", patterns: [/\bPerplexity\b/] },
  { id: "runway", name: "Runway", patterns: [/\brunway\b/i] },
  { id: "suno", name: "Suno", patterns: [/\bsuno\b/i] },
  { id: "midjourney", name: "Midjourney", patterns: [/midjourney/i] },
  { id: "stability-ai", name: "Stability AI", patterns: [/stability\s?ai/i] },
  { id: "elevenlabs", name: "ElevenLabs", patterns: [/eleven\s?labs/i] },
  { id: "vllm", name: "vLLM", patterns: [/\bvllm\b/i] },
  { id: "ollama", name: "Ollama", patterns: [/\bollama\b/i] },
  { id: "windsurf", name: "Windsurf", patterns: [/windsurf/i] },
  { id: "devin", name: "Devin", patterns: [/\bdevin\b/i] },
  { id: "manus", name: "Manus", patterns: [/\bmanus\b/i] },
  { id: "apple", name: "Apple AI", patterns: [/\bapple\s?(intelligence|silicon|ai)\b|苹果(智能|\s?AI)/i] },
  { id: "amazon", name: "Amazon / AWS", patterns: [/amazon|\baws\b|亚马逊/i] },
  { id: "baidu", name: "百度文心", patterns: [/百度|baidu|文心|\bernie\s?bot\b/i] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  {"entityId":"meshy","domains":["meshy.ai"]},
  {"entityId":"tripo","domains":["tripo3d.ai"]},
  {"entityId":"hyper3d","domains":["hyper3d.ai","deemos.com","deemos.dev"]},
  {"entityId":"zoo","domains":["zoo.dev"]},
  {"entityId":"backflip","domains":["backflip.ai"]},
  {"entityId":"adam","domains":["adam.new"]},
  {"entityId":"autodesk","domains":["autodesk.com"]},
  {"entityId":"mcneel","domains":["rhino3d.com","mcneel.com"]},
  {"entityId":"blender","domains":["blender.org"]},
  {"entityId":"simscale","domains":["simscale.com"]},
  {"entityId":"sloyd","domains":["sloyd.ai"]},
  {"entityId":"shapr3d","domains":["shapr3d.com"]},
  {"entityId":"onshape","domains":["onshape.com","ptc.com"]},
  {"entityId":"siemens","domains":["siemens.com"]},
  {"entityId":"dassault","domains":["3ds.com","solidworks.com"]},
  {"entityId":"tencent","domains":["hunyuan.tencent.com"]},
  {"entityId":"world-labs","domains":["worldlabs.ai"]},
  {"entityId":"qbitai","domains":["qbitai.com"]},
  {"entityId":"cadzxw","domains":["cadzxw.com"]},
  { entityId: "openai", domains: ["openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "google", domains: ["deepmind.google", "ai.google", "blog.google"] },
  { entityId: "deepseek", domains: ["deepseek.com"] },
  { entityId: "xai", domains: ["x.ai"] },
  { entityId: "meta", domains: ["ai.meta.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "qwen", domains: ["qwen.ai"] },
  { entityId: "cursor", domains: ["cursor.com"] },
  { entityId: "openrouter", domains: ["openrouter.ai"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "meta", pattern: /@AIatMeta\b/i },
  { entityId: "zhipu", pattern: /\bZhipu(?:\s+AI\b|['’]s\b)/i },
];
