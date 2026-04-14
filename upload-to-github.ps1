# 豆包对话搜索 Chrome 扩展 - GitHub 上传脚本 (PowerShell)

Write-Host "=== 豆包对话搜索 Chrome 扩展 - GitHub 上传脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查 Git 是否安装
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误：未找到 Git，请先安装 Git" -ForegroundColor Red
    exit 1
}

# 初始化 Git
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
}

# 添加所有文件
Write-Host "添加文件..." -ForegroundColor Yellow
git add .

# 检查是否有更改
$hasChanges = git diff --staged --quiet
if ($hasChanges) {
    Write-Host "没有新的更改需要提交" -ForegroundColor Cyan
} else {
    # 提交
    $commitMsg = Read-Host "请输入提交信息 [Initial commit]"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Initial commit: 豆包对话搜索 Chrome 扩展"
    }
    git commit -m $commitMsg
    
    # 检查是否已关联远程仓库
    $remotes = git remote -v
    if ($remotes -match "origin") {
        Write-Host "远程仓库已存在，推送更改..." -ForegroundColor Yellow
        git push
    } else {
        # 添加远程仓库
        $repoUrl = Read-Host "请输入 GitHub 仓库 URL (如 https://github.com/用户名/doubao-search-extension.git)"
        if ($repoUrl) {
            git remote add origin $repoUrl
            git branch -M main
            git push -u origin main
            Write-Host "✅ 推送成功！" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 未输入仓库 URL，跳过推送" -ForegroundColor Yellow
            Write-Host "请手动执行："
            Write-Host "  git remote add origin <your-repo-url>"
            Write-Host "  git branch -M main"
            Write-Host "  git push -u origin main"
        }
    }
}

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host "下一步："
Write-Host "1. 在 GitHub 上检查仓库"
Write-Host "2. 更新 README.md 中的用户名和链接"
Write-Host "3. 添加仓库描述和标签"
