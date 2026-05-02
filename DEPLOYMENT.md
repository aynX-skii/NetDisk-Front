# 前端部署说明

这个仓库是独立前端应用。生产环境使用 nginx 部署 `npm run build` 生成的 `dist` 目录，不需要 Java 后端托管页面。

## 构建

```powershell
npm install --no-audit --no-fund
npm run build
```

构建产物在 `dist/`。

常用环境变量：

- `VITE_PUBLIC_BASE_PATH`: 前端部署路径，默认 `/`
- `VITE_API_BASE_URL`: API 服务地址。留空时请求 `/api/v2`，适合 nginx 同域反代；跨域部署时填写后端 Origin，例如 `https://api.example.com`
- `VITE_DEV_API_PROXY_TARGET`: 本地 `npm run dev` 时 `/api` 代理目标，默认 `http://localhost:8080`

## nginx 示例

同域反代 API 时：

```nginx
server {
  listen 80;
  server_name netdisk.example.com;
  root /var/www/netdisk/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://netdisk_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

如果前端和后端是不同 Origin，请设置 `VITE_API_BASE_URL`，并在后端配置 `NETDISK_CORS_ALLOWED_ORIGINS`。
