# AI 工具目录扩充设计

## 目标

将 AI 导航的初始目录从 4 款工具扩充到 40 款主流 AI 工具，固定归入以下四类：

- AI 对话
- AI 写作
- 图像生成
- 编程开发

每款工具必须包含名称、唯一 slug、中文简介、中文详情、官方地址和可展示图标。

## 收录范围

### AI 对话

1. ChatGPT
2. Claude
3. Gemini
4. Perplexity
5. Microsoft Copilot
6. Grok
7. DeepSeek
8. Poe
9. Meta AI
10. Le Chat

### AI 写作

1. Notion AI
2. Grammarly
3. Jasper
4. Writesonic
5. Copy.ai
6. QuillBot
7. Sudowrite
8. Rytr
9. Wordtune
10. Jenni AI

### 图像生成

1. Midjourney
2. Adobe Firefly
3. Leonardo AI
4. Ideogram
5. Recraft
6. Canva
7. Stable Diffusion
8. FLUX
9. Krea
10. ImageFX

### 编程开发

1. GitHub Copilot
2. Cursor
3. Windsurf
4. Claude Code
5. Codex
6. Replit Agent
7. v0
8. Bolt.new
9. Lovable
10. Tabnine

工具按主营用途只进入一个分类，避免首页重复。

## 图标策略

每条工具记录都必须写入非空 `logoUrl`：

1. 优先使用 Simple Icons 提供的品牌 SVG。
2. Simple Icons 没有对应品牌时，使用工具官方网站的 favicon。
3. 前端图片加载失败时，隐藏破损图片并显示工具名称首字母占位。
4. 图标使用 HTTPS 地址，并在实现时逐个验证可访问性。

现有卡片与详情页继续使用同一个 `logoUrl` 字段，不增加新的数据库字段。

## 数据同步

`prisma/seed.ts` 继续作为本地和 Docker 的目录初始化入口，但取消“站点设置存在就跳过全部种子”的行为。

同步规则：

- 四个标准分类按 slug 执行 upsert。
- 40 款官方目录工具按 slug 执行 upsert。
- 官方工具的分类、名称、简介、官网、图标和排序可以由种子数据更新。
- 后台手工新增且 slug 不在官方目录中的工具不删除、不修改。
- 标签按 slug upsert，并保证工具标签关系可重复执行。
- 广告和站点设置仅在缺失时创建，避免 Docker 重启覆盖后台编辑。
- 重复执行种子脚本不得产生重复工具或重复标签关系。

## 前端行为

现有分类、搜索、精选工具和详情页结构保持不变。

- 首页工具目录展示全部启用工具。
- 分类筛选分别展示对应的 10 款目录工具。
- 搜索可按工具名称和简介命中新增工具。
- 精选区域仅保留少量代表性工具，避免 40 款工具全部进入精选。
- 图标加载失败时仍保持卡片布局完整。

## 测试

自动化测试至少覆盖：

- 首次种子执行后存在 4 个分类和 40 款官方工具。
- 每个分类正好包含 10 款官方工具。
- 40 款工具的 `logoUrl` 均为非空 HTTPS 地址。
- slug 全部唯一。
- 重复执行种子脚本后数量不变。
- 已存在的后台手工工具在同步后仍然存在。
- 广告和站点设置的后台修改不会被种子脚本覆盖。
- 图标加载失败时显示首字母占位。

## 验收

1. 测试、TypeScript、生产构建全部通过。
2. Docker 镜像重新构建并正常启动。
3. 容器执行种子后数据库包含 40 款官方工具。
4. 浏览器验证首页、四个分类、搜索、工具详情和后台工具列表。
5. 浏览器控制台无新增错误，容器日志无数据库或渲染错误。

