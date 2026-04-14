# GitHub 上传指南

## 准备工作

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 仓库名：`doubao-search-extension`
   - 添加 README（可选，本项目已包含）
   - 选择许可证：MIT（本项目已包含）

2. **克隆仓库到本地**
   ```bash
   git clone https://github.com/your-username/doubao-search-extension.git
   ```

## 上传步骤

### 方式一：使用 Git 命令行

```bash
# 进入项目目录
cd d:/Desktop/qoder/doubao-search-extension-github

# 初始化 Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 豆包对话搜索 Chrome 扩展"

# 添加远程仓库
git remote add origin https://github.com/your-username/doubao-search-extension.git

# 推送
git branch -M main
git push -u origin main
```

### 方式二：使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 添加本地文件夹：File > Add Local Repository
3. 选择 `d:/Desktop/qoder/doubao-search-extension-github`
4. 连接到 GitHub 仓库
5. 提交并推送

### 方式三：直接上传（不推荐）

1. 压缩整个文件夹为 ZIP
2. 在 GitHub 仓库页面点击 "Add file" > "Upload files"
3. 上传 ZIP 文件（GitHub 会自动解压）

## 上传后

1. 检查 README.md 中的链接和说明
2. 添加仓库描述
3. 添加主题标签：`chrome-extension`, `doubao`, `search`, `browser-extension`
4. 设置仓库可见性（公开/私有）

## 发布到 Chrome Web Store（可选）

1. 准备 Chrome Web Store 开发者账号（5美元一次性费用）
2. 压缩项目为 ZIP
3. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
4. 上传 ZIP 文件
5. 填写应用信息
6. 提交审核

## 注意事项

- 替换 README.md 中的 `your-username` 为你的 GitHub 用户名
- 确保不要上传敏感信息（API Key、密码等）
- 检查 .gitignore 是否正确配置
- 建议添加 Screenshots 文件夹存放截图
