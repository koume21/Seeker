CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Post" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("content", '')), 'B')
  ) STORED;

CREATE INDEX "Post_search_vector_gin_idx" ON "Post" USING GIN ("search_vector");

CREATE INDEX "Post_title_trgm_idx" ON "Post" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Post_content_trgm_idx" ON "Post" USING GIN ("content" gin_trgm_ops);
