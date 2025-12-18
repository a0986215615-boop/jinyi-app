# 部署指南

本指南將幫助你完成 Supabase 設置和 Cloudflare Pages 部署，並配置自定義域名 jinyi.us.kg。

## 📋 前置準備

- [x] Node.js 已安裝
- [x] npm 依賴已安裝
- [ ] GitHub 帳戶
- [ ] Supabase 帳戶
- [ ] Cloudflare 帳戶

## 🚀 快速開始

### 步驟 1: 設置 Supabase

1. **創建 Supabase 項目**
   - 訪問 [Supabase](https://supabase.com)
   - 點擊 "Start your project" 並登錄
   - 點擊 "New Project"
   - 填寫項目信息：
     - **Name**: `jinyi-app` (或你喜歡的名稱)
     - **Database Password**: 設置強密碼並保存
     - **Region**: 選擇 `Singapore` 或 `Tokyo`
     - **Plan**: 選擇 `Free`
   - 點擊 "Create new project"
   - ⏱️ 等待 2-3 分鐘初始化

2. **獲取 API 憑證**
   - 項目創建完成後，點擊左側 ⚙️ "Project Settings"
   - 點擊 "API" 標籤
   - 複製以下信息：
     - ✅ **Project URL** (例如: `https://xxxxx.supabase.co`)
     - ✅ **anon public** key

3. **創建數據庫表**
   - 點擊左側 🗄️ "SQL Editor"
   - 點擊 "+ New query"
   - 複製並執行以下 SQL：

```sql
-- 創建用戶數據表
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- 啟用 Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 創建訪問策略（開發環境）
CREATE POLICY "Enable all access for all users" ON user_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

   - 點擊 "Run" 執行
   - ✅ 確認顯示 "Success. No rows returned"

4. **配置本地環境變量**
   - 複製 `.env.example` 為 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```
   - 編輯 `.env.local`，填入你的憑證：
   ```
   VITE_SUPABASE_URL=你的_Project_URL
   VITE_SUPABASE_ANON_KEY=你的_anon_public_key
   GEMINI_API_KEY=你的_Gemini_API_key
   ```

5. **測試本地運行**
   ```bash
   npm run dev
   ```
   - 訪問 http://localhost:5173
   - 測試應用功能是否正常

### 步驟 2: 準備 Git 倉庫

1. **初始化 Git（如果還沒有）**
   ```bash
   git init
   git add .
   git commit -m "Add Supabase integration"
   ```

2. **推送到 GitHub**
   - 在 [GitHub](https://github.com) 創建新倉庫
   - 執行以下命令：
   ```bash
   git remote add origin https://github.com/你的用戶名/你的倉庫名.git
   git branch -M main
   git push -u origin main
   ```

### 步驟 3: 部署到 Cloudflare Pages

1. **連接 GitHub**
   - 訪問 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 登錄你的帳戶
   - 左側菜單選擇 "Workers & Pages"
   - 點擊 "Create application"
   - 選擇 "Pages" 標籤
   - 點擊 "Connect to Git"
   - 授權 Cloudflare 訪問 GitHub
   - 選擇你的倉庫

2. **配置構建設置**
   - **Project name**: `jinyi-app`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

3. **添加環境變量**
   - 點擊 "Environment variables (advanced)"
   - 添加以下變量：
     - `VITE_SUPABASE_URL` = 你的 Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
     - `GEMINI_API_KEY` = 你的 Gemini API key
   - 點擊 "Save and Deploy"
   - ⏱️ 等待 2-3 分鐘部署完成

4. **配置自定義域名 jinyi.us.kg**
   - 部署成功後，在項目頁面點擊 "Custom domains"
   - 點擊 "Set up a custom domain"
   - 輸入: `jinyi.us.kg`
   - 如果域名在 Cloudflare 管理：
     - Cloudflare 會自動檢測
     - 點擊 "Activate domain"
     - DNS 記錄會自動配置
   - 如果域名不在 Cloudflare：
     - 需要手動添加 CNAME 記錄
     - 指向 Cloudflare Pages 提供的地址
   - ⏱️ 等待 1-5 分鐘 DNS 生效

### 步驟 4: 驗證部署

1. **訪問你的應用**
   - 打開瀏覽器訪問: `https://jinyi.us.kg`
   - 確認應用正常加載

2. **測試 Supabase 連接**
   - 在應用中執行需要數據同步的操作
   - 打開瀏覽器開發者工具 (F12)
   - 檢查 Console 是否有錯誤
   - 在 Supabase Dashboard → Table Editor 查看數據是否保存

3. **測試跨設備同步**
   - 在不同設備或瀏覽器打開應用
   - 確認數據能夠同步

## 🔧 故障排除

### 本地開發問題

**問題**: 應用無法連接 Supabase
- ✅ 檢查 `.env.local` 文件是否存在
- ✅ 確認環境變量格式正確（無多餘空格）
- ✅ 重啟開發服務器 (`npm run dev`)

**問題**: 數據無法保存
- ✅ 檢查 Supabase 項目狀態是否為 "Active"
- ✅ 確認數據庫表已創建
- ✅ 檢查 RLS 策略是否正確配置

### 部署問題

**問題**: Cloudflare Pages 構建失敗
- ✅ 檢查構建日誌中的錯誤信息
- ✅ 確認 `package.json` 中的構建腳本正確
- ✅ 確認所有依賴都在 `package.json` 中

**問題**: 環境變量未生效
- ✅ 確認變量名稱正確（區分大小寫）
- ✅ 重新部署項目
- ✅ 清除瀏覽器緩存

**問題**: 域名無法訪問
- ✅ 使用 `nslookup jinyi.us.kg` 檢查 DNS
- ✅ 等待 DNS 傳播（最多 24 小時，通常幾分鐘）
- ✅ 清除瀏覽器緩存和 DNS 緩存

### Supabase 問題

**問題**: CORS 錯誤
- ✅ 在 Supabase Dashboard → Settings → API
- ✅ 添加你的域名到 CORS 配置: `https://jinyi.us.kg`

**問題**: 權限錯誤
- ✅ 檢查 RLS 策略是否正確
- ✅ 確認使用的是 `anon` key 而不是 `service_role` key

## 📚 後續步驟

### 安全性增強
- [ ] 配置更嚴格的 RLS 策略
- [ ] 啟用 Supabase Auth 進行用戶認證
- [ ] 定期備份數據庫

### 性能優化
- [ ] 啟用 Cloudflare CDN 緩存
- [ ] 優化圖片和資源加載
- [ ] 配置 Service Worker 離線支持

### 監控和分析
- [ ] 設置 Cloudflare Web Analytics
- [ ] 配置 Supabase 日誌監控
- [ ] 設置錯誤追蹤（如 Sentry）

## 🔗 有用的鏈接

- [Supabase 文檔](https://supabase.com/docs)
- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Vite 文檔](https://vitejs.dev/)
- [項目工作流程](./.agent/workflows/deploy-supabase-cloudflare.md)

## 💡 提示

- 保持 `.env.local` 文件的安全，不要提交到 Git
- 定期更新依賴包以獲得安全補丁
- 在生產環境使用 HTTPS
- 定期檢查 Supabase 和 Cloudflare 的使用配額

---

如有問題，請參考詳細的工作流程文檔或查看官方文檔。
