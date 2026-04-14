# 贡献指南

欢迎贡献代码、报告问题或提出建议！

## 如何贡献

### 报告问题
- 在 Issues 中搜索是否已有相同问题
- 如果没有，创建新 Issue，描述清楚：
  - 问题描述
  - 复现步骤
  - 预期行为
  - 实际行为
  - 浏览器版本

### 提交代码
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范
- 使用 ESLint 保持代码风格一致
- 添加必要的注释
- 确保代码能正常工作

## 代码结构

```
doubao-search-extension/
├── manifest.json      # Chrome 扩展配置
├── content.js         # 内容脚本（核心逻辑）
├── styles.css         # 样式文件
├── icons/             # 扩展图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## 功能特性

- 搜索当前对话或全部对话
- 对话目录导航
- 关键字高亮
- 自动加载历史消息

## 联系方式

如有任何问题，欢迎在 Issues 中提出。
