-- RPC functions for counter updates (run this in Supabase SQL editor after the schema)

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
