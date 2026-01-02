#!/bin/bash

# 🚀 Cloudflare Pages 部署狀態檢查腳本

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 Cloudflare Pages 部署狀態檢查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 網站 URL
SITE_URL="https://jinyi-app.pages.dev"

# 檢查 Git 狀態
echo "📦 Git 倉庫狀態:"
echo "   最新提交: $(git log -1 --oneline)"
echo "   分支: $(git branch --show-current)"
echo ""

# 檢查遠端同步狀態
echo "🌐 GitHub 同步狀態:"
BEHIND=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo "0")
AHEAD=$(git rev-list origin/main..HEAD --count 2>/dev/null || echo "0")

if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
    echo "   ✅ 本地與遠端完全同步"
elif [ "$AHEAD" -gt 0 ]; then
    echo "   ⚠️  有 $AHEAD 個本地提交未推送"
else
    echo "   ⚠️  遠端領先 $BEHIND 個提交"
fi
echo ""

# 檢查網站可訪問性
echo "🌍 檢查線上網站:"
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$SITE_URL")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ 網站可訪問 (HTTP $HTTP_CODE)"
else
    echo "   ❌ 網站無法訪問 (HTTP $HTTP_CODE)"
fi
echo ""

# 檢查網站內容（副標題）
echo "🔍 檢查首頁內容:"
CONTENT=$(curl -s "$SITE_URL" | grep -o '從[^<]*' | head -1)
if [ -z "$CONTENT" ]; then
    echo "   ⏳ 正在載入或無法檢測內容..."
elif echo "$CONTENT" | grep -q "從美好的一天開始"; then
    echo "   ✅ 副標題已更新: $CONTENT"
    echo "   🎉 部署成功！"
elif echo "$CONTENT" | grep -q "從智慧預約開始"; then
    echo "   ⚠️  副標題尚未更新: $CONTENT"
    echo "   ℹ️  可能需要等待 Cloudflare Pages 部署完成"
else
    echo "   ❓ 檢測到: $CONTENT"
fi
echo ""

# 顯示建議操作
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 後續步驟:"
echo ""
echo "1. 登入 Cloudflare Dashboard:"
echo "   👉 https://dash.cloudflare.com"
echo ""
echo "2. 進入 Workers & Pages → jinyi-app"
echo ""
echo "3. 檢查最新部署狀態"
echo "   - 應該看到新的部署正在進行或已完成"
echo "   - 提交訊息應該是: 'chore: 觸發 Cloudflare Pages 重新部署最新系統設定'"
echo ""
echo "4. 等待 2-5 分鐘後重新執行此腳本："
echo "   👉 ./check-deployment-status.sh"
echo ""
echo "5. 或者強制重新整理網站："
echo "   👉 open '$SITE_URL'"
echo "   然後按 Cmd + Shift + R"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
