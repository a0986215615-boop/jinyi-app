<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Studio App with Supabase Sync

這是一個整合了 Supabase 跨設備同步功能的 AI Studio 應用。

🌐 **在線訪問**: https://jinyi.us.kg  
🎨 **AI Studio**: https://ai.studio/apps/drive/19HmCPPy5Lzrv1mVUImRf9GrNmnd7Zluj

## ✨ 功能特性

- 🤖 Google Gemini AI 集成
- 🔄 Supabase 跨設備數據同步
- 📱 響應式設計
- ⚡ Vite 快速構建
- 🚀 Cloudflare Pages 部署

## 🚀 快速開始

### 前置要求

- Node.js (推薦 v18+)
- npm 或 yarn
- Supabase 帳戶（免費）
- Cloudflare 帳戶（用於部署）

### 本地運行

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **配置環境變量**
   ```bash
   # 複製環境變量示例文件
   cp .env.example .env.local
   ```
   
   編輯 `.env.local` 並填入你的憑證：
   ```env
   GEMINI_API_KEY=你的_Gemini_API_密鑰
   VITE_SUPABASE_URL=你的_Supabase_項目_URL
   VITE_SUPABASE_ANON_KEY=你的_Supabase_Anon_密鑰
   ```

3. **運行開發服務器**
   ```bash
   npm run dev
   ```
   
   訪問 http://localhost:5173

### 檢查部署準備

運行部署檢查腳本以確保所有配置正確：

```bash
./check-deployment.sh
```

## 📦 部署到生產環境

詳細的部署步驟請查看 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### 快速部署概覽

1. **設置 Supabase**
   - 訪問 https://supabase.com 創建項目
   - 在 SQL Editor 中執行 `supabase-init.sql`
   - 複製 API 憑證

2. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用戶名/你的倉庫.git
   git push -u origin main
   ```

3. **部署到 Cloudflare Pages**
   - 訪問 https://dash.cloudflare.com
   - 連接 GitHub 倉庫
   - 配置構建設置和環境變量
   - 添加自定義域名 `jinyi.us.kg`

## 📁 項目結構

```
.
├── App.tsx                    # 主應用組件
├── index.tsx                  # 應用入口
├── components/                # React 組件
├── contexts/                  # React Context
├── services/
│   ├── geminiService.ts      # Gemini AI 服務
│   └── supabaseService.ts    # Supabase 數據同步服務
├── types.ts                   # TypeScript 類型定義
├── constants.ts               # 常量配置
├── supabase-init.sql         # Supabase 數據庫初始化腳本
├── check-deployment.sh       # 部署前檢查腳本
├── DEPLOYMENT.md             # 詳細部署指南
└── .env.example              # 環境變量示例
```

## 🔧 可用腳本

- `npm run dev` - 啟動開發服務器
- `npm run build` - 構建生產版本
- `npm run preview` - 預覽生產構建
- `./check-deployment.sh` - 檢查部署準備情況

## 🛠️ 技術棧

- **前端框架**: React 19
- **構建工具**: Vite 6
- **語言**: TypeScript
- **AI**: Google Gemini
- **數據庫**: Supabase (PostgreSQL)
- **部署**: Cloudflare Pages
- **路由**: React Router
- **圖標**: Lucide React

## 📚 相關文檔

- [部署指南](./DEPLOYMENT.md) - 完整的部署步驟和故障排除
- [Supabase 文檔](https://supabase.com/docs)
- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Vite 文檔](https://vitejs.dev/)

## 🔐 安全注意事項

- ⚠️ 不要將 `.env.local` 提交到 Git
- ⚠️ 在生產環境使用嚴格的 Supabase RLS 策略
- ⚠️ 定期更新依賴以獲得安全補丁
- ⚠️ 保護好你的 API 密鑰

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可證

MIT License

---

Made with ❤️ using Google AI Studio

<!-- Updated: admin firewall enabled -->
