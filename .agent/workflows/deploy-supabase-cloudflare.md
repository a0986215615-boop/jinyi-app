---
description: 部署 Supabase 並配置 Cloudflare 域名
---

# 部署 Supabase 並配置 Cloudflare 域名 (jinyi.us.kg)

## 第一部分：設置 Supabase

### 1. 創建 Supabase 項目
- 訪問 https://supabase.com
- 點擊 "Start your project"
- 使用 GitHub 或 Email 登錄
- 點擊 "New Project"
- 填寫項目信息：
  - Name: 選擇一個項目名稱（例如：jinyi-app）
  - Database Password: 設置一個強密碼（gter6468）
  - Region: 選擇離你最近的區域（taipei）
  - Pricing Plan: 選擇 Free tier
- 點擊 "Create new project"
- 等待項目初始化（約 2 分鐘）

### 2. 獲取 Supabase 憑證
項目創建完成後：
- 在左側菜單點擊 "Project Settings" (齒輪圖標)
- 點擊 "API" 標籤
- 複製以下信息：
  - **Project URL** (例如：https://xxxxx.supabase.co)
  - **anon public** key (公開 API 密鑰)
  - **service_role** key (服務端密鑰，保密使用)

### 3. 配置數據庫架構
- 在左側菜單點擊 "SQL Editor"
- 點擊 "New query"
- 執行以下 SQL 創建表結構：

```sql
-- 創建用戶數據表
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 創建索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 創建策略允許所有操作（開發階段，生產環境需要更嚴格的策略）
CREATE POLICY "Enable all access for all users" ON user_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

- 點擊 "Run" 執行 SQL

### 4. 安裝 Supabase 客戶端
在項目目錄執行：
```bash
npm install @supabase/supabase-js
```

### 5. 配置環境變量
創建或更新 `.env.local` 文件（需要用戶手動添加憑證）：
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_existing_gemini_key
```

## 第二部分：配置 Cloudflare Pages

### 1. 準備部署
確保你的項目有 Git 倉庫：
```bash
git init
git add .
git commit -m "Initial commit with Supabase integration"
```

如果還沒有推送到 GitHub：
```bash
# 在 GitHub 創建新倉庫後
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 2. 部署到 Cloudflare Pages
- 訪問 https://dash.cloudflare.com
- 登錄你的 Cloudflare 帳戶
- 在左側菜單選擇 "Workers & Pages"
- 點擊 "Create application"
- 選擇 "Pages" 標籤
- 點擊 "Connect to Git"
- 授權 Cloudflare 訪問你的 GitHub
- 選擇你的倉庫
- 配置構建設置：
  - **Project name**: jinyi-app（或其他名稱）
  - **Production branch**: main
  - **Framework preset**: Vite
  - **Build command**: `npm run build`
  - **Build output directory**: `dist`
- 點擊 "Environment variables (advanced)"
- 添加環境變量：
  - `VITE_SUPABASE_URL` = 你的 Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
  - `GEMINI_API_KEY` = 你的 Gemini API key
- 點擊 "Save and Deploy"
- 等待部署完成（約 2-3 分鐘）

### 3. 配置自定義域名 (jinyi.us.kg)
部署完成後：
- 在 Cloudflare Pages 項目頁面，點擊 "Custom domains" 標籤
- 點擊 "Set up a custom domain"
- 輸入：`jinyi.us.kg`
- Cloudflare 會自動檢測這是 Cloudflare 管理的域名
- 點擊 "Activate domain"
- 等待 DNS 記錄自動配置（約 1-5 分鐘）

### 4. 驗證部署
- 訪問 `https://jinyi.us.kg` 確認應用正常運行
- 測試 Supabase 連接是否正常
- 檢查跨設備同步功能

## 第三部分：後續配置

### 配置 CORS（如果需要）
在 Supabase Dashboard：
- Settings → API → CORS Configuration
- 添加你的域名：`https://jinyi.us.kg`

### 設置 Supabase 安全策略
建議在生產環境中：
- 啟用 Email 驗證
- 配置更嚴格的 RLS 策略
- 定期備份數據庫

## 故障排除

### 如果部署失敗：
1. 檢查構建日誌中的錯誤信息
2. 確認所有環境變量都已正確設置
3. 確認 `package.json` 中的構建腳本正確

### 如果 Supabase 連接失敗：
1. 檢查環境變量是否正確
2. 確認 Supabase 項目狀態為 "Active"
3. 檢查瀏覽器控制台的錯誤信息

### 如果域名無法訪問：
1. 確認域名 DNS 記錄已生效（使用 `nslookup jinyi.us.kg`）
2. 清除瀏覽器緩存
3. 等待 DNS 傳播（最多 24 小時，通常幾分鐘）