#!/bin/bash

# 部署前檢查腳本
# 此腳本會檢查所有必要的配置是否就緒

echo "🔍 檢查部署準備情況..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查計數
CHECKS_PASSED=0
CHECKS_FAILED=0

# 檢查 Node.js
echo -n "檢查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} ($NODE_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} 未安裝"
    ((CHECKS_FAILED++))
fi

# 檢查 npm
echo -n "檢查 npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} ($NPM_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} 未安裝"
    ((CHECKS_FAILED++))
fi

# 檢查 Git
echo -n "檢查 Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} ($GIT_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} 未安裝"
    ((CHECKS_FAILED++))
fi

# 檢查 node_modules
echo -n "檢查依賴安裝... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} 請運行 npm install"
    ((CHECKS_FAILED++))
fi

# 檢查 .env.local
echo -n "檢查環境變量文件... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
    
    # 檢查必要的環境變量
    echo -n "  檢查 VITE_SUPABASE_URL... "
    if grep -q "VITE_SUPABASE_URL=https://" .env.local; then
        echo -e "${GREEN}✓${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} 未配置或格式錯誤"
        ((CHECKS_FAILED++))
    fi
    
    echo -n "  檢查 VITE_SUPABASE_ANON_KEY... "
    if grep -q "VITE_SUPABASE_ANON_KEY=eyJ" .env.local; then
        echo -e "${GREEN}✓${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} 未配置或格式錯誤"
        ((CHECKS_FAILED++))
    fi
    
    echo -n "  檢查 GEMINI_API_KEY... "
    if grep -q "GEMINI_API_KEY=" .env.local && ! grep -q "GEMINI_API_KEY=your" .env.local; then
        echo -e "${GREEN}✓${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} 未配置"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}✗${NC} 文件不存在"
    echo -e "  ${YELLOW}提示:${NC} 複製 .env.example 為 .env.local 並填入你的憑證"
    ((CHECKS_FAILED++))
fi

# 檢查 Git 倉庫
echo -n "檢查 Git 倉庫... "
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
    
    # 檢查遠程倉庫
    echo -n "  檢查 Git 遠程倉庫... "
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        echo -e "${GREEN}✓${NC} ($REMOTE_URL)"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} 未配置"
        echo -e "  ${YELLOW}提示:${NC} 需要將代碼推送到 GitHub"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}✗${NC} 未初始化"
    echo -e "  ${YELLOW}提示:${NC} 運行 git init"
    ((CHECKS_FAILED++))
fi

# 檢查構建
echo -n "測試構建... "
if npm run build &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} 構建失敗"
    echo -e "  ${YELLOW}提示:${NC} 運行 npm run build 查看詳細錯誤"
    ((CHECKS_FAILED++))
fi

# 總結
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "檢查完成: ${GREEN}${CHECKS_PASSED} 通過${NC}, ${RED}${CHECKS_FAILED} 失敗${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有檢查通過！可以開始部署了。${NC}"
    echo ""
    echo "下一步:"
    echo "1. 訪問 https://supabase.com 創建項目（如果還沒有）"
    echo "2. 訪問 https://dash.cloudflare.com 部署到 Cloudflare Pages"
    echo "3. 查看 DEPLOYMENT.md 獲取詳細步驟"
    exit 0
else
    echo -e "${YELLOW}⚠ 有 ${CHECKS_FAILED} 項檢查未通過，請先修復這些問題。${NC}"
    echo ""
    echo "查看 DEPLOYMENT.md 獲取幫助"
    exit 1
fi
