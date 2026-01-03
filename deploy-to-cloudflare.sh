#!/bin/bash

# 顏色設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 開始部署流程助手${NC}"
echo "================================="

# 1. 執行構建 Check
echo -e "\n${YELLOW}🔨 正在執行本地構建 (npm run build)...${NC}"
echo "這將確保產生的檔案是正確且最新的。"

if npm run build; then
    echo -e "${GREEN}✅ 構建成功！ 'dist' 資料夾已準備好。${NC}"
else
    echo -e "${RED}❌ 構建失敗。請檢查錯誤訊息。${NC}"
    exit 1
fi

# 2. Git 狀態檢查與推送
echo -e "\n${YELLOW}� 正在處理 Git 版本控制...${NC}"

# 確保是 git 倉庫
if [ ! -d ".git" ]; then
    git init
    echo "已初始化 Git 倉庫"
fi

# 檢查是否有變更
if git status --porcelain | grep .; then
    echo "發現變更，正在提交..."
    git add .
    git commit -m "Deploy: 更新與構建 ($(date +%Y-%m-%d\ %H:%M))"
else
    echo "沒有檢測到代碼變更。"
    # 選項：強制空提交以觸發部署
    read -p "是否要強制創建一個空提交以觸發 Cloudflare 部署？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit --allow-empty -m "Trigger: 強制觸發部署 ($(date +%Y-%m-%d\ %H:%M))"
        echo "已創建觸發用提交。"
    fi
fi

# 推送到遠端
echo -e "\n${YELLOW}☁️  正在推送到 GitHub...${NC}"
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    current_branch="main"
fi

if git push origin $current_branch; then
    echo -e "${GREEN}✅ 推送成功！${NC}"
    echo "如果 Cloudflare Pages 有連接 GitHub，現在應該會自動開始部署。"
else
    echo -e "${RED}❌ 推送失敗。${NC}"
    echo "請檢查您的網路連接或 GitHub 權限。"
fi

# 3. 手動部署指引
echo -e "\n================================="
echo -e "${GREEN}🎉 流程完成！${NC}"
echo -e "================================="
echo -e "如果您發現 Cloudflare 沒有自動部署，您可以手動上傳："
echo -e "1. 進入 Cloudflare Dashboard > Pages > 您的專案"
echo -e "2. 點擊 '${YELLOW}Create new deployment${NC}' 或 '${YELLOW}Upload assets${NC}'"
echo -e "3. 上傳此目錄下的 '${GREEN}dist${NC}' 資料夾"
echo -e "   路徑: $(pwd)/dist"
echo -e "================================="
