# 豆包对话搜索 - Chrome 扩展

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

为豆包（Doubao）AI 助手添加对话搜索和目录导航功能的 Chrome 浏览器扩展。

## 截图预览
<img width="2880" height="1530" alt="image" src="https://github.com/user-attachments/assets/9c8c5c26-12a0-40fb-a1ca-7e9f14197933" />
<img width="2880" height="1530" alt="image" src="https://github.com/user-attachments/assets/75bbd6f8-2e1f-47b1-a9cc-14c72a5613a0" />

## 功能特性

- **对话搜索**
  - 搜索当前对话内容
  - 搜索全部对话历史
  - 关键字高亮显示
  - 实时搜索结果

- **目录导航**
  - 对话提问目录
  - 点击跳转到对应位置
  - 自动更新目录

## 安装方法

### 手动安装

1. **下载扩展文件**
   ```bash
   git clone https://github.com/dxxxsol/doubao-search-extension.git
   ```

2. **加载到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角 **开发者模式**
   - 点击 **加载已解压的扩展程序**
   - 选择下载的项目文件夹

3. **开始使用**
   - 访问 https://www.doubao.com/
   - 点击页面右下角的紫色搜索按钮
   - 开始搜索或查看目录

## 使用说明

### 搜索功能

1. 点击浮动搜索按钮打开面板
2. 选择搜索范围：
   - **当前对话**：仅搜索当前打开的对话
   - **全部对话**：搜索左侧列表中的所有对话
3. 输入关键词，实时显示结果
4. 点击搜索结果跳转到对应消息

### 目录功能

1. 切换到"目录" Tab
2. 查看当前对话的所有提问列表
3. 点击提问跳转到对应位置
4. 自动更新新添加的消息

## 项目结构

```
doubao-search-extension/
├── manifest.json          # Chrome 扩展配置文件
├── content.js             # 内容脚本（核心逻辑）
├── styles.css             # 样式文件
├── icons/                 # 扩展图标
│   ├── icon16.png        # 16x16 图标
│   ├── icon48.png        # 48x48 图标
│   └── icon128.png       # 128x128 图标
├── README.md              # 项目说明
├── LICENSE                # MIT 许可证
├── CONTRIBUTING.md        # 贡献指南
└── .gitignore            # Git 忽略文件
```

## 技术栈

- **Manifest V3** - Chrome 扩展标准
- **Content Scripts** - 页面注入脚本
- **Vanilla JavaScript** - 无依赖原生 JS
- **CSS3** - 现代样式

## 兼容性

- Chrome 88+
- Edge 88+（基于 Chromium）
- 其他 Chromium 内核浏览器

## 注意事项

- 扩展仅在豆包网站（www.doubao.com）生效
- 全部对话搜索会遍历所有对话，对话较多时需要等待
- 需要页面已加载聊天内容才能搜索

## 贡献

欢迎提交 Issues 和 Pull Requests！详见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 更新日志

### v1.0.0 (2026-04-14)
- 初始版本发布
- 支持当前对话搜索
- 支持全部对话搜索
- 对话目录导航
- 关键字高亮显示
- 自动加载历史消息
