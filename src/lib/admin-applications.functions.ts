import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden: admin access required");
}

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("tutor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { applications: data ?? [] };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(STATUSES),
      admin_notes: z.string().max(2000).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch: { status: Status; admin_notes?: string | null } = { status: data.status };
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes ?? null;
    const { error } = await context.supabase
      .from("tutor_applications")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getResumeSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resume_url: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // resume_url may be a full public URL or a storage path. Extract path after bucket.
    let path = data.resume_url;
    const marker = "/tutor-resumes/";
    const idx = path.indexOf(marker);
    if (idx >= 0) path = path.slice(idx + marker.length);
    const { data: signed, error } = await context.supabase.storage
      .from("tutor-resumes")
      .createSignedUrl(path, 60 * 10);
    if (error || !signed) throw new Error(error?.message ?? "Could not create signed URL");
    return { url: signed.signedUrl };
  });

export type ApplicationStatus = Status;