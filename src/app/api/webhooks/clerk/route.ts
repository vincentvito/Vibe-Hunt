import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabase } from "@/server/db";
import { nanoid } from "nanoid";

type WebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
  };
};

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const email = data.email_addresses[0]?.email_address ?? "";
    const username = data.username ?? data.id;
    const displayName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || username;

    await supabase.from("users").insert({
      id: nanoid(),
      clerk_id: data.id,
      email,
      username,
      display_name: displayName,
      avatar_url: data.image_url,
    });
  }

  if (type === "user.updated") {
    const email = data.email_addresses[0]?.email_address ?? "";
    const username = data.username ?? data.id;
    const displayName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || username;

    await supabase
      .from("users")
      .update({
        email,
        username,
        display_name: displayName,
        avatar_url: data.image_url,
      })
      .eq("clerk_id", data.id);
  }

  if (type === "user.deleted") {
    await supabase.from("users").delete().eq("clerk_id", data.id);
  }

  return NextResponse.json({ success: true });
}
