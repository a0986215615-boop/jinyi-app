# 🚀 部署下一步驟

**更新時間**：2025-12-18 20:54

---

## ✅ 已完成

1. ✅ **Supabase 資料庫設置完成**
   - SQL 腳本已成功執行
   - `user_data` 表已創建
   - 索引、觸發器、RLS 策略都已配置好

2. ✅ **Supabase 憑證**
   ```
   Project URL: https://zntvofpaohnouepquxke.supabase.co
   Anon Key: sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb
   ```

---

## 📋 接下來的操作

### 方案 A：直接在 Cloudflare Pages 部署 (推薦)

由於您的電腦缺少 Git 命令行工具，建議使用 GitHub Desktop 或直接在網頁上操作。

#### 步驟 1：安裝 Xcode Command Line Tools（一次性）

```bash
xcode-select --install
```

這會彈出一個對話框，點擊 "Install" 並等待安裝完成（約 5-10 分鐘）。

#### 步驟 2A：使用命令行（如果已安裝 Git）

```bash
cd "/Users/jack/Downloads/測試 8 2"

# 初始化 Git
git init
git add .
git commit -m "Initial commit with Supabase integration"

# 在 GitHub 創建新倉庫後執行
# 訪問 https://github.com/new 創建名為 jinyi-app 的倉庫
git remote add origin https://github.com/你的用戶名/jinyi-app.git
git branch -M main
git push -u origin main
```

#### 步驟 2B：使用 GitHub Desktop（推薦，如果沒有 Git）

1. 下載並安裝 GitHub Desktop：https://desktop.github.com/
2. 打開 GitHub Desktop
3. File → Add Local Repository → 選擇 `/Users/jack/Downloads/測試 8 2`
4. 點擊 "Create Repository"
5. 填寫 Commit message："Initial commit with Supabase integration"
6. 點擊 "Publish repository"
7. Repository name: `jinyi-app`
8. 取消勾選 "Keep this code private"（或根據需要勾選）
9. 點擊 "Publish Repository"

---

### 步驟 3：在 Cloudflare Pages 部署

1. **登錄 Cloudflare**
   - 訪問：https://dash.cloudflare.com
   - 登錄您的帳戶

2. **創建新專案**
   - 點擊左側菜單 "Workers & Pages"
   - 點擊 "Create application"
   - 選擇 "Pages" 標籤
   - 點擊 "Connect to Git"

3. **連接 GitHub**
   - 授權 Cloudflare 訪問您的 GitHub
   - 選擇 `jinyi-app` 倉庫
   - 點擊 "Begin setup"

4. **配置構建設置**
   ```
   Project name: jinyi-app
   Production branch: main
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

5. **添加環境變量**
   點擊 "Environment variables (advanced)"，添加以下變量：

   | Variable name | Value |
   |---------------|-------|
   | `VITE_SUPABASE_URL` | `https://zntvofpaohnouepquxke.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb` |
   | `GEMINI_API_KEY` | 您的 Gemini API key |

   ⚠️ **重要**：GEMINI_API_KEY 需要您自己填入

6. **部署**
   - 點擊 "Save and Deploy"
   - 等待構建完成（約 2-3 分鐘）
   - 部署成功後會顯示一個 `.pages.dev` 的網址

---

### 步驟 4：配置自定義域名 (jinyi.us.kg)

1. **添加自定義域名**
   - 在 Cloudflare Pages 專案頁面
   - 點擊 "Custom domains" 標籤
   - 點擊 "Set up a custom domain"
   - 輸入：`jinyi.us.kg`

2. **配置 DNS**
   - Cloudflare 會自動檢測這是一個 Cloudflare 管理的域名
   - 點擊 "Activate domain"
   - 等待 DNS 記錄自動配置（約 1-5 分鐘）

3. **驗證部署**
   - 訪問 `https://jinyi.us.kg`
   - 確認應用正常運行
   - 測試 Supabase 連接是否正常

---

## 🛠️ 故障排除

### 如果構建失敗

1. **檢查構建日誌**
   - 在 Cloudflare Pages 專案頁面查看構建日誌
   - 查找錯誤信息

2. **常見問題**
   - 確認 `package.json` 中有 `"build": "vite build"` 腳本
   - 確認所有依賴已在 `package.json` 中列出
   - 確認環境變量已正確設置

### 如果應用無法連接 Supabase

1. **檢查環境變量**
   - 在 Cloudflare Pages 設置中確認環境變量正確
   - 重新部署以應用環境變量更改

2. **檢查 CORS 設置**
   - 在 Supabase Dashboard
   - Settings → API → CORS Configuration
   - 添加您的域名：`https://jinyi.us.kg` 和 `https://jinyi-app.pages.dev`

3. **檢查 RLS 策略**
   - 確認在 Supabase SQL Editor 中執行過初始化腳本
   - 在 Table Editor 中確認 `user_data` 表存在

---

## 📊 完成檢查表

- [ ] 安裝 Xcode Command Line Tools（或使用 GitHub Desktop）
- [ ] 將代碼推送到 GitHub
- [ ] 在 Cloudflare Pages 創建專案
- [ ] 配置構建設置
- [ ] 添加環境變量（包括 GEMINI_API_KEY）
- [ ] 部署應用
- [ ] 配置自定義域名 `jinyi.us.kg`
- [ ] 測試應用功能
- [ ] 🎉 完成！

---

## 🎯 預計時間

- GitHub 設置：5-10 分鐘
- Cloudflare Pages 部署：10-15 分鐘
- 域名配置：5 分鐘
- 總計：**20-30 分鐘**

---

## 💡 提示

- Supabase 資料庫已經準備好，不需要再執行 SQL 腳本
- 如果不使用 `jinyi.us.kg` 域名，可以直接使用 Cloudflare 提供的 `.pages.dev` 網址
- 可以隨時在 Cloudflare Pages 的 Deployments 頁面查看部署進度和日誌
- 每次推送到 GitHub 的 main 分支都會自動觸發新的部署
