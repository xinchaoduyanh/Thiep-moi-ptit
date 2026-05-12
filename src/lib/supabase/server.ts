import { createClient } from "@supabase/supabase-js";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import WebSocket from "ws";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey || supabasePublicKey;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function hasSupabaseAdminAccess() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function createSupabaseServerClient(options?: { admin?: boolean }) {
  const key = options?.admin ? supabaseServiceRoleKey : supabaseKey;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: WebSocket as unknown as WebSocketLikeConstructor,
    },
  });
}
