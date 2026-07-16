# MovieShelf

[English](./README.en.md)

MovieShelf 是一个基于 TMDB 的电影发现与收藏应用。它提供电影搜索、无限滚动结果流、电影详情、多收藏夹管理和 Watch Lottery。

线上地址：[https://movie.zhangpengbo.com](https://movie.zhangpengbo.com)

## 功能

- 搜索电影，并以卡片流展示分页结果。
- 浏览首页正在上映电影和顶部电影 Banner。
- 查看电影详情，包括简介、评分、导演、演员、预告片、评论、观看平台和相关推荐。
- 将电影加入默认收藏夹或指定收藏夹。
- 创建、重命名、删除收藏夹，并对收藏夹电影排序。
- 在收藏夹中使用 Watch Lottery 随机选择一部电影。
- 处理网络错误、空结果、缺图、异常 API 结构和本地存储损坏等场景。
- 支持移动端、平板和桌面端响应式布局。

## 技术栈

- React
- TypeScript
- Vite
- Webpack
- React Router
- Redux Toolkit
- TanStack Query
- Radix UI
- Less + CSS Modules
- Zod
- Vitest + React Testing Library + MSW

## 快速开始

项目使用 pnpm 和 Node.js 18+。仓库内提供 `.nvmrc`，推荐使用 nvm 切换 Node 版本。

```bash
nvm use
pnpm install
pnpm dev
```

开发环境变量放在 `.env.local`：

```bash
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
```

如果需要给 Docker/生产构建使用，也可以在 `.env` 中提供同名变量。`.env` 和 `.env.local` 不会提交到仓库。

## 常用脚本

```bash
pnpm dev         # 启动 Vite 开发服务器
pnpm lint        # 运行 ESLint
pnpm typecheck   # 运行 TypeScript 类型检查
pnpm test -- --run
pnpm build       # 使用 Webpack 构建生产产物
pnpm build:vite  # 使用 Vite 做构建校验
pnpm preview     # 预览 Vite 构建产物
pnpm serve:dist  # 本地静态服务 dist，支持 SPA fallback
pnpm smoke       # 本地 dist smoke test
pnpm smoke:prod  # 线上 smoke test
```

## 项目结构

```text
src/
  app/        # App providers, router, bootstrap
  pages/      # Route-level pages
  features/   # User-facing feature modules
  entities/   # Domain models, adapters, repository code
  shared/     # API client, shared UI, utilities
  store/      # Redux store and typed hooks
  styles/     # Global styles and Less variables
```

## 架构

页面组件不会直接请求 TMDB。电影数据会先经过请求层、仓储层、schema 校验和 adapter，再进入 UI。

```text
UI / Page
  -> TanStack Query hook
  -> movieService
  -> movieRepository
  -> tmdbClient
  -> Zod schema
  -> Movie adapter
```

这套分层主要解决三个问题：

- 页面只依赖稳定的前端电影模型。
- TMDB 字段缺失或结构异常时，UI 可以降级展示。
- 后续替换 API、增加 server proxy 或接入账号系统时，不需要重写页面组件。

本地收藏夹状态由 Redux Toolkit 管理，并持久化到 localStorage。服务端电影数据由 TanStack Query 管理，用于缓存、分页、重试和加载态。

## 测试

当前测试覆盖：

- TMDB schema 容错解析。
- Movie adapter 字段转换和缺图兜底。
- 搜索结果和收藏夹排序策略。
- 收藏夹 reducer、storage 恢复和本地迁移提示。
- 搜索页成功、空结果和网络错误状态。
- 详情页正常展示、异常子模块降级和网络错误状态。
- 收藏夹列表、空态、移除电影和 Lottery 来源切换。
- Watch Lottery 候选去重、视觉队列和卡片交互。
- 移动端两列瀑布流和搜索区响应式样式契约。
- 生产静态资源 smoke test。

运行：

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm smoke:prod
```

## 部署

项目提供 Docker、Nginx 和部署脚本。详细部署说明见 [docs/deploy.md](./docs/deploy.md)。

```bash
bash scripts/deploy.sh
```

部署脚本会让服务器拉取最新代码、重建容器，并在部署完成后运行线上 smoke test。

## 性能

已实现的性能处理包括：

- 路由级懒加载。
- 搜索和首页列表分页加载。
- 首页 Banner 数据预取和图片预热。
- 搜索输入 debounce。
- 详情页使用 `append_to_response` 减少请求次数。
- 图片尺寸来自 TMDB `/configuration`。
- 海报、头像和卡片区域使用稳定宽高比，降低 CLS。
- 非首屏图片使用 lazy loading 和 async decoding。

## 数据来源

This product uses the TMDB API but is not endorsed or certified by TMDB.
