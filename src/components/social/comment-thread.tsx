"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Reply } from "lucide-react";
import { createComment } from "@/server/actions/comments";
import { useAuth } from "@clerk/nextjs";
import { cn, timeAgo } from "@/lib/utils";
import { CommentForm } from "./comment-form";

type Comment = {
  id: string;
  body: string;
  isEdited: boolean;
  parentId: string | null;
  depth: number;
  createdAt: Date;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
  replies: Comment[];
};

export function CommentThread({
  comments,
  gameId,
}: {
  comments: Comment[];
  gameId: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      <CommentForm gameId={gameId} />

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} gameId={gameId} />
        ))}
        {comments.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  gameId,
}: {
  comment: Comment;
  gameId: string;
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className={cn("space-y-3", comment.depth > 0 && "ml-6 border-l border-border pl-4")}>
      <div className="rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${comment.userUsername}`} className="flex items-center gap-2">
            {comment.userAvatar ? (
              <Image
                src={comment.userAvatar}
                alt={comment.userName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted" />
            )}
            <span className="text-sm font-medium hover:text-primary">
              {comment.userName}
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>
        <p className="mt-2 text-sm">{comment.body}</p>
        {comment.depth < 3 && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        )}
      </div>

      {showReply && (
        <div className="ml-4">
          <CommentForm
            gameId={gameId}
            parentId={comment.id}
            onSuccess={() => setShowReply(false)}
            compact
          />
        </div>
      )}

      {comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} gameId={gameId} />
      ))}
    </div>
  );
}
