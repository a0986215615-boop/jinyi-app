-- 簡化版 Supabase 初始化腳本
-- 請複製這個文件的全部內容，粘貼到 Supabase SQL 編輯器中執行

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
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at DESC);

-- 創建觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 刪除舊觸發器（如果存在）
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;

-- 創建觸發器
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 刪除舊策略
DROP POLICY IF EXISTS "Enable read access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable update access for all users" ON user_data;
DROP POLICY IF EXISTS "Enable delete access for all users" ON user_data;

-- 創建訪問策略（開發環境）
CREATE POLICY "Enable read access for all users" ON user_data FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_data FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON user_data FOR DELETE USING (true);
