-- ============================================
-- Supabase 數據庫初始化腳本
-- ============================================
-- 在 Supabase Dashboard → SQL Editor 中執行此腳本
-- 
-- 步驟:
-- 1. 登錄 Supabase Dashboard
-- 2. 選擇你的項目
-- 3. 點擊左側 "SQL Editor"
-- 4. 點擊 "+ New query"
-- 5. 複製並粘貼此文件的全部內容
-- 6. 點擊 "Run" 執行
-- ============================================

-- 創建用戶數據表
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加註釋
COMMENT ON TABLE user_data IS '用戶數據表，用於跨設備同步';
COMMENT ON COLUMN user_data.id IS '主鍵，自動生成的 UUID';
COMMENT ON COLUMN user_data.user_id IS '用戶唯一標識符';
COMMENT ON COLUMN user_data.data IS '用戶數據，以 JSON 格式存儲';
COMMENT ON COLUMN user_data.created_at IS '創建時間';
COMMENT ON COLUMN user_data.updated_at IS '最後更新時間';

-- 創建索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at DESC);

-- 創建更新時間自動更新的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 如果觸發器已存在，先刪除
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;

-- 創建觸發器
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 刪除舊策略（如果存在）
DROP POLICY IF EXISTS "Enable all access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable update access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable delete access for all users" ON user_data;

-- 創建訪問策略（開發環境 - 允許所有操作）
-- 注意: 生產環境應該使用更嚴格的策略
CREATE POLICY "Enable read access for all users" ON user_data
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON user_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON user_data
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON user_data
  FOR DELETE
  USING (true);

-- ============================================
-- 生產環境策略示例（可選）
-- ============================================
-- 如果你想使用基於用戶認證的策略，可以使用以下代碼替換上面的策略
-- 前提: 需要啟用 Supabase Auth

/*
-- 只允許用戶訪問自己的數據
CREATE POLICY "Users can view their own data" ON user_data
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own data" ON user_data
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own data" ON user_data
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own data" ON user_data
  FOR DELETE
  USING (auth.uid()::text = user_id);
*/

-- ============================================
-- 驗證腳本執行結果
-- ============================================

-- 查看表結構
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_data'
ORDER BY ordinal_position;

-- 查看索引
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_data';

-- 查看 RLS 策略
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_data';

-- ============================================
-- 完成！
-- ============================================
-- 如果看到上面的查詢結果，說明數據庫初始化成功！
-- 
-- 下一步:
-- 1. 複製 Project URL 和 anon key
-- 2. 更新 .env.local 文件
-- 3. 測試本地應用連接
-- ============================================
