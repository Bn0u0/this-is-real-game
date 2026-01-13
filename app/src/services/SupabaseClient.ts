import { createClient } from '@supabase/supabase-js';

// 請在 .env 檔案或這裡直接填入你的 Supabase 專案資訊
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// [FORCE OFFLINE] Disabling backend to prevent errors since no valid credentials are provided.
const isOffline = true; // !SUPABASE_URL || !SUPABASE_KEY;

if (isOffline) {
    console.warn('⚠️ [Supabase] Missing Env Vars. Switching to OFFLINE / MOCK MODE.');
}

// Mock Client for Offline Mode
class MockSupabaseClient {
    auth = {
        getUser: async () => ({ data: { user: { id: 'guest_offline', email: 'guest@offline.local' } } }),
        getSession: async () => ({ data: { session: null } }),
        signInAnonymously: async () => ({ data: { user: { id: 'guest_offline' }, session: {} }, error: null }),
        signInWithOtp: async () => ({ error: { message: 'Offline Mode: Cannot send email.' } }),
        updateUser: async () => ({ error: { message: 'Offline Mode: Cannot update user.' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
    };

    from(table: string) {
        return {
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }), // Always return null data
            upsert: async () => ({ error: null }),
            insert: async () => ({ error: null }),
            update: async () => ({ error: null })
        };
    }
}

// Export real client or mock based on config
export const supabase = isOffline
    ? (new MockSupabaseClient() as any)
    : createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to check current session
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// 輔助函式：取得當前用戶 ID
export const getCurrentUserId = async () => {
    const user = await getCurrentUser();
    return user?.id;
};

