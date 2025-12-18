# ⚡ 快速配置指南

## 🎉 Supabase 項目已創建成功！

### 📋 您的 Supabase 憑證

```
Project URL: https://zntvofpaohnouepquxke.supabase.co
Anon Key: sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb
```

---

## 📝 下一步：執行 SQL 初始化腳本

### 方法 1：在瀏覽器中執行（推薦）

您的瀏覽器現在應該已經打開了 Supabase SQL 編輯器。

1. **複製 SQL 腳本**
   - 打開項目中的 `supabase-init.sql` 文件
   - 選擇全部內容（Cmd+A）
   - 複製（Cmd+C）

2. **粘貼並執行**
   - 在瀏覽器的 SQL 編輯器中點擊編輯區域
   - 粘貼 SQL 內容（Cmd+V）
   - 點擊右下角的 "跑步" (Run) 按鈕
   - 等待執行完成，應該看到成功消息

3. **驗證表已創建**
   - 點擊左側菜單的 "Table Editor"（表編輯器）
   - 應該能看到 `user_data` 表

---

## 🔧 配置本地環境變量

創建或編輯 `.env.local` 文件：

```bash
# 複製示例文件（如果還沒有）
cp .env.example .env.local
```

然後編輯 `.env.local`，填入以下內容：

```env
# Gemini API Key（您應該已經有了）
GEMINI_API_KEY=你的_Gemini_API_key

# Supabase 配置
VITE_SUPABASE_URL=https://zntvofpaohnouepquxke.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb
```

---

## 🧪 測試連接

### 方法 1：使用測試頁面（最簡單）

1. **編輯 `test-supabase.html`**
   - 打開文件，找到第 67-68 行
   - 替換為：
   ```javascript
   const SUPABASE_URL = 'https://zntvofpaohnouepquxke.supabase.co';
   const SUPABASE_ANON_KEY = 'sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb';
   ```

2. **在瀏覽器中打開**
   - 雙擊 `test-supabase.html` 文件
   - 點擊 "🔍 測試連接" 按鈕
   - 應該看到綠色成功消息

3. **測試資料操作**
   - 點擊 "💾 儲存資料" 測試寫入
   - 點擊 "📥 載入資料" 測試讀取
   - 在 Supabase Dashboard 的 Table Editor 中確認資料

### 方法 2：運行開發服務器

```bash
cd "/Users/jack/Downloads/測試 8 2"
npm run dev
```

訪問 http://localhost:5173 測試應用

---

## 🚀 部署到 Cloudflare Pages

SQL 腳本執行成功並且本地測試通過後，您就可以部署到線上了！

### 快速步驟：

1. **推送到 GitHub**（需要先安裝 Xcode 命令行工具）
   ```bash
   # 如果 git 命令不可用，先執行：
   xcode-select --install
   
   # 然後推送代碼：
   git init
   git add .
   git commit -m "Add Supabase integration"
   
   # 在 GitHub 創建倉庫後：
   git remote add origin https://github.com/你的用戶名/jinyi-app.git
   git push -u origin main
   ```

2. **在 Cloudflare 部署**
   - 訪問 https://dash.cloudflare.com
   - Workers & Pages → Create application → Pages → Connect to Git
   - 選擇您的 GitHub 倉庫
   - 構建設置：
     - Framework: `Vite`
     - Build command: `npm run build`
     - Output directory: `dist`
   - 添加環境變量：
     - `VITE_SUPABASE_URL` = `https://zntvofpaohnouepquxke.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_TZOgnWwcDA1bRfHghcRSyg_lbmnh4jb`
     - `GEMINI_API_KEY` = 您的 Gemini API key
   - 點擊 "Save and Deploy"

3. **配置域名**
   - 部署完成後，在項目頁面點擊 "Custom domains"
   - 添加 `jinyi.us.kg`
   - 等待 DNS 生效（幾分鐘）

---

## ✅ 完成檢查清單

- [ ] 在 Supabase SQL 編輯器中執行了 `supabase-init.sql`
- [ ] 在 Table Editor 中看到了 `user_data` 表
- [ ] 已配置 `.env.local` 文件
- [ ] 測試頁面連接成功
- [ ] 本地開發服務器運行正常
- [ ] 代碼已推送到 GitHub
- [ ] Cloudflare Pages 部署完成
- [ ] 域名 jinyi.us.kg 已配置並可訪問

---

## 💡 重要提示

- ⚠️ 請務必保存好您的資料庫密碼！
- ⚠️ `.env.local` 文件已在 .gitignore 中，不會被提交到 Git
- ✅ Supabase 免費方案已足夠開發和測試使用
- ✅ Cloudflare Pages 提供全球 CDN 加速

---

需要幫助？參考完整的部署文檔：`DEPLOYMENT_GUIDE.md`
