import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createServerClient();
    const { data: { user: authUser } } = await supabaseAuth.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .limit(1)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: "Please complete your profile to continue." },
        { status: 403 }
      );
    }

    const rl = await rateLimit(`upload:${user.id}`, {
      maxRequests: 20,
      windowMs: 60_000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a moment." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extMap[file.type] ?? "jpg";
    const fileName = `${type}_${nanoid(8)}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("game-media")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("game-media")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl, path: filePath });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
