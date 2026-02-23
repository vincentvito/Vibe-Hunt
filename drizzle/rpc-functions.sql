-- RPC functions for VibeHunt (run this in Supabase SQL editor after the schema)

-- ============================================================================
-- Hot feed ranking
-- ============================================================================

CREATE OR REPLACE FUNCTION get_hot_feed(sort_mode TEXT DEFAULT 'hot', result_limit INT DEFAULT 50)
RETURNS TABLE (
  id TEXT,
  slug TEXT,
  title TEXT,
  tagline TEXT,
  engine game_engine,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  web_build_url TEXT,
  made_with_ai BOOLEAN,
  ai_tools_used TEXT[],
  upvote_count INT,
  comment_count INT,
  play_count INT,
  launch_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  creator_id TEXT,
  creator_display_name TEXT,
  creator_username TEXT,
  creator_avatar_url TEXT,
  hot_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id, g.slug, g.title, g.tagline, g.engine,
    g.thumbnail_url, g.cover_image_url, g.web_build_url,
    g.made_with_ai, g.ai_tools_used,
    g.upvote_count, g.comment_count, g.play_count,
    g.launch_date, g.published_at,
    g.creator_id,
    u.display_name AS creator_display_name,
    u.username AS creator_username,
    u.avatar_url AS creator_avatar_url,
    CASE
      WHEN sort_mode = 'hot' THEN
        (g.upvote_count + 1)::FLOAT / POWER(
          (EXTRACT(EPOCH FROM (NOW() - g.published_at)) / 3600.0) + 2.0,
          1.8
        )
      ELSE 0.0
    END AS hot_score
  FROM games g
  JOIN users u ON u.id = g.creator_id
  WHERE g.status = 'published'
  ORDER BY
    CASE
      WHEN sort_mode = 'hot' THEN
        (g.upvote_count + 1)::FLOAT / POWER(
          (EXTRACT(EPOCH FROM (NOW() - g.published_at)) / 3600.0) + 2.0,
          1.8
        )
    END DESC NULLS LAST,
    CASE WHEN sort_mode = 'new' THEN g.published_at END DESC NULLS LAST,
    CASE WHEN sort_mode = 'top' THEN g.upvote_count END DESC NULLS LAST,
    g.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Full-text search
-- ============================================================================

-- Step 1: Add tsvector column to games
ALTER TABLE games ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS games_search_vector_idx ON games USING GIN (search_vector);

-- Step 3: Function to build search vector from game fields + tags
CREATE OR REPLACE FUNCTION games_update_search_vector()
RETURNS trigger AS $$
DECLARE
  tag_names TEXT;
BEGIN
  SELECT string_agg(t.name, ' ')
  INTO tag_names
  FROM game_tags gt
  JOIN tags t ON t.id = gt.tag_id
  WHERE gt.game_id = NEW.id;

  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(tag_names, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Trigger on games insert/update
DROP TRIGGER IF EXISTS games_search_vector_trigger ON games;
CREATE TRIGGER games_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, tagline ON games
  FOR EACH ROW
  EXECUTE FUNCTION games_update_search_vector();

-- Step 5: Backfill existing games
UPDATE games SET title = title WHERE TRUE;

-- Step 6: Update search vector when game_tags change
CREATE OR REPLACE FUNCTION game_tags_update_search_vector()
RETURNS trigger AS $$
DECLARE
  affected_game_id TEXT;
BEGIN
  affected_game_id := COALESCE(NEW.game_id, OLD.game_id);
  UPDATE games SET updated_at = NOW() WHERE id = affected_game_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS game_tags_search_trigger ON game_tags;
CREATE TRIGGER game_tags_search_trigger
  AFTER INSERT OR DELETE ON game_tags
  FOR EACH ROW
  EXECUTE FUNCTION game_tags_update_search_vector();

-- Step 7: Search RPC function
CREATE OR REPLACE FUNCTION search_games(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  id TEXT,
  slug TEXT,
  title TEXT,
  tagline TEXT,
  engine game_engine,
  thumbnail_url TEXT,
  web_build_url TEXT,
  made_with_ai BOOLEAN,
  upvote_count INT,
  comment_count INT,
  play_count INT,
  published_at TIMESTAMPTZ,
  creator_id TEXT,
  creator_display_name TEXT,
  creator_username TEXT,
  creator_avatar_url TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id, g.slug, g.title, g.tagline, g.engine,
    g.thumbnail_url, g.web_build_url, g.made_with_ai,
    g.upvote_count, g.comment_count, g.play_count,
    g.published_at,
    g.creator_id,
    u.display_name AS creator_display_name,
    u.username AS creator_username,
    u.avatar_url AS creator_avatar_url,
    ts_rank(g.search_vector, websearch_to_tsquery('english', search_query))::FLOAT AS rank
  FROM games g
  JOIN users u ON u.id = g.creator_id
  WHERE g.status = 'published'
    AND g.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC, g.upvote_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Counter functions
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_upvote(game_id_input TEXT)
RETURNS void AS $$
  UPDATE games SET upvote_count = upvote_count + 1 WHERE id = game_id_input;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_upvote(game_id_input TEXT)
RETURNS void AS $$
  UPDATE games SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = game_id_input;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_comment(game_id_input TEXT)
RETURNS void AS $$
  UPDATE games SET comment_count = comment_count + 1 WHERE id = game_id_input;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_comment(game_id_input TEXT)
RETURNS void AS $$
  UPDATE games SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = game_id_input;
$$ LANGUAGE sql;
