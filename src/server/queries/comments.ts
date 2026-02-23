import { supabase } from "@/server/db";

export async function getGameComments(gameId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id, body, is_edited, parent_id, depth, created_at, user_id,
        users ( display_name, username, avatar_url )
      `
      )
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getGameComments error:", error.message);
      return [];
    }
    if (!data) return [];

    const allComments = data.map((c: any) => ({
      id: c.id,
      body: c.body,
      isEdited: c.is_edited,
      parentId: c.parent_id,
      depth: c.depth,
      createdAt: c.created_at,
      userId: c.user_id,
      userName: c.users?.display_name ?? "Unknown",
      userUsername: c.users?.username ?? "unknown",
      userAvatar: c.users?.avatar_url ?? null,
    }));

    // Build threaded structure
    type CommentWithReplies = (typeof allComments)[number] & {
      replies: CommentWithReplies[];
    };

    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    for (const comment of allComments) {
      const withReplies = { ...comment, replies: [] };
      commentMap.set(comment.id, withReplies);
    }

    for (const comment of allComments) {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(node);
        }
      } else {
        rootComments.push(node);
      }
    }

    return rootComments;
  } catch (err) {
    console.error("getGameComments unexpected error:", err);
    return [];
  }
}
