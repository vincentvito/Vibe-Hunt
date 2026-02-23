import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .limit(1)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    const ext = file.name.split(".").pop() ?? "jpg";
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
