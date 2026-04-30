# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 设置 npm 镜像源（加速国内访问）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 --legacy-peer-deps 解决依赖冲突）
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 nginx 托管静态文件
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
