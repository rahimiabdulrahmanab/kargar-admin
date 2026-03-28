// src/hooks/useHelpers.js
// Fetches and normalises helper records for admin use.
// Returns all helpers regardless of status.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useHelpers() {
  const [helpers,   setHelpers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchHelpers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1 — profiles + accounts (joined via foreign key)
      const { data: profiles, error: pErr } = await supabase
        .from("helper_profiles")
        .select(`
          id,
          helper_account_id,
          category_key,
          subcategory_key,
          other_profession_native,
          other_profession_en,
          experience_key,
          work_type_key,
          work_area_key,
          has_tools,
          profile_photo_url,
          status,
          created_at,
          helper_accounts (
            id,
            first_name_native,
            last_name_native,
            first_name_en,
            last_name_en,
            phone_country_code,
            phone_local,
            has_whatsapp,
            whatsapp_same_as_phone,
            whatsapp_country_code,
            whatsapp_local,
            province_key,
            city_key,
            dob_day,
            dob_month,
            dob_year,
            verification_status
          )
        `)
        .order("created_at", { ascending: false });

      if (pErr) throw new Error(pErr.message);

      const profileIds = profiles.map((p) => p.id);
      const accountIds = profiles
        .map((p) => p.helper_account_id)
        .filter(Boolean);

      // Step 2 — work photos
      const { data: workPhotos } = await supabase
        .from("helper_work_photos")
        .select("helper_profile_id, photo_url, sort_order")
        .in("helper_profile_id", profileIds)
        .order("sort_order", { ascending: true });

      // Step 3 — documents (Tazkira)
      const { data: documents } = await supabase
        .from("helper_documents")
        .select("helper_account_id, document_type, file_url, review_status")
        .in("helper_account_id", accountIds)
        .eq("document_type", "tazkira");

      // Group by id
      const wpByProfile = {};
      for (const wp of workPhotos || []) {
        if (!wpByProfile[wp.helper_profile_id]) wpByProfile[wp.helper_profile_id] = [];
        wpByProfile[wp.helper_profile_id].push(wp.photo_url);
      }

      const docsByAccount = {};
      for (const doc of documents || []) {
        if (!docsByAccount[doc.helper_account_id]) docsByAccount[doc.helper_account_id] = [];
        docsByAccount[doc.helper_account_id].push(doc.file_url);
      }

      // Normalise to clean objects
      const normalised = profiles.map((p) => {
        const a = p.helper_accounts || {};
        const cc = a.phone_country_code || "+93";

        const phone = a.phone_local ? `${cc}${a.phone_local}` : "—";

        let whatsapp = null;
        if (a.has_whatsapp) {
          const wLocal = a.whatsapp_same_as_phone
            ? a.phone_local
            : (a.whatsapp_local || a.phone_local);
          const wCc = a.whatsapp_country_code || cc;
          whatsapp = wLocal ? `${wCc}${wLocal}` : null;
        }

        return {
          profileId:        p.id,
          accountId:        p.helper_account_id,
          status:           p.status || "pending",
          createdAt:        p.created_at,

          firstNameNative:  a.first_name_native || "",
          lastNameNative:   a.last_name_native  || "",
          firstNameEn:      a.first_name_en     || "",
          lastNameEn:       a.last_name_en      || "",

          phone,
          whatsapp,

          province:         a.province_key || "—",
          city:             a.city_key     || "—",

          dob: (a.dob_day && a.dob_month && a.dob_year)
            ? `${a.dob_day}/${a.dob_month}/${a.dob_year}`
            : "—",

          categoryKey:      p.category_key         || "—",
          subcategoryKey:   p.subcategory_key       || "",
          otherProfNative:  p.other_profession_native || "",
          otherProfEn:      p.other_profession_en   || "",
          experienceKey:    p.experience_key        || "—",
          workTypeKey:      p.work_type_key         || "—",
          workAreaKey:      p.work_area_key         || "—",
          hasTools:         p.has_tools,

          profilePhoto:     p.profile_photo_url || null,
          workPhotos:       wpByProfile[p.id]   || [],
          tazkiraFiles:     docsByAccount[p.helper_account_id] || [],

          verificationStatus: a.verification_status || "pending",
        };
      });

      setHelpers(normalised);
    } catch (err) {
      console.error("[useHelpers]", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHelpers(); }, [fetchHelpers]);

  // Update one helper's status locally (avoids full refetch after action)
  const updateLocalStatus = useCallback((profileId, newStatus) => {
    setHelpers((prev) =>
      prev.map((h) =>
        h.profileId === profileId
          ? { ...h, status: newStatus, verificationStatus: newStatus }
          : h
      )
    );
  }, []);

  // Remove one helper locally after deletion
  const removeLocal = useCallback((profileId) => {
    setHelpers((prev) => prev.filter((h) => h.profileId !== profileId));
  }, []);

  return { helpers, loading, error, refetch: fetchHelpers, updateLocalStatus, removeLocal };
}
