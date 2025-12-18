#!/bin/bash

# 快速啟動部署流程
# 此腳本會引導你完成初始設置

echo "🚀 歡迎使用部署助手！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查是否已有 .env.local
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  檢測到已存在 .env.local 文件${NC}"
    echo -n "是否要重新配置？(y/N): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "保持現有配置。"
    else
        rm .env.local
        echo "已刪除舊配置。"
    fi
fi

# 創建 .env.local
if [ ! -f ".env.local" ]; then
    echo ""
    echo -e "${BLUE}📝 配置環境變量${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Gemini API Key
    echo ""
    echo "1️⃣  Gemini API Key"
    echo "   如果你還沒有，請訪問: https://ai.google.dev/"
    echo -n "   請輸入你的 Gemini API Key: "
    read -r GEMINI_KEY
    
    # Supabase URL
    echo ""
    echo "2️⃣  Supabase 配置"
    echo "   如果你還沒有 Supabase 項目，請先訪問: https://supabase.com"
    echo "   創建項目後，在 Settings → API 中找到以下信息"
    echo ""
    echo -n "   請輸入 Supabase Project URL (例如: https://xxxxx.supabase.co): "
    read -r SUPABASE_URL
    
    # Supabase Anon Key
    echo -n "   請輸入 Supabase Anon Key: "
    read -r SUPABASE_KEY
    
    # 創建 .env.local 文件
    cat > .env.local << EOF
# Gemini API Key
GEMINI_API_KEY=${GEMINI_KEY}

# Supabase 配置
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}
EOF
    
    echo ""
    echo -e "${GREEN}✓ .env.local 文件已創建${NC}"
fi

# 檢查依賴
echo ""
echo -e "${BLUE}📦 檢查依賴${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 依賴安裝成功${NC}"
    else
        echo -e "${RED}✗ 依賴安裝失敗${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 依賴已安裝${NC}"
fi

# 運行檢查腳本
echo ""
echo -e "${BLUE}🔍 運行部署檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./check-deployment.sh

# 詢問是否啟動開發服務器
echo ""
echo -e "${BLUE}🎯 下一步${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "你可以選擇："
echo "1. 啟動本地開發服務器測試應用"
echo "2. 查看部署文檔"
echo "3. 退出"
echo ""
echo -n "請選擇 (1/2/3): "
read -r choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 啟動開發服務器...${NC}"
        echo "訪問 http://localhost:5173 查看你的應用"
        echo "按 Ctrl+C 停止服務器"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${BLUE}📚 部署文檔${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "請查看以下文件獲取詳細信息："
        echo "• DEPLOYMENT.md - 完整部署指南"
        echo "• DEPLOYMENT_CHECKLIST.md - 部署清單"
        echo "• DEPLOYMENT_FLOW.md - 部署流程圖"
        echo ""
        echo "快速開始："
        echo "1. 確保 Supabase 項目已創建"
        echo "2. 在 Supabase SQL Editor 執行 supabase-init.sql"
        echo "3. 將代碼推送到 GitHub"
        echo "4. 在 Cloudflare Pages 連接 GitHub 倉庫"
        echo "5. 配置域名 jinyi.us.kg"
        echo ""
        ;;
    *)
        echo ""
        echo -e "${GREEN}👋 再見！${NC}"
        echo ""
        echo "提示："
        echo "• 運行 'npm run dev' 啟動開發服務器"
        echo "• 查看 DEPLOYMENT.md 了解部署步驟"
        echo "• 運行 './check-deployment.sh' 檢查配置"
        echo ""
        ;;
esac
