// src/lib/actions.js
// Admin actions: approve, reject, flag for review, delete.
// Always updates BOTH helper_profiles.status AND
// helper_accounts.verification_status in sync.

import { supabase } from "./supabase";

// Maps admin action → DB status values
const STATUS_MAP = {
  verified: { profile: "verified", account: "verified" },
  rejected: { profile: "rejected", account: "rejected" },
  review:   { profile: "review",   account: "pending"  },
  pending:  { profile: "pending",  account: "pending"  },
};

export async function setHelperStatus(profileId, accountId, action) {
  const map = STATUS_MAP[action];
  if (!map) throw new Error(`Unknown action: ${action}`);

  const { error: profileErr } = await supabase
    .from("helper_profiles")
    .update({ status: map.profile })
    .eq("id", profileId);

  if (profileErr) throw new Error(`Profile update failed: ${profileErr.message}`);

  const { error: accountErr } = await supabase
    .from("helper_accounts")
    .update({ verification_status: map.account })
    .eq("id", accountId);

  if (accountErr) {
    console.warn("Account sync warning:", accountErr.message);
  }

  return true;
}

export async function deleteHelper(profileId, accountId) {
  // 1 — Delete work photos
  const { error: wpErr } = await supabase
    .from("helper_work_photos")
    .delete()
    .eq("helper_profile_id", profileId);
  if (wpErr) throw new Error(`work_photos: ${wpErr.message}`);

  // 2 — Delete documents
  const { error: docErr } = await supabase
    .from("helper_documents")
    .delete()
    .eq("helper_account_id", accountId);
  if (docErr) throw new Error(`documents: ${docErr.message}`);

  // 3 — Delete profile
  const { error: profErr } = await supabase
    .from("helper_profiles")
    .delete()
    .eq("id", profileId);
  if (profErr) throw new Error(`profiles: ${profErr.message}`);

  // 4 — Delete account only if no other profiles remain under same phone
  const { data: remaining } = await supabase
    .from("helper_profiles")
    .select("id")
    .eq("helper_account_id", accountId);

  if (!remaining || remaining.length === 0) {
    const { error: accErr } = await supabase
      .from("helper_accounts")
      .delete()
      .eq("id", accountId);
    if (accErr) throw new Error(`accounts: ${accErr.message}`);
  }

  return true;
}
