import { supabase } from "./supabase";

export async function uploadClubImage(file: File, ownerId: string, kind: "cover" | "logo") {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${ownerId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("club-media").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg"
  });
  if (error) return { url: null, error };
  const { data } = supabase.storage.from("club-media").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
