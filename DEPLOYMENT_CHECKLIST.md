# 🚀 部署清單

使用此清單確保你完成了所有必要的部署步驟。

## ✅ 第一階段：Supabase 設置

- [ ] 訪問 https://supabase.com 並登錄
- [ ] 創建新項目
  - [ ] 項目名稱: `jinyi-app`
  - [ ] 數據庫密碼: _______________（請記錄）
  - [ ] 區域: Singapore / Tokyo
  - [ ] 計劃: Free
- [ ] 等待項目初始化完成（約 2 分鐘）
- [ ] 複製 API 憑證
  - [ ] Project URL: _______________
  - [ ] anon public key: _______________
- [ ] 執行數據庫初始化
  - [ ] 打開 SQL Editor
  - [ ] 執行 `supabase-init.sql` 文件內容
  - [ ] 確認執行成功

## ✅ 第二階段：本地配置

- [ ] 複製環境變量文件
  ```bash
  cp .env.example .env.local
  ```
- [ ] 編輯 `.env.local` 並填入憑證
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `GEMINI_API_KEY`（如果還沒有）
- [ ] 安裝依賴
  ```bash
  npm install
  ```
- [ ] 測試本地運行
  ```bash
  npm run dev
  ```
- [ ] 訪問 http://localhost:5173 確認應用正常
- [ ] 運行部署檢查
  ```bash
  ./check-deployment.sh
  ```
- [ ] 確認所有檢查通過

## ✅ 第三階段：Git 和 GitHub

- [ ] 初始化 Git（如果還沒有）
  ```bash
  git init
  ```
- [ ] 添加所有文件
  ```bash
  git add .
  ```
- [ ] 創建提交
  ```bash
  git commit -m "Add Supabase integration and deployment config"
  ```
- [ ] 在 GitHub 創建新倉庫
  - 倉庫名稱: _______________
  - 倉庫 URL: _______________
- [ ] 連接遠程倉庫
  ```bash
  git remote add origin https://github.com/你的用戶名/你的倉庫名.git
  ```
- [ ] 推送代碼
  ```bash
  git branch -M main
  git push -u origin main
  ```

## ✅ 第四階段：Cloudflare Pages 部署

- [ ] 訪問 https://dash.cloudflare.com 並登錄
- [ ] 進入 "Workers & Pages"
- [ ] 點擊 "Create application"
- [ ] 選擇 "Pages" → "Connect to Git"
- [ ] 授權 Cloudflare 訪問 GitHub
- [ ] 選擇你的倉庫
- [ ] 配置構建設置
  - [ ] Project name: `jinyi-app`
  - [ ] Production branch: `main`
  - [ ] Framework preset: `Vite`
  - [ ] Build command: `npm run build`
  - [ ] Build output directory: `dist`
- [ ] 添加環境變量
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `GEMINI_API_KEY`
- [ ] 點擊 "Save and Deploy"
- [ ] 等待部署完成（約 2-3 分鐘）
- [ ] 記錄 Cloudflare Pages URL: _______________

## ✅ 第五階段：配置自定義域名

- [ ] 在 Cloudflare Pages 項目中點擊 "Custom domains"
- [ ] 點擊 "Set up a custom domain"
- [ ] 輸入域名: `jinyi.us.kg`
- [ ] 確認域名在 Cloudflare 管理
- [ ] 點擊 "Activate domain"
- [ ] 等待 DNS 配置完成（約 1-5 分鐘）
- [ ] 訪問 https://jinyi.us.kg 確認可以訪問

## ✅ 第六階段：驗證和測試

- [ ] 訪問 https://jinyi.us.kg
- [ ] 確認應用正常加載
- [ ] 測試主要功能
- [ ] 打開瀏覽器開發者工具（F12）
- [ ] 檢查 Console 沒有錯誤
- [ ] 測試數據保存功能
- [ ] 在 Supabase Dashboard → Table Editor 查看數據
- [ ] 在不同設備/瀏覽器測試數據同步

## ✅ 第七階段：安全和優化（可選但推薦）

- [ ] 在 Supabase 配置 CORS
  - Settings → API → CORS Configuration
  - 添加: `https://jinyi.us.kg`
- [ ] 檢查 Supabase RLS 策略
- [ ] 啟用 Cloudflare Analytics
- [ ] 配置 SSL/TLS 設置
- [ ] 設置自動部署（GitHub 推送時自動部署）

## 📝 部署信息記錄

完成部署後，請記錄以下信息：

- **Supabase 項目名稱**: _______________
- **Supabase Project URL**: _______________
- **GitHub 倉庫**: _______________
- **Cloudflare Pages URL**: _______________
- **自定義域名**: jinyi.us.kg
- **部署日期**: _______________

## 🆘 遇到問題？

如果遇到任何問題，請查看：

1. [DEPLOYMENT.md](./DEPLOYMENT.md) - 詳細部署指南和故障排除
2. 運行 `./check-deployment.sh` 檢查配置
3. 查看 Cloudflare Pages 構建日誌
4. 查看瀏覽器控制台錯誤信息
5. 檢查 Supabase 項目狀態

## 🎉 完成！

恭喜！你的應用已成功部署到 https://jinyi.us.kg

下一步可以：
- 分享你的應用給朋友
- 添加更多功能
- 優化性能和用戶體驗
- 配置監控和分析
