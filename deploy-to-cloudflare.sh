#!/bin/bash

# 🚀 Cloudflare Pages 部署腳本
# 此腳本會幫助您將應用部署到 Cloudflare Pages

echo "🚀 開始部署流程..."
echo ""

# 檢查是否安裝了 Git
if ! command -v git &> /dev/null; then
    echo "❌ 錯誤：未找到 Git 命令"
    echo "請先完成 Xcode Command Line Tools 的安裝"
    echo "安裝完成後重新運行此腳本"
    exit 1
fi

echo "✅ Git 已安裝"
echo ""

# 檢查當前目錄
CURRENT_DIR=$(pwd)
echo "📁 當前目錄：$CURRENT_DIR"
echo ""

# 檢查是否已經是 Git 倉庫
if [ -d ".git" ]; then
    echo "ℹ️  已經是 Git 倉庫"
else
    echo "🔧 初始化 Git 倉庫..."
    git init
    echo "✅ Git 倉庫初始化完成"
fi
echo ""

# 添加所有文件
echo "📦 添加文件到 Git..."
git add .
echo ""

# 提交
echo "💾 提交更改..."
git commit -m "Add Supabase integration and deployment configs" || {
    echo "ℹ️  沒有新的更改需要提交"
}
echo ""

# 檢查是否已經設置了遠程倉庫
if git remote get-url origin &> /dev/null; then
    echo "✅ 遠程倉庫已配置："
    git remote get-url origin
    echo ""
    echo "📤 推送到 GitHub..."
    git push -u origin main || git push -u origin master
else
    echo "⚠️  還沒有配置遠程倉庫"
    echo ""
    echo "請按照以下步驟操作："
    echo ""
    echo "1. 訪問 GitHub 創建新倉庫："
    echo "   https://github.com/new"
    echo ""
    echo "2. 設置倉庫信息："
    echo "   - Repository name: jinyi-app"
    echo "   - 不要勾選 'Initialize with README'"
    echo "   - 點擊 'Create repository'"
    echo ""
    echo "3. 在創建倉庫後，GitHub 會顯示命令。執行類似以下的命令："
    echo ""
    echo "   git remote add origin https://github.com/你的用戶名/jinyi-app.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "─────────────────────────────────────"
echo "📋 下一步操作："
echo "─────────────────────────────────────"
echo ""
echo "1. ✅ 如果還沒有，請在 GitHub 創建倉庫"
echo "2. ✅ 配置遠程倉庫並推送代碼（見上方指示）"
echo "3. 🌐 前往 Cloudflare Pages 部署："
echo "   https://dash.cloudflare.com"
echo ""
echo "4. 📝 配置構建設置："
echo "   - Framework preset: Vite"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo ""
echo "5. 🔐 添加環境變量："
echo "   - VITE_SUPABASE_URL=https://zntvofpaohnouepquxke.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb"
echo "   - GEMINI_API_KEY=你的_Gemini_API_key"
echo ""
echo "6. 🎉 部署並訪問您的應用！"
echo ""
echo "詳細步驟請參考：DEPLOYMENT_NEXT_STEPS.md"
echo ""
