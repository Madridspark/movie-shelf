# MovieShelf

MovieShelf 是一个暗黑风格的电影发现与收藏夹管理应用。项目使用 TMDB 作为主要数据源，支持首页最新上映浏览、电影搜索、详情查看、多收藏夹管理、本地持久化和挂载式 Lottery Banner 随机选片。

## 功能范围

- 首页发现态：顶部图片 Banner、圆角搜索框、最新上映电影瀑布流。
- 搜索态：搜索输入、结果流、分页追加加载、前端排序、收藏夹入口。
- 电影详情：海报和背景图、标题/原名/简介/评分/元信息、导演演员、预告片、评论、观看平台、相关推荐。
- 收藏夹：默认收藏夹、多收藏夹创建/重命名/删除、电影移除、排序、当前收藏夹切换。
- 本地存储恢复：读取失败或结构异常时自动恢复默认收藏夹，并在收藏夹页提示用户。
- Lottery Banner：首页使用独立周趋势 Banner 数据源顺序轮播；收藏夹页支持全部收藏夹/当前收藏夹随机换片。
- 首页热映流：首屏后后台预取后续分页并预热图片，下拉到底部时再释放已缓存分页。
- 网络异常：搜索流和详情页统一弹窗遮罩提示“网络连接断开”，支持重试。

## 技术栈

- React + TypeScript
- Vite：本地开发服务器
- Webpack：生产构建
- Redux Toolkit：收藏夹、偏好和 Lottery Banner 客户端状态
- TanStack Query：TMDB 服务端状态、缓存、分页和重试
- React Router：`/`、`/movies/:movieId`、`/favorites`
- Radix UI：Dialog、Dropdown、Checkbox、Tooltip、Slot
- Less + CSS Modules：业务样式和主题变量
- Zod：TMDB 响应结构容错解析
- Vitest + React Testing Library + MSW：单元测试、组件测试和接口 mock

## 本地运行

```bash
nvm use
pnpm install
pnpm dev
```

环境变量放在 `.env.local`：

```bash
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
```

`.env`、`.env.local` 和构建产物已被 `.gitignore` 忽略。

## 常用命令

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build       # Webpack 生产构建
pnpm build:vite  # Vite 构建校验
pnpm preview
pnpm serve:dist  # 本地静态服务 dist，带 SPA fallback
pnpm smoke       # 本地 dist smoke
pnpm smoke:prod  # 线上 smoke
```

## 目录结构

```text
src/
  app/        # Provider、路由和应用入口
  pages/      # 路由页面与页面级组件拆分
  features/   # 搜索、收藏夹、Lottery 等业务模块
  entities/   # Movie 领域模型、Repository、Adapter、Schema
  shared/     # API Client、通用 UI、工具函数
  store/      # Redux store 和 typed hooks
  styles/     # 全局样式、reset、Less 变量
```

## 架构说明

页面不直接请求 TMDB。数据流为：

```text
UI / Page -> TanStack Query Hook -> movieService -> movieRepository -> tmdbClient
                                       |
                                       v
                                  Zod Schema
                                       |
                                       v
                                  Movie Adapter
```

- `tmdbClient` 负责 base URL、Bearer Token、请求超时和基础错误处理。
- `movie-repository` 负责 TMDB endpoint、参数、图片配置和类型映射并发读取。
- `tmdb-schemas` 负责对远端结构做安全解析，坏数据不会直接进入页面。
- `movie-adapter` 把 TMDB 原始字段转换为前端统一模型。
- `movie-service` 提供 Facade，让页面只关心搜索、最新上映、Banner、详情这些用例。
- `genre/movie/list` 会缓存为类型映射表，列表电影通过 `genre_ids` 显示类型名；类型接口失败时降级为空类型，不阻塞主内容。

## 设计模式

- Adapter Pattern：`src/entities/movie/lib/movie-adapter.ts`
- Repository Pattern：`src/entities/movie/api/movie-repository.ts`
- Facade Pattern：`src/entities/movie/api/movie-service.ts`
- Strategy Pattern：`movie-sort-strategies.ts`、`favorite-sort-strategies.ts`
- Fallback / Null Object：图片配置、字段缺失、数组异常和收藏夹恢复逻辑

## UI 组件策略

MovieShelf 不使用 Ant Design 作为主 UI 框架。视觉组件由项目内业务组件承载，基础交互使用 Radix 封装：

- `MovieCard`
- `MovieWaterfallGrid`
- `HomeDiscoverySearch`
- `HomeToolbar`
- `FavoriteSidebar`
- `FavoriteHeader`
- `FavoriteMenu`
- `LotteryBanner`
- `StateResult`
- `DropdownSelect`
- `Checkbox`

首页保持图片流优先：无显式 header，左上角 Logo，右上角收藏夹入口，搜索结果态才切换为工具栏。

## 性能点

- 路由级懒加载，降低初始 JS 压力。
- 首页和搜索结果使用 `useInfiniteQuery` 分页加载。
- 首页热映流在首屏稳定后后台预取后续分页，但不自动追加到瀑布流；用户下拉时才释放下一页。
- Banner 数据源在 App Provider 挂载后预取到 TanStack Query 缓存，并预热前几张背景图。
- 搜索输入 debounce，避免高频请求。
- 详情页使用 `append_to_response` 聚合 credits、videos、reviews、watch/providers、recommendations。
- 图片 URL 来自 TMDB `/configuration`，避免使用 `original`。
- 海报和头像固定宽高比，缺图/加载失败时保留占位，降低 CLS。
- 非首屏图片使用 lazy loading 和 async decoding。
- 收藏夹只保存必要电影快照，不把完整详情写入本地存储。

## 部署

项目包含 GitHub Actions CI、静态 smoke 脚本和部署脚本。部署流程见 `docs/deploy.md`。本地 smoke 需要先运行 `pnpm build`，再启动 `pnpm serve:dist`，另开终端执行 `pnpm smoke`：

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm serve:dist
```

```bash
pnpm smoke
pnpm build:vite
bash scripts/deploy.sh
```

## 测试

当前测试覆盖：

- TMDB schema 容错解析。
- Movie adapter 正常转换、类型映射和缺图兜底。
- 搜索排序策略。
- 收藏夹排序策略。
- 收藏夹 reducer 添加、去重、移除、创建、重命名、删除、偏好更新。
- 收藏夹页面组件空态、移除电影、随机片单来源切换。
- 收藏夹 storage 读取失败和结构恢复提示。
- Lottery Banner 候选去重、视觉队列、顺序轮播、卡片定位不跳详情和显式详情跳转。
- 搜索面板通过 MSW 覆盖首页发现态、搜索态、搜索空结果和搜索 500 错误态。
- 详情页通过 MSW 覆盖正常详情模块、网络错误弹窗，以及 credits/videos/reviews/watch providers 异常或缺失时的降级展示。
- 移动端瀑布流至少两列、首页搜索区固定两侧边距和操作区等宽伸展的响应式样式契约。
- dist 静态服务 smoke：校验首页、详情深链、JS/CSS MIME、品牌 Logo 和 favicon。

## 交付状态

已完成：

- React + TypeScript + Vite + Webpack 项目骨架。
- TMDB client / repository / adapter / schema 分层。
- 首页发现态、搜索态和无限滚动。
- 首页 Banner 数据预取、首页热映后台分页预取和图片预热。
- 电影详情页。
- 多收藏夹管理和本地持久化。
- 收藏夹页骨架屏、空态、来源切换和随机换片。
- Lottery Banner 抽选阶段的模糊滚动、减速、定格和焦点聚拢动效。
- `genre/movie/list` 类型映射。
- MSW 覆盖搜索空结果、搜索错误和详情异常子模块。
- CI 自动执行 typecheck、lint、测试、Webpack/Vite 双构建和本地 smoke。
- 部署脚本和线上 smoke：`scripts/deploy.sh`、`scripts/smoke.mjs`、`docs/deploy.md`。
- Radix Dialog、Dropdown、Checkbox 等基础交互替换。
- 390px 手机视口浏览器验收：首页首行两列瀑布流、详情页和收藏夹页无页面级横向溢出。
- README、测试骨架、MSW mock、Webpack/Vite 双构建。
