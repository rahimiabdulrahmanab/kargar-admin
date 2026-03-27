import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || "https://dudqjxbgkvzhvqenantq.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_MfbLvm2AYauid10xmF3Ylw_q3IVfUOm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSignedUrl(path, expiresInSeconds = 60) {
  if (!path) return null;
  if (path.startsWith("http") && path.includes("/helper-media/")) return path;

  const { data, error } = await supabase.storage
    .from("private-documents")
    .createSignedUrl(path, expiresInSeconds);

  if (error) { console.warn("getSignedUrl error:", error.message); return null; }
  return data.signedUrl;
}
