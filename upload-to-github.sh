#!/bin/bash
# 快速上传到 GitHub 的脚本

echo "=== 豆包对话搜索 Chrome 扩展 - GitHub 上传脚本 ==="
echo ""

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo "错误：未找到 Git，请先安装 Git"
    exit 1
fi

# 初始化 Git
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "添加文件..."
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo "没有新的更改需要提交"
else
    # 提交
    read -p "请输入提交信息 [Initial commit]: " commit_msg
    commit_msg=${commit_msg:-"Initial commit: 豆包对话搜索 Chrome 扩展"}
    git commit -m "$commit_msg"
    
    # 检查是否已关联远程仓库
    if git remote -v | grep -q origin; then
        echo "远程仓库已存在，推送更改..."
        git push
    else
        # 添加远程仓库
        read -p "请输入 GitHub 仓库 URL (如 https://github.com/用户名/doubao-search-extension.git): " repo_url
        if [ -n "$repo_url" ]; then
            git remote add origin "$repo_url"
            git branch -M main
            git push -u origin main
            echo "✅ 推送成功！"
        else
            echo "⚠️ 未输入仓库 URL，跳过推送"
            echo "请手动执行："
            echo "  git remote add origin <your-repo-url>"
            echo "  git branch -M main"
            echo "  git push -u origin main"
        fi
    fi
fi

echo ""
echo "=== 完成 ==="
echo "下一步："
echo "1. 在 GitHub 上检查仓库"
echo "2. 更新 README.md 中的用户名和链接"
echo "3. 添加仓库描述和标签"
