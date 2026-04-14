@echo off
echo ========================================
echo  豆包对话搜索 - 推送到 GitHub
echo ========================================
echo.
echo 正在尝试推送到 GitHub...
echo.

cd /d "%~dp0"

REM 尝试推送
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  推送成功！
    echo ========================================
    echo.
    echo 仓库地址: https://github.com/dxxxsol/doubao-search-extension
    echo.
) else (
    echo.
    echo ========================================
    echo  推送失败
    echo ========================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题 - 请检查网络
    echo 2. 需要 Git 认证 - 请使用 GitHub Desktop
    echo 3. 防火墙阻止 - 请检查防火墙设置
    echo.
    echo 替代方案:
    echo 1. 使用 GitHub Desktop 上传
    echo 2. 手动在 GitHub 页面上传文件
    echo.
)

pause
