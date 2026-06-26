# AI 导航网站设计规格

## 目标

构建一个可直接运行和部署的 AI 工具导航网站。网站采用简洁深色视觉，支持工具分类、搜索、工具详情、自定义广告位，以及单管理员后台。

首版名称为“AI 导航”。面向中文用户，重点是快速发现和浏览 AI 工具，并为后续内容运营和广告投放保留扩展空间。

## 技术架构

- Next.js App Router 负责前台、后台页面和服务端接口。
- Prisma 作为数据访问层。
- SQLite 保存业务数据，数据库文件通过 Docker Volume 持久化。
- 前后台位于同一项目，管理后台统一使用 `/admin` 路径。
- 管理员账号和初始密码由环境变量提供。
- Docker Compose 负责构建和启动应用。
- 初始化脚本自动创建示例分类、工具、广告和站点设置。

## 前台设计

### 视觉方向

采用深色侧栏目录布局：

- 左侧固定品牌和工具分类。
- 主区域顶部显示搜索框和页面标题。
- 工具以紧凑卡片网格展示。
- 桌面端右侧显示广告栏。
- 移动端隐藏固定侧栏，分类改为顶部横向筛选。
- 主色使用冷色深灰，强调色使用蓝紫色。

### 页面

#### 首页

- 网站名称和简介。
- 工具关键词搜索。
- 分类导航。
- 热门和精选工具。
- 工具卡片列表。
- 首页横幅广告位。
- 首页右栏广告位。

#### 分类与搜索

- 使用 `category` 和 `q` URL 参数表达筛选状态。
- 支持复制筛选结果链接。
- 支持浏览器前进和后退。
- 无匹配结果时显示清晰的空状态。

#### 工具详情

- 工具名称、Logo、简介和完整描述。
- 分类与标签。
- 官方网站访问按钮。
- 相关推荐。
- 工具详情广告位。

### SEO

- 为首页、分类和工具详情生成动态标题与描述。
- 提供 `sitemap.xml`。
- 提供 `robots.txt`。
- 使用语义化 HTML 和可访问的交互控件。

## 管理后台

### 登录

- 仅支持单管理员。
- 管理员账号由 `ADMIN_USERNAME` 配置。
- 管理员密码由 `ADMIN_PASSWORD` 配置，并在运行时使用 bcrypt 校验。
- 登录成功后创建服务端 Session。
- 未登录访问后台页面时跳转到登录页。

### 仪表盘

- 工具总数。
- 已启用分类数。
- 当前有效广告数。
- 精选工具数。

### 工具管理

- 新建、编辑和删除工具。
- 设置名称、Slug、Logo URL、简介、详细描述和官网 URL。
- 选择分类和标签。
- 设置启用、精选和排序状态。
- 校验必填字段、URL、Slug 唯一性和排序值。

### 分类管理

- 新建、编辑和删除分类。
- 设置名称、Slug、图标名称、排序和启用状态。
- 删除存在工具的分类前必须先转移或删除所属工具。

### 广告管理

- 新建、编辑和删除广告。
- 设置标题、图片 URL、跳转 URL、广告位置、起止时间和启用状态。
- 广告位置限定为：
  - `HOME_BANNER`
  - `HOME_SIDEBAR`
  - `TOOL_DETAIL`
- 仅显示已启用且处于有效期内的广告。

### 站点设置

- 网站名称。
- 网站简介。
- Logo URL。
- 页脚文本。

## 数据模型

### Category

- `id`
- `name`
- `slug`
- `icon`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### Tool

- `id`
- `categoryId`
- `name`
- `slug`
- `logoUrl`
- `summary`
- `description`
- `websiteUrl`
- `sortOrder`
- `isActive`
- `isFeatured`
- `createdAt`
- `updatedAt`

每个工具属于一个分类。

### Tag

- `id`
- `name`
- `slug`

### ToolTag

- `toolId`
- `tagId`

工具与标签为多对多关系。

### Advertisement

- `id`
- `title`
- `imageUrl`
- `targetUrl`
- `placement`
- `startsAt`
- `endsAt`
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

### SiteSetting

- `id`
- `siteName`
- `siteDescription`
- `logoUrl`
- `footerText`
- `updatedAt`

系统只维护一条站点设置记录。

### AdminSession

- `id`
- `tokenHash`
- `expiresAt`
- `createdAt`

数据库只保存 Session Token 的哈希值。

## 安全与错误处理

- 密码通过 bcrypt 比较，不保存明文密码到数据库。
- Session Cookie 使用 `HttpOnly`、`SameSite=Lax`，生产环境启用 `Secure`。
- 登录失败使用统一错误提示，避免泄露账号是否存在。
- 所有后台写操作在服务端验证 Session。
- 所有表单数据在服务端验证。
- 数据库异常写入服务端日志，页面只显示通用错误信息。
- 外部 URL 仅允许 `http` 和 `https` 协议。
- 删除操作要求二次确认。

## 测试范围

- 管理员正确和错误凭证登录。
- 未登录访问后台时跳转。
- 工具新增、编辑、上下架和删除。
- 分类筛选与关键词搜索。
- 广告启用状态和起止时间判断。
- 首页、工具详情和后台核心页面渲染。
- Prisma 初始化和种子数据创建。

## 运行与交付

项目包含：

- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- Prisma Schema 和迁移文件
- 数据初始化脚本
- README

标准启动流程：

1. 根据 `.env.example` 创建 `.env`。
2. 设置管理员账号、密码和 Session 密钥。
3. 执行 `docker compose up --build`。
4. 访问前台首页和 `/admin` 管理后台。

同时提供非 Docker 的本地开发命令。

## 首版范围外

- 用户注册和登录。
- 用户投稿与审核。
- 图片文件上传。
- 第三方广告联盟脚本。
- 付费订阅和支付。
- 多管理员与角色权限。
- 复杂访问统计和数据分析。

