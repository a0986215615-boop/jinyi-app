import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 創建 Supabase 客戶端
let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not configured. Data sync will be disabled.');
        return null;
    }

    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    return supabase;
};

// 檢查 Supabase 是否已配置
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};

// 保存用戶數據到 Supabase
export const saveUserData = async (userId: string, data: any): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('user_data')
            .upsert({
                user_id: userId,
                data: data,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error saving data to Supabase:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception saving data to Supabase:', err);
        return false;
    }
};

// 從 Supabase 加載用戶數據
export const loadUserData = async (userId: string): Promise<any | null> => {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('user_data')
            .select('data')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // 沒有找到數據，這是正常的
                return null;
            }
            console.error('Error loading data from Supabase:', error);
            return null;
        }

        return data?.data || null;
    } catch (err) {
        console.error('Exception loading data from Supabase:', err);
        return null;
    }
};

// 加載所有用戶數據（管理員用）
export const loadAllUsersData = async (): Promise<any[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('user_data')
            .select('user_id, data');

        if (error) {
            console.error('Error loading all users data:', error);
            return [];
        }

        return data.map(row => ({
            userId: row.user_id,
            ...row.data
        }));
    } catch (err) {
        console.error('Exception loading all users data:', err);
        return [];
    }
};

// 刪除用戶數據
export const deleteUserData = async (userId: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('user_data')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting data from Supabase:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception deleting data from Supabase:', err);
        return false;
    }
};

// 訂閱數據變更（實時同步）
export const subscribeToUserData = (
    userId: string,
    onDataChange: (data: any) => void
) => {
    const client = getSupabaseClient();
    if (!client) return null;

    const subscription = client
        .channel(`user_data:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'user_data',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                if (payload.new && typeof payload.new === 'object' && 'data' in payload.new) {
                    onDataChange(payload.new.data);
                }
            }
        )
        .subscribe();

    return subscription;
};
