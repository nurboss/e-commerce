import { supabaseAdmin, supabaseBrowser } from "@/lib/supabase";

const BUCKET = "ecommerce";

export const getPublicUrl = (path: string) => {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path: string) => {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
};

export const uploadFile = async (file: File, folder: string) => {
  const ext = file.name.split(".").pop() ?? "bin";
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseBrowser.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  return { path: filePath, url: getPublicUrl(filePath) };
};
