import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

// Graceful client initialization
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper to convert file to Data URL or Object URL as fallback when storage RLS is restricted
 */
async function fileToMediaUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    // For large files (>10MB), use ObjectURL for performance
    if (file.size > 10 * 1024 * 1024) {
      resolve(URL.createObjectURL(file));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

/**
 * Storage Bucket Uploader with seamless RLS Error Fallback
 */
export async function uploadMediaToSupabase(
  bucket: 'product-images' | 'product-videos' | 'collection-banners' | 'category-images',
  file: File,
  folderPath: string = ''
): Promise<{ url: string | null; error: Error | null; isLocalFallback?: boolean }> {
  try {
    if (!isSupabaseConfigured) {
      const fallbackUrl = await fileToMediaUrl(file);
      return { url: fallbackUrl, error: null, isLocalFallback: true };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = folderPath ? `${folderPath}/${Date.now()}_${cleanFileName}` : `${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      console.warn(`Supabase Storage policy restricted on "${bucket}" (${uploadError.message}). Using instant local fallback.`);
      // Graceful fallback to prevent breaking admin experience when RLS policy isn't configured yet
      const fallbackUrl = await fileToMediaUrl(file);
      return { url: fallbackUrl, error: null, isLocalFallback: true };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: publicData.publicUrl, error: null, isLocalFallback: false };
  } catch (err: unknown) {
    console.warn(`Storage upload exception on "${bucket}". Using local fallback:`, err);
    const fallbackUrl = await fileToMediaUrl(file);
    return { url: fallbackUrl, error: null, isLocalFallback: true };
  }
}

/**
 * Check if the currently authenticated user has role === 'admin'
 */
export async function verifyAdminStatus(): Promise<{ isAdmin: boolean; user: any; profile: any }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { isAdmin: false, user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return { isAdmin: false, user: authData.user, profile: null };
    }

    return {
      isAdmin: profile.role === 'admin' && profile.is_active === true,
      user: authData.user,
      profile,
    };
  } catch (err) {
    console.error('Failed to verify admin status:', err);
    return { isAdmin: false, user: null, profile: null };
  }
}
