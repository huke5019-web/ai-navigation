# AI 导航

深色侧栏风格的 AI 工具导航站，包含公开工具目录、分类搜索、广告位和单管理员后台。

## 功能

- 工具分类、关键词搜索、精选工具和详情页
- 首页横幅、首页侧栏、工具详情三类广告位
- 管理员登录与数据库 Session
- 工具、分类、广告和站点设置管理
- Sitemap、robots.txt、响应式桌面与移动布局
- SQLite 持久化与 Docker Compose 部署

## 本地运行

要求 Node.js 22.9+（22.x）和 npm 11。

```powershell
Copy-Item .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

访问：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

生成管理员密码哈希：

```powershell
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" "你的密码"
```

将结果写入 `.env` 的 `ADMIN_PASSWORD_HASH`。

## Docker

```powershell
Copy-Item .env.example .env
docker compose up --build
```

容器启动时自动执行数据库迁移和幂等种子脚本。SQLite 数据保存在 Docker Volume `ai_navigation_data`，容器内路径为 `/app/prisma/data`。

## 验证

```powershell
npm run lint
npm test
npm run build
```

## 数据备份

停止写入后备份 SQLite 文件：

```powershell
docker compose stop
docker run --rm -v ai_navigation_data:/data -v ${PWD}:/backup alpine cp /data/ai-navigation.db /backup/ai-navigation.db
docker compose start
```

首版不包含用户注册、投稿审核、文件上传、支付、多管理员权限和复杂访问分析。
