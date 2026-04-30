# 访客登记系统 (Visitor Registration System)

一个基于 React + TypeScript + Vite 构建的现代化访客登记管理系统。

## 功能特性

- 📝 **访客登记**：快速录入访客信息，包括姓名、电话、身份证、车牌号、受访人等
- 📋 **访客列表**：查看所有访客记录，支持搜索和筛选
- 👁️ **访客详情**：查看访客详细信息
- ✏️ **编辑功能**：支持修改已登记的访客信息
- 🗑️ **删除功能**：支持删除访客记录
- 💾 **本地存储**：数据保存在浏览器 localStorage 中

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui 组件库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## Docker 部署

本项目包含 Dockerfile，支持容器化部署：

```bash
# 构建镜像
docker build -t visitor-registration .

# 运行容器
docker run -p 80:80 visitor-registration
```

## 项目结构

```
src/
├── components/     # React 组件
│   ├── ui/        # 基础 UI 组件
│   └── visitor/   # 访客相关组件
├── pages/         # 页面组件
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
└── hooks/         # React Hooks
```

## 最后一次更新

- 更新时间：2026-04-30 22:20
- 触发 Docker 自动构建测试
