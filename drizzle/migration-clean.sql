CREATE TYPE "public"."asset_type" AS ENUM('full_ip', 'codebase_only', 'assets_only', 'codebase_and_assets', 'license_only');
CREATE TYPE "public"."bid_status" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE "public"."bounty_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE "public"."game_engine" AS ENUM('unity_webgl', 'godot_web', 'custom_wasm', 'html5_canvas', 'playcanvas', 'phaserjs', 'threejs', 'other');
CREATE TYPE "public"."game_status" AS ENUM('draft', 'in_review', 'published', 'archived', 'suspended');
CREATE TYPE "public"."license_type" AS ENUM('free', 'attribution', 'commercial', 'restricted');
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'under_offer', 'sold', 'withdrawn');
CREATE TYPE "public"."notification_type" AS ENUM('upvote', 'comment', 'comment_reply', 'new_follower', 'offer_received', 'offer_accepted', 'offer_rejected', 'escrow_released', 'bounty_bid', 'bounty_accepted', 'daily_featured', 'remix_created');
CREATE TYPE "public"."offer_status" AS ENUM('pending', 'accepted', 'rejected', 'countered', 'in_escrow', 'escrow_released', 'disputed', 'cancelled', 'expired');
CREATE TYPE "public"."prompt_source" AS ENUM('cursor', 'claude', 'chatgpt', 'copilot', 'v0', 'bolt', 'replit', 'windsurf', 'other');
CREATE TYPE "public"."user_role" AS ENUM('creator', 'buyer', 'admin');
CREATE TABLE "bounties" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text[] DEFAULT '{}' NOT NULL,
	"budget" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"deadline" timestamp,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" "bounty_status" DEFAULT 'open' NOT NULL,
	"requester_id" text NOT NULL,
	"accepted_bid_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bounties_accepted_bid_id_unique" UNIQUE("accepted_bid_id")
);

CREATE TABLE "bounty_bids" (
	"id" text PRIMARY KEY NOT NULL,
	"bounty_id" text NOT NULL,
	"bidder_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"estimated_days" integer NOT NULL,
	"proposal" text NOT NULL,
	"portfolio_links" text[] DEFAULT '{}' NOT NULL,
	"status" "bid_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bounty_bids_bounty_bidder_unique" UNIQUE("bounty_id","bidder_id")
);

CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"parent_id" text,
	"depth" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "daily_features" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"date" date NOT NULL,
	"rank" integer NOT NULL,
	"upvotes_at_end" integer NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"staff_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_features_date_unique" UNIQUE("date")
);

CREATE TABLE "follows" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follows_unique" UNIQUE("follower_id","following_id")
);

CREATE TABLE "game_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"date" date NOT NULL,
	"plays" integer DEFAULT 0 NOT NULL,
	"unique_players" integer DEFAULT 0 NOT NULL,
	"avg_session_seconds" integer DEFAULT 0 NOT NULL,
	"total_session_seconds" integer DEFAULT 0 NOT NULL,
	"bounce_rate" numeric(5, 4),
	"returning_players" integer DEFAULT 0 NOT NULL,
	"day1_retention" numeric(5, 4),
	"analytics_provider" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"raw_payload" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_stats_game_date_unique" UNIQUE("game_id","date")
);

CREATE TABLE "game_tags" (
	"game_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "game_tags_game_id_tag_id_pk" PRIMARY KEY("game_id","tag_id")
);

CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"engine" "game_engine" NOT NULL,
	"status" "game_status" DEFAULT 'draft' NOT NULL,
	"web_build_url" text,
	"web_build_storage" text,
	"build_size_bytes" bigint,
	"iframe_allowed" boolean DEFAULT true NOT NULL,
	"thumbnail_url" text,
	"cover_image_url" text,
	"video_url" text,
	"website_url" text,
	"source_code_url" text,
	"made_with_ai" boolean DEFAULT false NOT NULL,
	"ai_tools_used" text[] DEFAULT '{}' NOT NULL,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"launch_date" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" text NOT NULL,
	"remixed_from_id" text,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);

CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"asking_price" numeric(12, 2) NOT NULL,
	"minimum_offer" numeric(12, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"included_assets" text[] DEFAULT '{}' NOT NULL,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"description" text NOT NULL,
	"transfer_method" text,
	"monthly_revenue" numeric(12, 2),
	"total_downloads" integer,
	"monthly_users" integer,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "listings_game_id_unique" UNIQUE("game_id")
);

CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"message" text,
	"counter_amount" numeric(12, 2),
	"status" "offer_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"platform_fee_amount" numeric(12, 2),
	"escrow_entered_at" timestamp,
	"escrow_released_at" timestamp,
	"escrow_deadline" timestamp,
	"delivery_confirmed_by_buyer" boolean DEFAULT false NOT NULL,
	"delivery_confirmed_by_seller" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "offers_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);

CREATE TABLE "prompt_histories" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"uploader_id" text NOT NULL,
	"title" text NOT NULL,
	"source" "prompt_source" NOT NULL,
	"prompt_count" integer NOT NULL,
	"token_count" integer,
	"file_url" text NOT NULL,
	"file_hash" text NOT NULL,
	"summary" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "screenshots" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"game_id" text NOT NULL
);

CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);

CREATE TABLE "template_licenses" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"license_type" "license_type" NOT NULL,
	"price" numeric(10, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"terms" text,
	"allow_commercial" boolean DEFAULT false NOT NULL,
	"require_attribution" boolean DEFAULT true NOT NULL,
	"max_remixes" integer,
	"remix_count" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "template_licenses_game_id_unique" UNIQUE("game_id")
);

CREATE TABLE "template_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"license_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"amount_paid" numeric(10, 2) NOT NULL,
	"stripe_payment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "template_purchases_stripe_payment_id_unique" UNIQUE("stripe_payment_id"),
	CONSTRAINT "template_purchases_license_buyer_unique" UNIQUE("license_id","buyer_id")
);

CREATE TABLE "upvotes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "upvotes_user_game_unique" UNIQUE("user_id","game_id")
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"website_url" text,
	"github_url" text,
	"twitter_url" text,
	"discord_handle" text,
	"role" "user_role" DEFAULT 'creator' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"stripe_account_id" text,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_stripe_account_id_unique" UNIQUE("stripe_account_id")
);

ALTER TABLE "bounties" ADD CONSTRAINT "bounties_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bounty_bids" ADD CONSTRAINT "bounty_bids_bounty_id_bounties_id_fk" FOREIGN KEY ("bounty_id") REFERENCES "public"."bounties"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bounty_bids" ADD CONSTRAINT "bounty_bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_features" ADD CONSTRAINT "daily_features_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_tags" ADD CONSTRAINT "game_tags_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_tags" ADD CONSTRAINT "game_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "games" ADD CONSTRAINT "games_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "listings" ADD CONSTRAINT "listings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "offers" ADD CONSTRAINT "offers_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prompt_histories" ADD CONSTRAINT "prompt_histories_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prompt_histories" ADD CONSTRAINT "prompt_histories_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "template_licenses" ADD CONSTRAINT "template_licenses_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "template_purchases" ADD CONSTRAINT "template_purchases_license_id_template_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."template_licenses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "bounties_status_created_idx" ON "bounties" USING btree ("status","created_at");
CREATE INDEX "bounties_requester_id_idx" ON "bounties" USING btree ("requester_id");
CREATE INDEX "bounty_bids_bounty_status_idx" ON "bounty_bids" USING btree ("bounty_id","status");
CREATE INDEX "comments_game_created_idx" ON "comments" USING btree ("game_id","created_at");
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");
CREATE INDEX "daily_features_date_rank_idx" ON "daily_features" USING btree ("date","rank");
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");
CREATE INDEX "game_stats_game_date_idx" ON "game_stats" USING btree ("game_id","date");
CREATE INDEX "games_creator_id_idx" ON "games" USING btree ("creator_id");
CREATE INDEX "games_status_launch_idx" ON "games" USING btree ("status","launch_date");
CREATE UNIQUE INDEX "games_slug_idx" ON "games" USING btree ("slug");
CREATE INDEX "games_upvote_count_idx" ON "games" USING btree ("upvote_count");
CREATE INDEX "listings_status_price_idx" ON "listings" USING btree ("status","asking_price");
CREATE INDEX "listings_seller_id_idx" ON "listings" USING btree ("seller_id");
CREATE INDEX "notifications_user_read_created_idx" ON "notifications" USING btree ("user_id","is_read","created_at");
CREATE INDEX "offers_listing_status_idx" ON "offers" USING btree ("listing_id","status");
CREATE INDEX "offers_buyer_id_idx" ON "offers" USING btree ("buyer_id");
CREATE INDEX "offers_seller_id_idx" ON "offers" USING btree ("seller_id");
CREATE INDEX "prompt_histories_game_sort_idx" ON "prompt_histories" USING btree ("game_id","sort_order");
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
CREATE INDEX "upvotes_game_date_idx" ON "upvotes" USING btree ("game_id","date");
CREATE INDEX "upvotes_user_id_idx" ON "upvotes" USING btree ("user_id");
CREATE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");