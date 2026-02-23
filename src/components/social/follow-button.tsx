"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toggleFollow } from "@/server/actions/follows";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
};

export function FollowButton({
  targetUserId,
  initialFollowing,
}: FollowButtonProps) {
  const { isSignedIn } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) return;

    const prev = following;
    setFollowing(!following);

    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (!result.success) {
        setFollowing(prev);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || !isSignedIn}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
        following
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
        isPending && "opacity-50"
      )}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </button>
  );
}
