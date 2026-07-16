# MovieShelf 部署

MovieShelf 部署在 Vultr 共享项目服务器上：

- SSH alias：`ai-tools`
- 远端目录：`/opt/projects/movie-shelf`
- 线上域名：`https://movie.zhangpengbo.com`
- 反代目录：`/opt/projects/reverse-proxy`
- Docker 网络：`web`

## 本地校验

```bash
nvm use
pnpm install
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm build:vite
```

## 本地 smoke

`pnpm serve:dist` 会常驻运行，先执行 Webpack 生产构建，再另开一个终端跑 smoke：

```bash
pnpm build
pnpm serve:dist
```

```bash
pnpm smoke
```

## 线上部署

远端 `.env` 保存在 `/opt/projects/movie-shelf/.env`，包含 TMDB 配置，不提交到仓库。

```bash
bash scripts/deploy.sh
```

如需同步本地 `.env` 到服务器：

```bash
MOVIE_SHELF_SYNC_ENV=1 bash scripts/deploy.sh
```

## 线上 smoke

```bash
pnpm smoke:prod
```

smoke 会检查：

- 首页 HTML 返回 200 且 `cache-control: no-store`
- Webpack JS/CSS 资源返回 200
- `/movies/550` 深链返回 200
- `favicon.png`、`apple-touch-icon.png`、横版 Logo 返回 `image/png`
