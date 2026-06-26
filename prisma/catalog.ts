import { AdPlacement } from "@prisma/client";

export const catalogCategories = [
  { name: "AI 对话", slug: "chat", icon: "MessageSquare", sortOrder: 10 },
  { name: "AI 写作", slug: "writing", icon: "PenLine", sortOrder: 20 },
  { name: "图像生成", slug: "image", icon: "Image", sortOrder: 30 },
  { name: "编程开发", slug: "coding", icon: "Code2", sortOrder: 40 },
] as const;

export const catalogTags = [
  { name: "对话", slug: "chat" },
  { name: "写作", slug: "writing" },
  { name: "图像", slug: "image" },
  { name: "编程", slug: "coding" },
  { name: "精选", slug: "featured" },
] as const;

export type CatalogTool = {
  categorySlug: "chat" | "writing" | "image" | "coding";
  name: string;
  slug: string;
  logoUrl: `https://${string}`;
  summary: string;
  description: string;
  websiteUrl: `https://${string}`;
  officialUrl?: `https://${string}`;
  affiliateUrl?: `https://${string}`;
  isSponsored?: boolean;
  sponsorLabel?: string;
  couponCode?: string;
  pricing?: string;
  sortOrder: number;
  isFeatured: boolean;
  tagSlugs: readonly string[];
};

const catalogToolsBase = [
  {
    categorySlug: "chat",
    name: "ChatGPT",
    slug: "chatgpt",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg",
    summary: "OpenAI 推出的通用多模态 AI 助手。",
    description:
      "支持问答、写作、分析、图片理解、语音和复杂任务协作。适合个人学习、内容创作与日常办公。",
    websiteUrl: "https://chatgpt.com/",
    sortOrder: 10,
    isFeatured: true,
    tagSlugs: ["chat", "featured"],
  },
  {
    categorySlug: "chat",
    name: "Claude",
    slug: "claude",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/anthropic.svg",
    summary: "擅长长文本、推理和自然表达的 AI 助手。",
    description:
      "由 Anthropic 开发，适合阅读长文档、深入分析和高质量写作。支持文件、图像与代码相关任务。",
    websiteUrl: "https://claude.ai/",
    sortOrder: 20,
    isFeatured: true,
    tagSlugs: ["chat", "featured"],
  },
  {
    categorySlug: "chat",
    name: "Gemini",
    slug: "gemini",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlegemini.svg",
    summary: "深度连接 Google 生态的多模态 AI 助手。",
    description:
      "支持文本、图像、文件和研究任务，并可配合 Google 服务使用。适合搜索、学习和办公协作。",
    websiteUrl: "https://gemini.google.com/",
    sortOrder: 30,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Perplexity",
    slug: "perplexity",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/perplexity.svg",
    summary: "提供来源引用的 AI 搜索与研究助手。",
    description:
      "围绕互联网信息检索生成结构化回答，并提供可追溯的参考来源。适合资料查询、事实核验和研究。",
    websiteUrl: "https://www.perplexity.ai/",
    sortOrder: 40,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Microsoft Copilot",
    slug: "microsoft-copilot",
    logoUrl: "https://unavatar.io/copilot.microsoft.com",
    summary: "微软面向搜索与办公场景的 AI 助手。",
    description:
      "支持对话、联网搜索、图片生成和 Microsoft 生态协作。适合 Windows 用户与 Microsoft 365 工作流。",
    websiteUrl: "https://copilot.microsoft.com/",
    sortOrder: 50,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Grok",
    slug: "grok",
    logoUrl: "https://unavatar.io/grok.com",
    summary: "xAI 推出的实时信息与推理助手。",
    description:
      "结合对话、联网信息和多模态能力回答问题。适合追踪热点、内容理解和通用智能任务。",
    websiteUrl: "https://grok.com/",
    sortOrder: 60,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "DeepSeek",
    slug: "deepseek",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/deepseek.svg",
    summary: "支持深度推理与中文任务的通用 AI 助手。",
    description:
      "提供对话、推理、数学和代码能力，在中文环境中使用便捷。适合学习、分析和开发辅助。",
    websiteUrl: "https://chat.deepseek.com/",
    sortOrder: 70,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Poe",
    slug: "poe",
    logoUrl: "https://unavatar.io/poe.com",
    summary: "可集中使用多种模型与机器人的 AI 平台。",
    description:
      "由 Quora 推出，可在一个界面体验不同 AI 模型和社区机器人。适合模型比较与多用途对话。",
    websiteUrl: "https://poe.com/",
    sortOrder: 80,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Meta AI",
    slug: "meta-ai",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/meta.svg",
    summary: "Meta 推出的社交与创作型 AI 助手。",
    description:
      "支持日常问答、创意生成和图像相关能力，并与 Meta 产品生态结合。适合轻量交流和内容创作。",
    websiteUrl: "https://www.meta.ai/",
    sortOrder: 90,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "chat",
    name: "Le Chat",
    slug: "le-chat",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mistralai.svg",
    summary: "Mistral AI 推出的快速多语言聊天助手。",
    description:
      "提供通用问答、文档理解、搜索和创作功能。适合希望体验 Mistral 模型与欧洲 AI 服务的用户。",
    websiteUrl: "https://chat.mistral.ai/",
    sortOrder: 100,
    isFeatured: false,
    tagSlugs: ["chat"],
  },
  {
    categorySlug: "writing",
    name: "Notion AI",
    slug: "notion-ai",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/notion.svg",
    summary: "集成在 Notion 中的写作与知识整理助手。",
    description:
      "可在文档和知识库中生成、总结、改写和翻译内容。适合团队知识管理和个人笔记工作流。",
    websiteUrl: "https://www.notion.so/product/ai",
    sortOrder: 10,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Grammarly",
    slug: "grammarly",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/grammarly.svg",
    summary: "覆盖语法、语气和改写的英文写作助手。",
    description:
      "实时检查拼写、语法、清晰度和表达风格，并提供生成式改写。适合邮件、文档和专业英文沟通。",
    websiteUrl: "https://www.grammarly.com/",
    sortOrder: 20,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Jasper",
    slug: "jasper",
    logoUrl: "https://unavatar.io/jasper.ai",
    summary: "面向品牌与营销团队的 AI 内容平台。",
    description:
      "支持品牌语调、营销活动和多渠道内容生成。适合企业市场团队规模化生产一致的营销文案。",
    websiteUrl: "https://www.jasper.ai/",
    sortOrder: 30,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Writesonic",
    slug: "writesonic",
    logoUrl: "https://unavatar.io/writesonic.com",
    summary: "覆盖营销文案、SEO 与内容优化的 AI 平台。",
    description:
      "提供文章生成、内容改写、搜索优化和品牌内容工具。适合营销人员、站长和内容团队。",
    websiteUrl: "https://writesonic.com/",
    sortOrder: 40,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Copy.ai",
    slug: "copy-ai",
    logoUrl: "https://unavatar.io/copy.ai",
    summary: "面向销售与营销流程的 AI 写作平台。",
    description:
      "可生成营销文案并自动化部分销售和内容工作流。适合需要批量内容与流程协作的商业团队。",
    websiteUrl: "https://www.copy.ai/",
    sortOrder: 50,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "QuillBot",
    slug: "quillbot",
    logoUrl: "https://quillbot.com/favicon.ico",
    summary: "专注改写、润色、摘要和引用的写作工具。",
    description:
      "提供多种改写模式、语法检查与摘要能力。适合学生、研究人员和需要提升表达质量的写作者。",
    websiteUrl: "https://quillbot.com/",
    sortOrder: 60,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Sudowrite",
    slug: "sudowrite",
    logoUrl: "https://unavatar.io/sudowrite.com",
    summary: "为小说与故事创作者设计的 AI 写作助手。",
    description:
      "支持情节构思、角色描写、续写和文本润色。适合小说作者和以叙事创作为核心的写作者。",
    websiteUrl: "https://www.sudowrite.com/",
    sortOrder: 70,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Rytr",
    slug: "rytr",
    logoUrl: "https://rytr.me/favicon.ico",
    summary: "轻量易用的多场景 AI 内容生成器。",
    description:
      "内置多种语气和内容模板，可快速生成邮件、社交媒体与营销文案。适合个人创作者和小型团队。",
    websiteUrl: "https://rytr.me/",
    sortOrder: 80,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Wordtune",
    slug: "wordtune",
    logoUrl: "https://unavatar.io/wordtune.com",
    summary: "帮助改写句子并调整语气的 AI 写作助手。",
    description:
      "可对现有文本进行扩写、缩写、润色和语气调整。适合希望快速改善英文表达的日常用户。",
    websiteUrl: "https://www.wordtune.com/",
    sortOrder: 90,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "writing",
    name: "Jenni AI",
    slug: "jenni-ai",
    logoUrl: "https://unavatar.io/jenni.ai",
    summary: "面向论文与长篇内容的 AI 写作工作台。",
    description:
      "支持续写、引用、研究辅助和文档组织。适合学生、研究人员与需要撰写长篇内容的用户。",
    websiteUrl: "https://jenni.ai/",
    sortOrder: 100,
    isFeatured: false,
    tagSlugs: ["writing"],
  },
  {
    categorySlug: "image",
    name: "Midjourney",
    slug: "midjourney",
    logoUrl: "https://unavatar.io/midjourney.com",
    summary: "以高质量艺术表现著称的 AI 图像生成平台。",
    description:
      "通过自然语言生成风格鲜明的创意图像和视觉概念。适合设计师、艺术家与品牌视觉探索。",
    websiteUrl: "https://www.midjourney.com/",
    sortOrder: 10,
    isFeatured: true,
    tagSlugs: ["image", "featured"],
  },
  {
    categorySlug: "image",
    name: "Adobe Firefly",
    slug: "adobe-firefly",
    logoUrl: "https://unavatar.io/firefly.adobe.com",
    summary: "面向商业创意工作流的 Adobe 生成式 AI。",
    description:
      "支持图片生成、局部编辑、文字效果和多媒体创作。与 Photoshop 等 Adobe 工具衔接紧密。",
    websiteUrl: "https://firefly.adobe.com/",
    sortOrder: 20,
    isFeatured: true,
    tagSlugs: ["image", "featured"],
  },
  {
    categorySlug: "image",
    name: "Leonardo AI",
    slug: "leonardo-ai",
    logoUrl: "https://unavatar.io/leonardo.ai",
    summary: "面向设计、游戏和营销的 AI 视觉创作平台。",
    description:
      "提供图像生成、风格训练、画布编辑和素材生产能力。适合需要持续产出视觉资产的创作者。",
    websiteUrl: "https://leonardo.ai/",
    sortOrder: 30,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "Ideogram",
    slug: "ideogram",
    logoUrl: "https://unavatar.io/ideogram.ai",
    summary: "擅长文字排版和海报设计的 AI 图像工具。",
    description:
      "可生成包含清晰文字、标志和版式的视觉内容。适合海报、社交媒体图片和品牌概念设计。",
    websiteUrl: "https://ideogram.ai/",
    sortOrder: 40,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "Recraft",
    slug: "recraft",
    logoUrl: "https://unavatar.io/recraft.ai",
    summary: "面向品牌图形与矢量设计的生成式 AI。",
    description:
      "支持图标、插画、矢量图和品牌风格控制。适合设计系统、营销素材与可编辑图形生产。",
    websiteUrl: "https://www.recraft.ai/",
    sortOrder: 50,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "Canva",
    slug: "canva",
    logoUrl: "https://unavatar.io/canva.com",
    summary: "集成 AI 生图与模板编辑的在线设计平台。",
    description:
      "可从提示词生成图片，并继续制作演示文稿、海报和社交媒体内容。适合非专业设计用户快速交付作品。",
    websiteUrl: "https://www.canva.com/ai-image-generator/",
    sortOrder: 60,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "Stable Diffusion",
    slug: "stable-diffusion",
    logoUrl: "https://unavatar.io/stability.ai",
    summary: "开放生态广泛的 AI 图像生成技术与服务。",
    description:
      "支持文生图、图生图和高度可定制的本地工作流。适合开发者、研究者和需要模型控制的创作者。",
    websiteUrl: "https://stability.ai/stable-image",
    sortOrder: 70,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "FLUX",
    slug: "flux",
    logoUrl: "https://blackforestlabs.ai/favicon.ico",
    summary: "Black Forest Labs 推出的高质量图像生成模型。",
    description:
      "强调提示词理解、画面细节和文字表现，并提供多种模型版本。适合专业创作与开发集成。",
    websiteUrl: "https://blackforestlabs.ai/",
    sortOrder: 80,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "Krea",
    slug: "krea",
    logoUrl: "https://unavatar.io/krea.ai",
    summary: "支持实时生成与增强的 AI 创意画布。",
    description:
      "提供实时图像生成、风格探索、放大和视频创作工具。适合快速迭代视觉概念的设计师。",
    websiteUrl: "https://www.krea.ai/",
    sortOrder: 90,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "image",
    name: "ImageFX",
    slug: "imagefx",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg",
    summary: "Google Labs 提供的实验性 AI 图像生成工具。",
    description:
      "通过文本提示快速生成和探索图片变体，操作界面简洁。适合日常灵感、概念图和轻量创作。",
    websiteUrl: "https://labs.google/fx/tools/image-fx",
    sortOrder: 100,
    isFeatured: false,
    tagSlugs: ["image"],
  },
  {
    categorySlug: "coding",
    name: "GitHub Copilot",
    slug: "github-copilot",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/githubcopilot.svg",
    summary: "覆盖编辑器、终端与 GitHub 工作流的 AI 编程助手。",
    description:
      "支持代码补全、解释、重构、代理任务和代码审查。适合个人开发者与使用 GitHub 的软件团队。",
    websiteUrl: "https://github.com/features/copilot",
    sortOrder: 10,
    isFeatured: true,
    tagSlugs: ["coding", "featured"],
  },
  {
    categorySlug: "coding",
    name: "Cursor",
    slug: "cursor",
    logoUrl: "https://www.cursor.com/favicon.ico",
    summary: "以代码库理解和智能代理为核心的 AI 编辑器。",
    description:
      "可在项目上下文中生成、修改和解释代码，并执行多文件任务。适合希望将 AI 深度融入编辑器的开发者。",
    websiteUrl: "https://www.cursor.com/",
    sortOrder: 20,
    isFeatured: true,
    tagSlugs: ["coding", "featured"],
  },
  {
    categorySlug: "coding",
    name: "Windsurf",
    slug: "windsurf",
    logoUrl: "https://windsurf.com/favicon.ico",
    summary: "具备代理式开发流程的 AI 原生代码编辑器。",
    description:
      "支持代码库感知、自动修改、终端协作和连续任务执行。适合复杂项目中的 AI 辅助开发。",
    websiteUrl: "https://windsurf.com/",
    sortOrder: 30,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Claude Code",
    slug: "claude-code",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/anthropic.svg",
    summary: "在终端中理解代码库并执行任务的编程代理。",
    description:
      "可阅读项目、修改文件、运行命令并协助处理开发工作流。适合偏好命令行和大型代码库的开发者。",
    websiteUrl: "https://www.anthropic.com/claude-code",
    sortOrder: 40,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Codex",
    slug: "codex",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg",
    summary: "OpenAI 推出的云端与本地软件工程智能体。",
    description:
      "可理解代码库、实施修改、运行测试并协助审查开发任务。适合并行处理工程工作和自动化开发流程。",
    websiteUrl: "https://openai.com/codex/",
    sortOrder: 50,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Replit Agent",
    slug: "replit-agent",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/replit.svg",
    summary: "从自然语言需求生成并部署应用的云端开发代理。",
    description:
      "可在浏览器内搭建项目、编写代码、配置环境并发布应用。适合原型开发和无需本地配置的快速实践。",
    websiteUrl: "https://replit.com/ai",
    sortOrder: 60,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "v0",
    slug: "v0",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/vercel.svg",
    summary: "面向 Web 界面与全栈应用生成的 Vercel AI 工具。",
    description:
      "可根据描述生成 React 界面、组件和可运行应用。适合产品原型、前端开发与 Vercel 部署工作流。",
    websiteUrl: "https://v0.dev/",
    sortOrder: 70,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Bolt.new",
    slug: "bolt-new",
    logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stackblitz.svg",
    summary: "在浏览器中生成、运行和部署全栈应用的 AI 工具。",
    description:
      "基于 Web 开发环境直接创建项目、安装依赖并预览结果。适合快速构建原型和小型 Web 应用。",
    websiteUrl: "https://bolt.new/",
    sortOrder: 80,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Lovable",
    slug: "lovable",
    logoUrl: "https://lovable.dev/favicon.ico",
    summary: "通过对话构建和迭代 Web 产品的 AI 开发平台。",
    description:
      "可生成前端、连接后端服务并持续根据反馈修改应用。适合创业者、设计师和产品原型团队。",
    websiteUrl: "https://lovable.dev/",
    sortOrder: 90,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
  {
    categorySlug: "coding",
    name: "Tabnine",
    slug: "tabnine",
    logoUrl: "https://www.tabnine.com/favicon.ico",
    summary: "注重企业隐私与治理的 AI 代码助手。",
    description:
      "提供代码补全、聊天和团队级模型配置，支持多种 IDE。适合关注私有化、安全和合规的软件团队。",
    websiteUrl: "https://www.tabnine.com/",
    sortOrder: 100,
    isFeatured: false,
    tagSlugs: ["coding"],
  },
] as const satisfies readonly CatalogTool[];

const monetizationBySlug: Partial<
  Record<
    CatalogTool["slug"],
    Pick<
      CatalogTool,
      "affiliateUrl" | "couponCode" | "isSponsored" | "pricing" | "sponsorLabel"
    >
  >
> = {
  chatgpt: {
    pricing: "Free plan + paid tiers",
  },
  claude: {
    pricing: "Free plan + Pro",
  },
  canva: {
    pricing: "Free plan + Pro",
  },
  "github-copilot": {
    pricing: "Free tier + paid plans",
  },
  cursor: {
    pricing: "Free tier + Pro",
  },
  v0: {
    pricing: "Usage-based credits",
  },
};

export const catalogTools = catalogToolsBase.map((tool: CatalogTool) => ({
  ...tool,
  officialUrl: tool.officialUrl ?? tool.websiteUrl,
  affiliateUrl: monetizationBySlug[tool.slug]?.affiliateUrl,
  isSponsored: monetizationBySlug[tool.slug]?.isSponsored ?? false,
  sponsorLabel: monetizationBySlug[tool.slug]?.sponsorLabel,
  couponCode: monetizationBySlug[tool.slug]?.couponCode,
  pricing: monetizationBySlug[tool.slug]?.pricing,
})) satisfies readonly CatalogTool[];

export const defaultAdvertisements = [
  {
    id: 1,
    title: "首页横幅广告位",
    imageUrl:
      "/ads/category-banner.png",
    targetUrl: "/advertise",
    placement: AdPlacement.HOME_BANNER,
    sortOrder: 10,
  },
  {
    id: 2,
    title: "首页侧栏广告位",
    imageUrl: "/ads/sidebar-sponsor.png",
    targetUrl: "/advertise",
    placement: AdPlacement.HOME_SIDEBAR,
    sortOrder: 10,
  },
] as const;

export const defaultSiteSetting = {
  id: 1,
  siteName: "AI 导航",
  siteDescription: "发现值得使用的 AI 工具，让创作与工作更高效。",
  logoUrl: null,
  footerText: "AI 导航 · 精选实用 AI 工具",
} as const;
